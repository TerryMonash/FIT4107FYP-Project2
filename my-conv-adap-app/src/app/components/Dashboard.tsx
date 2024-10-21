"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import styles from "../Home.module.css";

const Dashboard: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const { user } = useAuth();

  const fetchDashboardContent = useCallback(async () => {
    if (user) {
      const accountRef = doc(db, "accounts", user.uid);
      const accountSnap = await getDoc(accountRef);

      if (accountSnap.exists()) {
        const accountData = accountSnap.data();
        setContent(accountData.dashboardContent);
      } else {
        console.log("No account data found");
      }
    } else {
      console.log("No user logged in");
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardContent();
  }, [fetchDashboardContent]);

  return (
    <div className={styles.container}>
      {content ? (
        <iframe
          srcDoc={content}
          style={{
            width: "100%",
            height: "800px",
            border: "none",
            overflow: "auto",
          }}
          title="Dashboard Content"
        />
      ) : (
        <p>Loading dashboard content...</p>
      )}
    </div>
  );
};

export default Dashboard;
