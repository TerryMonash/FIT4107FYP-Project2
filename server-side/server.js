const dotenv = require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const { OpenAI } = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors(
    {
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
    }
)
);

app.use(express.json());

const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

app.post('/api/chatCompletion', async (req, res) => {
    try {
        const { message, currentHTML } = req.body;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env['OPENAI_API_KEY']}`
            },
            body: JSON.stringify({
                model: "gpt-4o-2024-08-06",
                messages: [
                    {
                        role: "system",
                        content: "You are a chatbot on the Right Hand Side of a website that listens to various adaptations/changes that a user wants to do on the Left Hand Side of the website. You will be provided with some HTML code and you are required to output the same HTML code with the appropriate changes that will be added to the Left Hand Side."
                    },
                    {
                        role: "system",
                        content: "It is VERY important that you ONLY give the provided HTML code with the changes as your response as your response will directly be added to the Left Hand Side of the website. DO NOT output anything but that. You are to provide the entire code given to you with the requested changes and not just the changes by themselves."
                    },
                    {
                        role: "system",
                        content: "The code you provide will be shown to the user on the right hand side of the website in contrast to the left hand side being normal. Which is why it is VERY important to return the entire code WITH the requested changes and NOT just the required changes"
                    },
                    {
                        role: "user",
                        content: `Current HTML:\n${currentHTML}\n\nUser request: ${message}\n\nPlease modify the HTML based on the user's request and return the entire updated HTML document.`
                    }
                ],
                temperature: 0.3
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

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    console.log('Received transcription request', new Date().toISOString());
    try {
        if (!req.file) {
            console.error('No audio file uploaded', new Date().toISOString());
            return res.status(400).json({ error: 'No audio file uploaded.' });
        }

        console.log('File received:', req.file.originalname, 'Size:', req.file.size, new Date().toISOString());

        const filePath = path.join(uploadsDir, req.file.filename);

        console.log('Starting OpenAI transcription', new Date().toISOString());
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
        });

        console.log('Transcription completed:', transcription, new Date().toISOString());

        // Clean up: delete the file after transcription
        fs.unlinkSync(filePath);

        console.log('Sending response to client', new Date().toISOString());
        res.json({ text: transcription.text });
    } catch (error) {
        console.error('Transcription error:', error, new Date().toISOString());
        res.status(500).json({ error: 'An error occurred during transcription: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
