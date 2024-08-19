import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getFirestore, doc, collection, addDoc, setDoc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


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
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log('Created user');

                const userUid = user.uid;

                const account = {
                    useruid: userUid,
                    LeftHTML: htmlData
                }

                setDoc(doc(db, 'accounts', userUid), account)
                    .then(() => {
                        console.log("Document successfully written!");
                        window.location.href = APP_PAGE;
                    })
                    .catch((error) => {
                        console.error("Error writing document: ", error);
                    });
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
            const response = await fetch('http://localhost:3000/api/chatCompletion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: input })
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

            const user = auth.currentUser;
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

async function handleResponse(accepted, htmlContent) {
    if (accepted) {
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, "accounts", user.uid);

            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const currentLeftHTML = userData.LeftHTML || '';
                    const newLeftHTML = currentLeftHTML + htmlContent;

                    await updateDoc(userDocRef, { LeftHTML: newLeftHTML });
                    console.log("LeftHTML updated successfully");

                    // Notify the left iframe to update its content
                    const leftFrame = document.getElementById('leftFrame');
                    if (leftFrame && leftFrame.contentWindow) {
                        leftFrame.contentWindow.postMessage('updateContent', '*');
                    } else {
                        console.error("Left iframe not found or not accessible");
                    }
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