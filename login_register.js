
// Your web app's Firebase configuration
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

const auth = firebase.auth()
const database = firebase.database()

function validateEmail(email) {
    // Regular expression to check if email is valid
    var re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

function validatePassword(password) {
    // Check if password is at least 6 characters long
    return password.length >= 6;
}

function validateForm() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var valid = true;
    var errorMessage = "";

    if (!validateEmail(email)) {
        errorMessage += "Invalid email address.\n";
        valid = false;
    }

    if (!validatePassword(password)) {
        errorMessage += "Password must be at least 6 characters long.\n";
        valid = false;
    }

    if (!valid) {
        alert(errorMessage);
    }

    return valid;
}

function register() {
    if (validateForm() == false){
        return
    }
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, password)
    .then(function() {
        var user = auth.currentUser

        var database_ref = database.ref()

        var user_data = {
            email : email,
            last_login : Date.now()
        }

        database_ref.child('users/' + user.uid).set(user_data)


        alert('User Created')
    })
    .catch(function(error) {
        var error_code = error.code
        var error_message = error.message

        alert(error_message)
    })
}

function login() {
    if (validateForm() ==false){
        return
    }
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
    .then(function() {
        var user = auth.currentUser

        var database_ref = database.ref()

        var user_data = {
            last_login : Date.now()
        }

        database_ref.child('users/' + user.uid).update(user_data)


        alert('User Logged In')
    })
    .catch(function(error) {
        var error_code = error.code
        var error_message = error.message

        alert(error_message)
    })
}