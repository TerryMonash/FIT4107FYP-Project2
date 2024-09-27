"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import styles from "./About.module.css";
import { FC } from "react";

interface AboutProps {}

const About: FC<AboutProps> = () => {
  const [content, setContent] = useState<string>("");

  const { user } = useAuth();

  useEffect(() => {
    const fetchAboutContent = async () => {
      if (user) {
        const accountRef = doc(db, "accounts", user.uid);
        const accountSnap = await getDoc(accountRef);

        if (accountSnap.exists()) {
          const accountData = accountSnap.data();
          setContent(accountData.aboutContent);
        } else {
          console.log("No account data found");
        }
      } else {
        console.log("No user logged in");
      }
    };

    fetchAboutContent();
  }, [user]);

  return (
    <div className={styles.container}>
      {content ? (
        <iframe
          srcDoc={content}
          style={{
            width: "100%",
            height: "600px",
            border: "none",
            overflow: "auto",
          }}
          title="About Content"
        />
      ) : (
        <p>Loading about content...</p>
      )}
    </div>
  );
};

export default About;
