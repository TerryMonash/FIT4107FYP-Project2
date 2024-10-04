# FIT4107FYP-Project2

Dependencies needed to run the project locally:

1. ### NodeJS

   - Please follow the instructions outlined here to download: https://nodejs.org/en

2. ### .env file

   - This file contains the API key needed to make calls to ChatGPT
   - Please use this link to download the .env file: https://drive.google.com/file/d/1lY0bvC4t8GwNUMwA-ZcsvcVzj8nm-cCB/view?usp=drive_link
   - Simply copy the OPENAI_API_KEY to the .env-example file and then remove the "-example" part of the file name
   - If there is any error in recognizing the key from the .env file, it may need to be added to the ~/.bashrc file. Just copy paste the OPENAI_API_KEY line from the .env file into the ~/.bashrc file

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

Note: Make sure both the backend server and the Next.js frontend are running simultaneously for the application to work properly.
