// src/app/components/AdaptationsModal.tsx
import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";

interface AdaptationsModalProps {
  adaptations: any[];
  onClose: () => void;
  currentPage: "about" | "dashboard";
  onContentUpdate: (page: "about" | "dashboard", newVersion: number) => void;
  currentAboutVersion: number;
  currentDashboardVersion: number;
}

const AdaptationsModal: React.FC<AdaptationsModalProps> = ({
  adaptations: initialAdaptations,
  onClose,
  currentPage,
  onContentUpdate,
  currentAboutVersion,
  currentDashboardVersion,
}) => {
  const [adaptations, setAdaptations] = useState(initialAdaptations);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  );
  const { user } = useAuth();

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false);
    };

  const handleRevert = async (version: number) => {
    if (!user) return;

    const adaptationToRevert = adaptations.find((a) => a.version === version);
    if (!adaptationToRevert) {
      console.error(`Adaptation with version ${version} not found`);
      return;
    }

    const accountRef = doc(db, "accounts", user.uid);
    const versionsCollectionName =
      currentPage === "about" ? "about_versions" : "dashboard_versions";
    const versionsCollectionRef = collection(
      accountRef,
      versionsCollectionName
    );

    try {
      // Start a batch write
      const batch = writeBatch(db);

      // Update the account document
      const updateData =
        currentPage === "about"
          ? {
              aboutContent: adaptationToRevert.content,
              currentAboutVersion: version,
            }
          : {
              dashboardContent: adaptationToRevert.content,
              currentDashboardVersion: version,
            };
      batch.update(accountRef, updateData);

      // Mark adaptations with higher versions as deleted
      const snapshot = await getDocs(
        query(versionsCollectionRef, where("version", ">", version))
      );
      snapshot.forEach((doc) => {
        batch.update(doc.ref, { deleted: true });
      });

      // Commit the batch
      await batch.commit();

      // Update local state
      onContentUpdate(currentPage, version);
      onClose();

      // Update local adaptations state
      const newAdaptations = adaptations.filter((a) => a.version <= version);
      setAdaptations(newAdaptations);
    } catch (error) {
      console.error("Error reverting to version:", error);
    }
  };

  const currentVersion =
    currentPage === "about" ? currentAboutVersion : currentDashboardVersion;

  // Sort adaptations in descending order by version and filter out deleted ones
  const sortedAdaptations = [...adaptations]
    .filter((a) => !a.deleted)
    .sort((a, b) => b.version - a.version);

  // Filter out future versions
  const filteredAdaptations = sortedAdaptations.filter(
    (a) => a.version <= currentVersion
  );

  return (
    <Modal open={true} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: 800,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Adaptation History
        </Typography>
        {filteredAdaptations.map((adaptation, index) => (
          <Accordion
            key={adaptation.id}
            expanded={expandedAccordion === `panel${index}`}
            onChange={handleAccordionChange(`panel${index}`)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Version {adaptation.version}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography gutterBottom>Prompt: {adaptation.prompt}</Typography>
              <Box sx={{ width: "100%", height: 300, mb: 2 }}>
                <iframe
                  srcDoc={adaptation.content}
                  title={`Adaptation ${adaptation.version}`}
                  width="100%"
                  height="100%"
                  style={{ border: "1px solid #ccc" }}
                />
              </Box>
              {adaptation.version === currentVersion - 1 && (
                <Button
                  variant="contained"
                  onClick={() => handleRevert(adaptation.version)}
                >
                  Revert to this version
                </Button>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Modal>
  );
};

export default AdaptationsModal;
