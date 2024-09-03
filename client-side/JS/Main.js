import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import {
    getFirestore,
    doc,
    collection,
    addDoc,
    setDoc,
    getDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyC08ZzFONNjJWqK88YdXTPNL04WDDLyHG8",
    authDomain: "adaptive-ui-webpage.firebaseapp.com",
    projectId: "adaptive-ui-webpage",
    storageBucket: "adaptive-ui-webpage.appspot.com",
    messagingSenderId: "986887743719",
    appId: "1:986887743719:web:e1eb993352fb3edd1b9a42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();
const storage = getStorage();

const APP_PAGE = "../Chatbot/Page.html";

const htmlData = (
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Left Section</title>
        <style>
            body {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                padding: 20px;
            }
            nav ul {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
            }
            nav ul li {
                padding: 10px;
                background-color: #ddd;
                margin-right: 5px;
            }
            nav ul li:hover {
                background-color: #ccc;
            }
            .square-box {
                width: 500px;
                height: 200px;
                background-color: yellow;
                margin-top: 20px;
            }
            h2 {
                font-family: 'Arial', sans-serif;
                font-size: 24px;
                font-weight: bold;
                color: #333;
            }
        </style>
    </head>
    <body>
        <nav>
            <ul>
                <li>Home</li>
                <li>About</li>
                <li>Profile</li>
                <li>Settings</li>
            </ul>
        </nav>
        <h1>Left Section (For elements to play around with)</h1>
        <h2>Different header to play around with</h2>
        <p>
            THIS WAS FETCHED FROM FIREBASE!
        </p>
        <div class="square-box"></div>
    </body>
    </html>
`
)

if (document.getElementById('login-submit') != null) {
    const loginSubmit = document.getElementById('login-submit');
    loginSubmit.addEventListener("click", (event) => {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log('Logging in  user');
                window.location.href = APP_PAGE;
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);
                // ..
            });
    });
}

if (document.getElementById('register-submit') != null) {
    const registerSubmit = document.getElementById('register-submit');
    registerSubmit.addEventListener("click", (event) => {
        event.preventDefault();

        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                console.log('Created user');

                const userUid = user.uid;

                const account = {
                    useruid: userUid,
                    currentLeftHTMLVersion: 1,
                    currentLeftHTML: htmlData
                }

                await setDoc(doc(db, 'accounts', userUid), account);

                // Add initial version to leftHTML_versions subcollection
                const versionsCollectionRef = collection(db, "accounts", userUid, "leftHTML_versions");
                await addDoc(versionsCollectionRef, {
                    html: htmlData,
                    timestamp: serverTimestamp()
                });

                window.location.href = APP_PAGE;
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);
            });
    });
}

if (document.getElementById("chatbotForm") != null) {
    document.getElementById("chatbotForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        let input = document.getElementById("chatbotInput").value;
        let responseElement = document.getElementById("response");
        let loadingElement = document.getElementById("loading");

        responseElement.innerHTML = "";
        loadingElement.style.display = "block"; // Show loading indicator

        try {
            const user = auth.currentUser;

            if (!user) {
                throw new Error("No user is signed in.");
            }

            // Fetch the latest HTML version
            const userDocRef = doc(db, "accounts", user.uid);
            const docSnap = await getDoc(userDocRef);
            if (!docSnap.exists()) {
                throw new Error("User document not found.");
            }
            const latestHTML = docSnap.data().currentLeftHTML;

            // Send both the user input and the latest HTML to the AI
            const response = await fetch('http://localhost:3000/api/chatCompletion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: input,
                    currentHTML: latestHTML
                })
            });

            const data = await response.json();
            const htmlContent = data.choices[0].message.content;

            // Insert HTML content into the response element
            responseElement.innerHTML = htmlContent;
            console.log(htmlContent);

            // Extract and execute any script elements
            const scripts = responseElement.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                const script = scripts[i];
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.innerHTML = script.innerHTML;
                }
                document.body.appendChild(newScript);
            }

            // Add accept/deny options
            const optionsDiv = document.createElement('div');
            optionsDiv.innerHTML = `
                <button id="acceptResponse">Accept Response</button>
                <button id="denyResponse">Deny Response</button>
            `;
            responseElement.appendChild(optionsDiv);

            // Add event listeners for accept/deny buttons
            document.getElementById('acceptResponse').addEventListener('click', () => handleResponse(true, htmlContent));
            document.getElementById('denyResponse').addEventListener('click', () => handleResponse(false, htmlContent));

            if (user) {
                const userId = user.uid;

                const promptsCollectionRef = collection(db, "user_data", userId, "prompts");

                let codeStorageUrl = null;
                if (htmlContent.length > 1000000) {
                    const codeRef = ref(storage, `user_data/${userId}/generatedCode.html`);
                    await uploadString(codeRef, htmlContent, 'raw', { contentType: 'text/html' });
                    codeStorageUrl = await getDownloadURL(codeRef);
                }

                try {
                    await addDoc(promptsCollectionRef, {
                        prompt: input,
                        generatedCode: codeStorageUrl ? null : htmlContent,
                        codeStorageUrl: codeStorageUrl,
                        timestamp: Date.now()
                    });

                    console.log('Data has been saved!');
                } catch (error) {
                    console.error('Error saving data:', error);
                }
            } else {
                console.log("Data was not saved! Try making sure you're logged in!");
            }

        } catch (error) {
            responseElement.innerHTML = 'Error: ' + error.message;
        } finally {
            loadingElement.style.display = "none"; // Hide loading indicator
        }
    });
}

let leftFrameLoadAttempts = 0;

async function handleResponse(accepted, htmlContent) {
    if (accepted) {
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, "accounts", user.uid);

            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const previousHTML = docSnap.data().currentLeftHTML;
                    const previousVersion = docSnap.data().currentLeftHTMLVersion || 0;

                    const versionsCollectionRef = collection(db, "accounts", user.uid, "leftHTML_versions");

                    // Save the previous version
                    await addDoc(versionsCollectionRef, {
                        html: previousHTML,
                        timestamp: serverTimestamp()
                    });

                    // Update with the new HTML and increment version
                    await updateDoc(userDocRef, {
                        currentLeftHTMLVersion: previousVersion + 1,
                        currentLeftHTML: htmlContent
                    });

                    console.log("LeftHTML updated successfully");

                    // Notify the left iframe to update its content
                    notifyLeftFrame();
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        } else {
            console.log("No user is signed in.");
        }
    } else {
        console.log("Response denied");
    }
}

document.getElementById('revertButton').addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) {
        const versionsCollectionRef = collection(db, "accounts", user.uid, "leftHTML_versions");
        const versionsQuery = query(versionsCollectionRef, orderBy('timestamp', 'desc'), limit(1));
        const versionsSnapshot = await getDocs(versionsQuery);

        if (!versionsSnapshot.empty) {
            const lastVersionDoc = versionsSnapshot.docs[0];
            const lastVersionDocRef = lastVersionDoc.ref;
            const previousHTML = lastVersionDoc.data().html;

            const userDocRef = doc(db, "accounts", user.uid);

            // Update the main document to point to the previous version
            await updateDoc(userDocRef, {
                currentLeftHTML: previousHTML
            });

            // Delete the reverted version from the leftHTML_versions collection
            await deleteDoc(lastVersionDocRef);

            console.log("LeftHTML reverted and version deleted successfully");

            // Notify the left iframe to update its content
            notifyLeftFrame();

            // Recheck if there are more previous versions
            const newVersionsSnapshot = await getDocs(versionsCollectionRef);
            if (newVersionsSnapshot.size <= 1) {
                // Hide the revert button if there's only one or no versions left
                document.getElementById('revertButton').style.display = 'none';
            }
        } else {
            // Display pop-up if no previous versions found
            alert("No previous versions available to revert to.");
        }
    } else {
        console.log("No user is signed in.");
    }
});

function notifyLeftFrame() {
    if (window.leftFrameLoaded) {
        const leftFrame = document.getElementById('leftFrame');
        if (leftFrame && leftFrame.contentWindow) {
            leftFrame.contentWindow.postMessage('updateContent', '*');
        } else {
            console.error("Left iframe not found or not accessible");
        }
    } else {
        leftFrameLoadAttempts++;
        if (leftFrameLoadAttempts < 10) {  // Try for about 5 seconds
            setTimeout(notifyLeftFrame, 500);
        } else {
            console.error("Left iframe failed to load after multiple attempts");
        }
    }
}

// Reset attempts when the page loads
window.addEventListener('load', () => {
    leftFrameLoadAttempts = 0;
});
