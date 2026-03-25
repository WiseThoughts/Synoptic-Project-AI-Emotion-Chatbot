import React from "react";
import { Routes, Route } from "react-router-dom";
import "../style/app.css";
import Home from "./Home";
import Chatbot from "./Chatbot";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chatbot" element={<Chatbot />} />
    </Routes>
  );
}