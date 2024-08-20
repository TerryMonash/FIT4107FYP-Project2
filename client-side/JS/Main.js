import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js"
import { getFirestore, doc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"


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
                console.log('Creating user');
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

            const user = auth.currentUser;
            if (user) {
                const userId = user.uid;

                // Corrected the typo in the storage path ("user_date" -> "user_data")
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
        } catch (error) {
            responseElement.innerHTML = 'Error: ' + error.message;
        } finally {
            loadingElement.style.display = "none"; // Hide loading indicator
        }
    });
}