import React, { useState } from "react";
import { IconButton, CircularProgress } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import HistoryIcon from "@mui/icons-material/History";
import ChatbotPage from "./ChatbotPage";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import AdaptationsModal from "./AdaptationsModal";

type FloatingChatIconProps = {
  currentPage: "about" | "dashboard";
  onContentUpdate: (page: "about" | "dashboard", newVersion: number) => void;
  currentDashboardVersion: number;
  currentAboutVersion: number;
};

type Adaptation = { id: string };
const FloatingChatIcon: React.FC<FloatingChatIconProps> = ({
  currentPage,
  onContentUpdate,
  currentDashboardVersion,
  currentAboutVersion,
}) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isAdaptationsModalOpen, setIsAdaptationsModalOpen] = useState(false);
  const [adaptations, setAdaptations] = useState<Adaptation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleChatIconClick = () => {
    setIsChatbotOpen(true);
  };

  const handleCloseChatbot = () => {
    setIsChatbotOpen(false);
  };

  const handleOpenAdaptationsModal = async () => {
    if (!user) {
      console.log("User is not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      const versionsCollectionName =
        currentPage === "about" ? "about_versions" : "dashboard_versions";
      const versionsCollectionRef = collection(
        db,
        "accounts",
        user.uid,
        versionsCollectionName
      );
      const versionsQuery = query(
        versionsCollectionRef,
        orderBy("version", "desc")
      );
      const versionsSnapshot = await getDocs(versionsQuery);

      const adaptationsData = versionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAdaptations(adaptationsData);
      setIsAdaptationsModalOpen(true);
    } catch (error) {
      console.error("Error fetching adaptations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAdaptationsModal = () => {
    setIsAdaptationsModalOpen(false);
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
      {(currentPage === "about"
        ? currentAboutVersion
        : currentDashboardVersion) > 1 && (
        <IconButton
          onClick={handleOpenAdaptationsModal}
          disabled={isLoading}
          sx={{
            position: "fixed",
            bottom: 16,
            left: 80,
            backgroundColor: "secondary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "secondary.dark",
            },
            width: 56,
            height: 56,
            borderRadius: "50%",
            boxShadow: 3,
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <HistoryIcon />
          )}
        </IconButton>
      )}
      {isChatbotOpen && (
        <ChatbotPage
          onClose={handleCloseChatbot}
          currentPage={currentPage}
          onContentUpdate={onContentUpdate}
        />
      )}
      {isAdaptationsModalOpen && (
        <AdaptationsModal
          adaptations={adaptations}
          onClose={handleCloseAdaptationsModal}
          currentPage={currentPage}
          onContentUpdate={onContentUpdate}
          currentAboutVersion={currentAboutVersion}
          currentDashboardVersion={currentDashboardVersion}
        />
      )}
    </>
  );
};

export default FloatingChatIcon;
