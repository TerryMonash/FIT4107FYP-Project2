import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC08ZzFONNjJWqK88YdXTPNL04WDDLyHG8",
  authDomain: "adaptive-ui-webpage.firebaseapp.com",
  projectId: "adaptive-ui-webpage",
  storageBucket: "adaptive-ui-webpage.appspot.com",
  messagingSenderId: "986887743719",
  appId: "1:986887743719:web:e1eb993352fb3edd1b9a42"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };