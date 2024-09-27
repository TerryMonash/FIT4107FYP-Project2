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
        const { message, currentHTML, currentPage } = req.body;

        const systemMessages = [
            {
                role: "system",
                content: `You are an AI assistant integrated into a web application. Your role is to help users modify the content of their ${currentPage} page. You will receive the current HTML content and a user's request for changes. Your task is to update the HTML according to the user's instructions.`
            },
            {
                role: "system",
                content: "Guidelines for your responses:\n1. Only output the modified HTML code.\n2. Include the entire HTML document in your response, not just the changed parts.\n3. Do not include any explanations or comments outside the HTML code.\n4. Ensure your changes are syntactically correct and maintain the overall structure of the HTML."
            },
            {
                role: "system",
                content: "The changes you make will be reflected in real-time on the user's webpage. Accuracy and attention to detail are crucial."
            }
        ];

        const userMessage = {
            role: "user",
            content: `Current HTML for ${currentPage} page:\n\n${currentHTML}\n\nUser request: ${message}\n\nPlease modify the HTML based on this request. Return the entire updated HTML document, incorporating the requested changes while maintaining the overall structure and functionality of the page.`
        };


        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env['OPENAI_API_KEY']}`
            },
            body: JSON.stringify({
                model: "gpt-4o-2024-08-06",
                messages: [...systemMessages, userMessage],
                temperature: 0.2, // Lowered for more consistent outputs
                // Controls diversity of generated text (0.95 means consider top 95% of probability mass)
                top_p: 0.95,
                // Reduces repetition of similar phrases (-2.0 to 2.0, higher values decrease likelihood of repetition)
                frequency_penalty: 0.5,
                // Encourages model to talk about new topics (-2.0 to 2.0, higher values increase likelihood of new topics)
                presence_penalty: 0.5,
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
