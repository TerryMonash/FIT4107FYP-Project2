import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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
const db = getFirestore(app);

function updateContent() {
    const user = auth.currentUser;
    if (user) {
        const userDocRef = doc(db, "accounts", user.uid);

        getDoc(userDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const leftHTML = userData.LeftHTML;
                document.getElementById('leftContent').innerHTML = leftHTML;
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    } else {
        console.log("No user is signed in.");
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        updateContent();
    } else {
        console.log("No user is signed in.");
    }
});

// Listen for messages from the parent window
window.addEventListener('message', (event) => {
    if (event.data === 'updateContent') {
        updateContent();
    }
}, false);