import React from "react";
import styles from "../Home.module.css";

interface CardProps {
  id: number;
  title: string;
  description: string;
  extraInfo: string;
  isExpanded: boolean;
  onCardClick: (id: number) => void;
}

const Card: React.FC<CardProps> = ({
  id,
  title,
  description,
  extraInfo,
  isExpanded,
  onCardClick,
}) => {
  return (
    <div
      className={`${styles.card} ${isExpanded ? styles.expanded : ""}`}
      onClick={() => onCardClick(id)}
    >
      <h2 className={styles.cardTitle}>{title}</h2>
      <p className={styles.cardDescription}>{description}</p>
      {isExpanded && <p className={styles.extraInfo}>{extraInfo}</p>}
    </div>
  );
};

export default Card;
