"use client";

import React, { useState } from "react";
import styles from "./Register.module.css";
import Link from "next/link";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      const htmlData = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Left Section</title>
            <style>
                body {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: flex-start;
                    padding: 20px;
                }
                nav ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                }
                nav ul li {
                    padding: 10px;
                    background-color: #ddd;
                    margin-right: 5px;
                }
                nav ul li:hover {
                    background-color: #ccc;
                }
                .square-box {
                    width: 500px;
                    height: 200px;
                    background-color: yellow;
                    margin-top: 20px;
                }
                h2 {
                    font-family: 'Arial', sans-serif;
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <nav>
                <ul>
                    <li>Home</li>
                    <li>About</li>
                    <li>Profile</li>
                    <li>Settings</li>
                </ul>
            </nav>
            <h1>Left Section (For elements to play around with)</h1>
            <h2>Different header to play around with</h2>
            <p>
                THIS WAS FETCHED FROM FIREBASE!
            </p>
            <div class="square-box"></div>
        </body>
        </html>`;

      const account = {
        useruid: user.uid,
        currentLeftHTMLVersion: 1,
        currentLeftHTML: htmlData,
      };

      await setDoc(doc(db, "accounts", user.uid), account);

      const versionsCollectionRef = collection(
        db,
        "accounts",
        user.uid,
        "leftHTML_versions"
      );
      await addDoc(versionsCollectionRef, {
        html: htmlData,
        timestamp: serverTimestamp(),
      });

      console.log("User registered successfully");
      router.push("/dashboard");
    } catch (error: unknown) {
      const errorCode =
        error instanceof Error
          ? (error as { code?: string }).code
          : "Unknown error code";
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Registration error:", errorCode, errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.title}>Register</h2>
      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className={styles.input}
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className={styles.input}
        />
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
          className={styles.input}
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button type="submit" className={styles.submitButton}>
          Register
        </button>
      </form>
      <p className={styles.loginLink}>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
