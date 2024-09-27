import React, { useState } from "react";
import { IconButton, CircularProgress } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import UndoIcon from "@mui/icons-material/Undo";
import ChatbotPage from "./ChatbotPage";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";

type FloatingChatIconProps = {
  currentPage: "about" | "dashboard";
  onContentUpdate: () => void;
  currentVersion: number;
};

const FloatingChatIcon: React.FC<FloatingChatIconProps> = ({
  currentPage,
  onContentUpdate,
  currentVersion,
}) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const { user } = useAuth();

  // Remove the useEffect hook that checks for canRevert

  const handleChatIconClick = () => {
    setIsChatbotOpen(true);
  };

  const handleCloseChatbot = () => {
    setIsChatbotOpen(false);
  };

  const handleRevert = async () => {
    if (!user) {
      console.log("User is not authenticated");
      // TODO: Show a user-friendly message about authentication
      return;
    }

    setIsReverting(true);

    const accountRef = doc(db, "accounts", user.uid);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      console.log("Account document does not exist");
      // TODO: Show a user-friendly message about missing account
      setIsReverting(false);
      return;
    }

    const accountData = accountSnap.data();
    const currentVersion =
      currentPage === "about"
        ? accountData.currentAboutVersion
        : accountData.currentDashboardVersion;

    if (currentVersion <= 1) {
      console.log("Current version is 1 or less, cannot revert");
      // TODO: Show a user-friendly message that revert is not possible
      setIsReverting(false);
      return;
    }

    const versionsCollectionName =
      currentPage === "about" ? "about_versions" : "dashboard_versions";

    // Fetch the previous version
    const versionsCollectionRef = collection(
      db,
      "accounts",
      user.uid,
      versionsCollectionName
    );
    const previousVersionQuery = query(
      versionsCollectionRef,
      where("version", "==", currentVersion - 1),
      limit(1)
    );
    const previousVersionSnapshot = await getDocs(previousVersionQuery);

    if (previousVersionSnapshot.empty) {
      console.error("Previous version not found");
      // TODO: Show a user-friendly error message about no available versions
      setIsReverting(false);
      return;
    }

    const previousVersionDoc = previousVersionSnapshot.docs[0];
    const previousVersionData = previousVersionDoc.data();

    const updateData =
      currentPage === "about"
        ? {
            aboutContent: previousVersionData.content,
            currentAboutVersion: previousVersionData.version,
          }
        : {
            dashboardContent: previousVersionData.content,
            currentDashboardVersion: previousVersionData.version,
          };

    try {
      await updateDoc(accountRef, updateData);
      console.log("Account reverted successfully");

      // Call the onContentUpdate callback instead of directly fetching content
      onContentUpdate();
    } catch (error) {
      console.error("Error reverting account:", error);
      // TODO: Show an error message to the user
    } finally {
      setIsReverting(false);
    }
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
      {currentVersion > 1 && (
        <IconButton
          onClick={handleRevert}
          disabled={isReverting}
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
          {isReverting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <UndoIcon />
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
    </>
  );
};

export default FloatingChatIcon;
