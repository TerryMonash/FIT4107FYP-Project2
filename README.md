# FIT4107FYP-Project2

Dependencies needed to run the project locally:

1. ### NodeJS

   - Please follow the instructions outlined here to download: https://nodejs.org/en

2. ### .env file

   - This file contains the API keys needed to make calls to ChatGPT and Firebase
   - Create an OpenAI account and get your API key from here: https://platform.openai.com/api-keys
   - Create a Firebase project and get your configuration details (see Firebase setup instructions below)
   - Copy the OPENAI_API_KEY and Firebase configuration details to the .env-example file and then remove the "-example" part of the file name
   - If there is any error in recognizing the keys from the .env file, they may need to be added to the ~/.bashrc file (if using Linux or bash on Windows) or ~/.zshrc file (if using MacOS). Just copy paste the key lines from the .env file into the ~/.bashrc or ~/.zshrc file

3. ### Firebase Setup

   - Go to the Firebase Console (https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - In the project settings, add a new web app
   - Copy the Firebase configuration object
   - Add the configuration details to your .env file (see .env-example for format)
   - Enable Authentication in the Firebase Console and set up the desired sign-in methods (e.g., email/password)
   - Set up Firestore Database and Storage in the Firebase Console

To run the back-end / server that connects to the ChatGPT API:

1. Open the project terminal
2. Run `cd server-side`
3. Run `npm install`
4. Run `node server.js` to launch the server

To run the Next.js app in the my-conv-adap folder:

1. Open a new terminal window
2. Run `cd my-conv-adap-app`
3. Run `npm install`
4. Run `npm run dev` to start the development server
5. Open your browser and navigate to `http://localhost:3000` to view the app
6. Register a new account

Note: Make sure both the backend server and the Next.js frontend are running simultaneously for the application to work properly. Also, ensure that your Firebase project is properly configured with the necessary security rules for Firestore and Storage.
