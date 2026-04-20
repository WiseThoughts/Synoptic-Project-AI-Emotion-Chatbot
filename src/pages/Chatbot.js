import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "../style/chatbot.css";

export default function Chatbot() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef(null);
  const scrollAreaRef = useRef(null);

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

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    const newTurn = {
      userMessage: trimmed,
      plainResponse: "",
      alteredResponse: ""
    };

    setConversation((prev) => [...prev, newTurn]);
    setMessage("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await fetch("/.netlify/functions/ollama-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          history: chatHistory
        })
      });

      const rawText = await response.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(rawText || "Server returned non-JSON response");
      }

      if (!response.ok) {
        throw new Error(data?.details || data?.error || "Request failed");
      }

      sessionStorage.setItem(
        "emotion-analysis",
        JSON.stringify(data.analysis)
      );

      setConversation((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          plainResponse: data.plainResponse || "No plain response returned.",
          alteredResponse: data.alteredResponse || "No altered response returned."
        };
        return updated;
      });

      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: data.plainResponse || "" }
      ]);
    } catch (error) {
      setConversation((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          plainResponse: `Error: ${error.message}`,
          alteredResponse: `Error: ${error.message}`
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
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
      <div className="chatbot-navbar">
        <button
          className="chatbot-home-button"
          onClick={() => navigate("/")}
          aria-label="Go to home page"
        >
          Home
        </button>

        <div className="chatbot-navbar-title">Synoptic Project Chatbot</div>
      </div>

      <div className="chatbot-column-labels">
        <div className="chatbot-column-label left-label">LLM Response</div>
        <div className="chatbot-column-divider"></div>
        <div className="chatbot-column-label right-label">Altered LLM Response</div>
      </div>

      <div className="chatbot-scroll-area" ref={scrollAreaRef}>
        {conversation.length === 0 ? (
          <div className="chatbot-empty-state">
            Send a message to begin the conversation.
          </div>
        ) : (
          conversation.map((turn, index) => (
            <div className="chatbot-turn-block" key={index}>
              <div className="chatbot-user-row">
                <div className="chatbot-user-bubble">
                  {turn.userMessage}
                </div>
              </div>

              <div className="chatbot-response-row">
                <div className="chatbot-response-column chatbot-response-left">
                  <div className="chatbot-message-card chatbot-assistant-bubble">
                    <ReactMarkdown>
                      {turn.plainResponse ||
                      (isLoading && index === conversation.length - 1
                      ? "Thinking..."
                      : "")}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className="chatbot-response-divider"></div>

                <div className="chatbot-response-column chatbot-response-right">
                  <div className="chatbot-message-card chatbot-altered-bubble">
                    <ReactMarkdown>
                      {turn.alteredResponse ||
                        (isLoading && index === conversation.length - 1
                          ? "Thinking..."
                          : "")}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chatbot-input-shell">
        <div className="chatbot-input-fade"></div>

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
              disabled={isLoading}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
            <div className="chatbot-safety-notice">
        <p>
          <strong>Prototype notice:</strong> This chatbot is a working prototype.
          Please review all responses carefully and do not rely on them without
          checking their suitability for your situation.
        </p>
        <p>
          <strong>Wellbeing notice:</strong> This tool is not a substitute for
          professional, medical, or crisis support. It may not respond
          appropriately to sensitive or high-risk situations. It should be used
          only by people who feel comfortable engaging with this kind of
          content, and anyone under 18 should use it with appropriate adult
          supervision.
        </p>
      </div>
    </div>
  );
}