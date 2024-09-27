"use client";

import React, { useState } from "react";
import styles from "../Home.module.css";
import Card from "./Card";

const Dashboard: React.FC = () => {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const handleCardClick = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const cards = [
    {
      id: 1,
      title: "Investment Portfolio",
      description: "View your current investment portfolio",
      extraInfo:
        "Your portfolio has grown by 12% this year. Consider rebalancing for optimal performance.",
    },
    {
      id: 2,
      title: "Retirement Planning",
      description: "Check your retirement savings progress",
      extraInfo:
        "You're on track to reach your retirement goals. Consider increasing your 401(k) contributions to maximize tax benefits.",
    },
    {
      id: 3,
      title: "Tax Planning",
      description: "Optimize your tax strategy",
      extraInfo:
        "Review our latest tax-saving tips and schedule a consultation with our tax expert to potentially reduce your tax liability.",
    },
    {
      id: 4,
      title: "Budget Analysis",
      description: "Analyze your monthly budget",
      extraInfo:
        "You've reduced your discretionary spending by 15% this month. Great job staying on budget! Consider allocating the savings to your emergency fund.",
    },
    {
      id: 5,
      title: "Debt Management",
      description: "Review and optimize your debt",
      extraInfo:
        "Your debt-to-income ratio has improved. Consider consolidating your high-interest debts to save on interest payments.",
    },
    {
      id: 6,
      title: "Estate Planning",
      description: "Ensure your assets are protected",
      extraInfo:
        "It's time for an annual review of your will and trusts. Schedule an appointment with our estate planning specialist to discuss any recent life changes.",
    },
    {
      id: 7,
      title: "Insurance Coverage",
      description: "Review your insurance policies",
      extraInfo:
        "Your life insurance coverage may need adjustment based on recent changes. Let's review your policies to ensure adequate protection for your family.",
    },
    {
      id: 8,
      title: "Financial Goals",
      description: "Track progress on your financial objectives",
      extraInfo:
        "You're making great progress on your short-term savings goal. Let's discuss strategies to accelerate your long-term wealth building.",
    },
  ];

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>Financial Consultation Dashboard</h1>
      <p className={styles.description}>
        Welcome to your financial dashboard. Click on a card to view more
        information.
      </p>
      <div className={styles.cardGrid}>
        {cards.map((card) => (
          <Card
            key={card.id}
            {...card}
            isExpanded={expandedCardId === card.id}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
