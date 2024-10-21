import React, { useState, useRef, useEffect } from "react";
import {
  IconButton,
  TextField,
  Paper,
  Typography,
  Box,
  Modal,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";
import styles from "./ChatbotPage.module.css";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

interface ChatbotPageProps {
  onClose: () => void;
  currentPage: "dashboard" | "about";
  onContentUpdate: (page: "dashboard" | "about", newVersion: number) => void;
}

const ChatbotPage: React.FC<ChatbotPageProps> = ({
  onClose,
  currentPage,
  onContentUpdate,
}) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [pageContent, setPageContent] = useState<string>("");

  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  const [lastPrompt, setLastPrompt] = useState("");

  useEffect(() => {
    const fetchPageContent = async () => {
      if (user) {
        const accountRef = doc(db, "accounts", user.uid);
        const accountSnap = await getDoc(accountRef);

        if (accountSnap.exists()) {
          const accountData = accountSnap.data();
          setPageContent(
            currentPage === "dashboard"
              ? accountData.dashboardContent
              : accountData.aboutContent
          );
        } else {
          console.log("No account data found");
        }
      } else {
        console.log("No user logged in");
      }
    };

    fetchPageContent();
  }, [user, currentPage]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setLastPrompt(input);
    try {
      const response = await fetch("http://localhost:3001/api/chatCompletion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          currentHTML: pageContent,
          currentPage: currentPage,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.choices[0].message.content);
      setInput("");

      // Update iframe content
      if (iframeRef.current) {
        iframeRef.current.srcdoc = data.choices[0].message.content;
      }
    } catch (error) {
      console.error("Error in chat completion:", error);
      setResult("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
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
    setIsLoading(true);
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
    } finally {
      setIsTranscribing(false);
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      console.log("No user is signed in.");
      return;
    }

    setIsLoading(true);
    try {
      const userDocRef = doc(db, "accounts", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        console.log("No such document!");
        return;
      }

      const previousVersion =
        currentPage === "dashboard"
          ? docSnap.data().currentDashboardVersion
          : docSnap.data().currentAboutVersion;

      const versionsCollectionRef = collection(
        db,
        "accounts",
        user.uid,
        `${currentPage}_versions`
      );

      // Save the new version with the prompt
      await addDoc(versionsCollectionRef, {
        content: result,
        timestamp: serverTimestamp(),
        version: previousVersion + 1,
        prompt: lastPrompt,
      });

      // Update with the new content and increment version
      const updateData =
        currentPage === "dashboard"
          ? {
              dashboardContent: result,
              currentDashboardVersion: previousVersion + 1,
            }
          : {
              aboutContent: result,
              currentAboutVersion: previousVersion + 1,
            };

      await updateDoc(userDocRef, updateData);

      console.log(`${currentPage} content updated successfully`);
      onContentUpdate(currentPage, previousVersion + 1);
      onClose();
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    setOpenRejectDialog(true);
  };

  const handleConfirmReject = () => {
    setResult("");
    if (iframeRef.current) {
      iframeRef.current.srcdoc = "";
    }
    setOpenRejectDialog(false);
  };

  const handleCancelReject = () => {
    setOpenRejectDialog(false);
  };

  useEffect(() => {
    const resizeIframe = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.style.height = "auto";
        iframeRef.current.style.height =
          iframeRef.current.contentWindow.document.documentElement
            .scrollHeight + "px";
      }
    };

    // Resize on load and whenever the result changes
    if (iframeRef.current) {
      iframeRef.current.onload = resizeIframe;
    }
    resizeIframe();
  }, [result]);

  useEffect(() => {
    const resizeIframe = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.style.height = "auto";
        iframeRef.current.style.height = `${iframeRef.current.contentWindow.document.body.scrollHeight}px`;
      }
    };

    window.addEventListener("resize", resizeIframe);
    resizeIframe(); // Initial resize

    return () => window.removeEventListener("resize", resizeIframe);
  }, []);

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
            disabled={isRecording || isTranscribing || isLoading}
          />
          <IconButton
            onClick={handleVoiceInput}
            color={isRecording ? "secondary" : "default"}
            disabled={isTranscribing || isLoading}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
          <IconButton
            onClick={handleSubmit}
            disabled={!input || isRecording || isTranscribing || isLoading}
          >
            <SendIcon />
          </IconButton>
        </Box>
        {(isTranscribing || isLoading) && (
          <Box display="flex" alignItems="center" mb={2}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {isTranscribing ? "Transcribing..." : "Processing..."}
            </Typography>
          </Box>
        )}
        <Paper elevation={3} className={styles.resultSection}>
          <iframe
            ref={iframeRef}
            srcDoc={result}
            title="Chat Result"
            width="100%"
            style={{
              border: "none",
              width: "100%",
              height: "auto",
              overflow: "hidden",
            }}
          />
        </Paper>
        {result && (
          <Box mt={2} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAccept}
              disabled={isLoading}
            >
              Accept Changes
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleReject}
              disabled={isLoading}
            >
              Reject Changes
            </Button>
          </Box>
        )}
        <Dialog
          open={openRejectDialog}
          onClose={handleCancelReject}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Confirm Rejection"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to reject these changes? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelReject} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmReject} color="error" autoFocus>
              Reject
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Modal>
  );
};

export default ChatbotPage;
