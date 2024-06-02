# FIT4107FYP-Project2

Dependencies needed to run the project locally:
<ol>
  <li> <h3> NodeJS </h3> </li>
    <ol>
      <li> Please follow the instructions outlined here to download: https://nodejs.org/en </li>
    </ol>
  <li> <h3> .env file </h3> </li> 
    <ol>
      <li> This file contains the API key needed to make calls to ChatGPT </li>
      <li> Please use this link to download the .env file: https://drive.google.com/file/d/1lY0bvC4t8GwNUMwA-ZcsvcVzj8nm-cCB/view?usp=drive_link </li>
      <li> Simply copy the OPENAI_API_KEY to the .env-example file and then remove the "-example" part of the file name </li>
      <li> If there is any error in recogniZing the key from the .env file, it may need to be added to the ~/.bashrc file. Just copy paste the OPENAI_API_KEY line from the .env file into the ~/.bashrc file </li>
    </ol>
  <li> <h3> Live Server VS-Code extenstion to run HTML on browser </h3> </li>
    <ol>
      <li> Link: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer </li>
      <li> Just select Page.html and click the "Go Live" button on the bottom right </li>
      <li> Alternatively, can just drag Page.html in the browser or enter the file location in the url section of the browser (e.g, like file:///c%3A/Users/"Your Name"/Desktop//FYP/Github%20Projects/FIT4107FYP-Project2/Page.html) </li>
    </ol>
</ol>


To run the back-end / server that connects to the ChatGPT API, please run `cd server-side` in the project terminal.
Then run `npm install` and `node server.js` to launch the server.

Then simply press the Submit button on the Page.html in the browser along with any query.
