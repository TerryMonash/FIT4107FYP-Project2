const dotenv = require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const fs = require('fs');

const htmlData = fs.readFileSync(
    '.././Left.html',
    'utf-8'
)
const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(express.json());
app.use(cors());

app.post('/api/chatCompletion', async (req, res) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env['OPENAI_API_KEY']}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a chatbot on the Right Hand Side of a website that listens to various adaptations/changes that a user wants to do on the Left Hand Side of the website. You will be provided with some HTML code and you are required to output the same HTML code with the appropriate changes that will be added to the Left Hand Side."
                    },
                    {
                        role: "system",
                        content:
                            "It is VERY important that you ONLY give the provided HTML code with the changes as your response as your response will directly be added to the Left Hand Side of the website. DO NOT output anything but that. You are to provide the entire code given to you with the requested changes and not just the changes by themselves."
                    },
                    {
                        role: "system",
                        content:
                            "The code you provide will be shown to the user on the right hand side of the website in contrast to the left hand side being normal. Which is why it is VERY important to return the entire code WITH the requested changes and NOT just the required changes"
                    },
                    {
                        role: "system",
                        content:
                            "The HTML Code is:" + htmlData
                    },
                    {
                        role: "user",
                        content: req.body.message
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorInfo = await response.text();
            throw new Error(`API call failed with status ${response.status}: ${errorInfo}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Fetch error:', error.message);
        res.status(500).send('An error occurred: ' + error.message);
    }
});
