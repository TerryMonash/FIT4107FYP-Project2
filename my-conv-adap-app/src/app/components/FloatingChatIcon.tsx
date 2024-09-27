import React, { useState } from "react";
import { IconButton } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import ChatbotPage from "./ChatbotPage";

const FloatingChatIcon: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleChatIconClick = () => {
    setIsChatbotOpen(true);
  };

  const handleCloseChatbot = () => {
    setIsChatbotOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={handleChatIconClick}
        sx={{
          position: "fixed",
          bottom: 16,
          left: 16,
          backgroundColor: "primary.main",
          color: "white",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
          width: 56,
          height: 56,
          borderRadius: "50%",
          boxShadow: 3,
        }}
      >
        <ChatIcon />
      </IconButton>
      {isChatbotOpen && <ChatbotPage onClose={handleCloseChatbot} />}
    </>
  );
};

export default FloatingChatIcon;
