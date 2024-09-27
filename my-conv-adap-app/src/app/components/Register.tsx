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

  const initialDashboardContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Financial Consultation Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .card {
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            padding: 20px;
            transition: transform 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        .card h2 {
            color: #444;
            margin-top: 0;
        }
        .card p {
            color: #666;
        }
        .extra-info {
            display: none;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Financial Consultation Dashboard</h1>
        <div class="card-grid" id="cardGrid"></div>
    </div>

    <script>
        const cards = [
            {
                title: "Investment Portfolio",
                description: "View your current investment portfolio",
                extraInfo: "Your portfolio has grown by 12% this year. Consider rebalancing for optimal performance."
            },
            {
                title: "Retirement Planning",
                description: "Check your retirement savings progress",
                extraInfo: "You're on track to reach your retirement goals. Consider increasing your 401(k) contributions to maximize tax benefits."
            },
            {
                title: "Tax Planning",
                description: "Optimize your tax strategy",
                extraInfo: "Review our latest tax-saving tips and schedule a consultation with our tax expert to potentially reduce your tax liability."
            },
            {
                title: "Budget Analysis",
                description: "Analyze your monthly budget",
                extraInfo: "You've reduced your discretionary spending by 15% this month. Great job staying on budget! Consider allocating the savings to your emergency fund."
            }
        ];

        const cardGrid = document.getElementById('cardGrid');

        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = \`
                <h2>\${card.title}</h2>
                <p>\${card.description}</p>
                <div class="extra-info">\${card.extraInfo}</div>
            \`;

            cardElement.addEventListener('click', () => {
                const extraInfo = cardElement.querySelector('.extra-info');
                extraInfo.style.display = extraInfo.style.display === 'none' ? 'block' : 'none';
            });

            cardGrid.appendChild(cardElement);
        });
    </script>
</body>
</html>
  `;

  const initialAboutContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2 {
            color: #333;
        }
        p {
            color: #666;
        }
        .team-list {
            list-style-type: none;
            padding: 0;
        }
        .team-list li {
            background-color: #fff;
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .highlight {
            background-color: #e6f3ff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>About Us</h1>
        <p>Welcome to our application! We are a dedicated team passionate about creating innovative solutions to make your life easier.</p>
        <p>Our mission is to provide high-quality, user-friendly applications that solve real-world problems and enhance your daily experiences.</p>
        
        <h2>Our Team</h2>
        <ul class="team-list" id="teamList">
            <li>John Doe - Founder & CEO</li>
            <li>Jane Smith - Lead Developer</li>
            <li>Mike Johnson - UX Designer</li>
            <li>Sarah Brown - Marketing Specialist</li>
        </ul>
    </div>

    <script>
        const teamList = document.getElementById('teamList');
        const teamMembers = teamList.getElementsByTagName('li');

        for (let member of teamMembers) {
            member.addEventListener('mouseover', () => {
                member.classList.add('highlight');
            });

            member.addEventListener('mouseout', () => {
                member.classList.remove('highlight');
            });
        }
    </script>
</body>
</html>
  `;

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

      const account = {
        useruid: user.uid,
        currentDashboardVersion: 1,
        currentAboutVersion: 1,
        dashboardContent: initialDashboardContent,
        aboutContent: initialAboutContent,
      };

      await setDoc(doc(db, "accounts", user.uid), account);

      // Store initial Dashboard content
      const dashboardVersionsRef = collection(
        db,
        "accounts",
        user.uid,
        "dashboard_versions"
      );
      await addDoc(dashboardVersionsRef, {
        content: initialDashboardContent,
        timestamp: serverTimestamp(),
        version: 1,
        isInitial: true,
      });

      // Store initial About content
      const aboutVersionsRef = collection(
        db,
        "accounts",
        user.uid,
        "about_versions"
      );
      await addDoc(aboutVersionsRef, {
        content: initialAboutContent,
        timestamp: serverTimestamp(),
        version: 1,
        isInitial: true,
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
