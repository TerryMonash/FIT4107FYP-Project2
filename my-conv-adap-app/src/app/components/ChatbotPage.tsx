import React, { useState, useRef } from "react";
import {
  IconButton,
  TextField,
  Paper,
  Typography,
  Box,
  Modal,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";
import styles from "./ChatbotPage.module.css";

interface ChatbotPageProps {
  onClose: () => void;
}

const ChatbotPage: React.FC<ChatbotPageProps> = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = () => {
    // TODO: Implement chatbot logic here
    setResult(`You said: ${input}`);
    setInput("");
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          await transcribe(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribe = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      const response = await fetch("http://localhost:3001/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Transcription failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      setInput(result.text);
    } catch (error) {
      console.error("Error in transcription:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} className={styles.modal}>
      <Paper className={styles.chatbotPage}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="h4" gutterBottom>
          Chatbot
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            disabled={isRecording || isTranscribing}
          />
          <IconButton
            onClick={handleVoiceInput}
            color={isRecording ? "secondary" : "default"}
            disabled={isTranscribing}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
          <IconButton
            onClick={handleSubmit}
            disabled={!input || isRecording || isTranscribing}
          >
            <SendIcon />
          </IconButton>
        </Box>
        {isTranscribing && (
          <Typography variant="body2" color="textSecondary">
            Transcribing...
          </Typography>
        )}
        <Paper elevation={3} className={styles.resultSection}>
          <Typography variant="body1">{result}</Typography>
        </Paper>
      </Paper>
    </Modal>
  );
};

export default ChatbotPage;
