import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleQuestionnaire = () => {
    alert("Questionnaire start button clicked.");
  };

  const handleChatbot = () => {
    navigate("/chatbot");
  };

  return (
    <div className="home-page">
      <div className="home-card">
        <h1 className="home-title">Synoptic Chatbot</h1>
        <p className="home-subtitle">
          Choose whether to begin the questionnaire or go straight to the chatbot.
        </p>

        <div className="home-button-group">
          <button className="home-button primary" onClick={handleQuestionnaire}>
            Start / Submit Questionnaire
          </button>
          <button className="home-button secondary" onClick={handleChatbot}>
            Start Chatbot
          </button>
        </div>
      </div>
    </div>
  );
}