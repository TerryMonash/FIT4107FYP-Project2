const dotenv = require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
const cors = require('cors');
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
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: req.body.message
                }]
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