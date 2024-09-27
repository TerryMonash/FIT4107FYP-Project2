import React from "react";
import styles from "./About.module.css";

const About = () => {
  return (
    <div className={styles.aboutContainer}>
      <h1 className={styles.title}>About Us</h1>
      <p className={styles.description}>
        Welcome to our application! We are a dedicated team passionate about
        creating innovative solutions to make your life easier.
      </p>
      <p className={styles.description}>
        Our mission is to provide high-quality, user-friendly applications that
        solve real-world problems and enhance your daily experiences.
      </p>
      <h2 className={styles.subtitle}>Our Team</h2>
      <ul className={styles.teamList}>
        <li>John Doe - Founder & CEO</li>
        <li>Jane Smith - Lead Developer</li>
        <li>Mike Johnson - UX Designer</li>
        <li>Sarah Brown - Marketing Specialist</li>
      </ul>
    </div>
  );
};

export default About;
