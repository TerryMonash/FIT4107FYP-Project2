"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logging in user");
      router.push("/dashboard"); // Adjust this to match your APP_PAGE route
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Login error:", error.message);
      } else {
        console.error("Login error:", String(error));
      }

      // Handle different error codes
      if (error instanceof Error && "code" in error) {
        switch (error.code) {
          case "auth/invalid-email":
            setError("Invalid email address. Please check and try again.");
            break;
          case "auth/user-disabled":
            setError("This account has been disabled. Please contact support.");
            break;
          case "auth/user-not-found":
            setError(
              "No account found with this email. Please check or register."
            );
            break;
          case "auth/wrong-password":
            setError("Incorrect password. Please try again.");
            break;
          case "auth/too-many-requests":
            setError("Too many failed attempts. Please try again later.");
            break;
          default:
            setError("An error occurred. Please try again later.");
        }
      } else {
        setError("An unknown error occurred.");
      }

      // Clear the password field for security
      setPassword("");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>Login</h2>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.formInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.formInput}
          />
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <button type="submit" className={styles.submitButton}>
          Login
        </button>
      </form>
      <p className={styles.registerLink}>
        Don&apos;t have an account? <Link href="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
