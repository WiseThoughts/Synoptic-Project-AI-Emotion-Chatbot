import React, { useRef, useState } from "react";
import "../style/chatbot.css";

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [userOutputs, setUserOutputs] = useState([
    "Your generated outputs will appear here."
  ]);
  const [llmResponses, setLlmResponses] = useState([
    "The LLM response will appear here."
  ]);

  const textareaRef = useRef(null);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    autoResize();
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setUserOutputs((prev) => [...prev, `Generated Output: ${trimmed}`]);
    setLlmResponses((prev) => [...prev, `LLM Response to: ${trimmed}`]);

    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-split-layout">
        <div className="chatbot-panel">
          <h2 className="chatbot-panel-title">Your Generated Outputs</h2>
          <div className="chatbot-messages-area">
            {userOutputs.map((item, index) => (
              <div className="chatbot-message-card" key={index}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="chatbot-divider"></div>

        <div className="chatbot-panel">
          <h2 className="chatbot-panel-title">LLM Responses</h2>
          <div className="chatbot-messages-area">
            {llmResponses.map((item, index) => (
              <div className="chatbot-message-card" key={index}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chatbot-input-wrapper">
        <div className="chatbot-input-container">
          <textarea
            ref={textareaRef}
            className="chatbot-text-input"
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
          />
          <button
            className="chatbot-send-button"
            onClick={handleSend}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}