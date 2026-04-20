import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/questionnaire.css";

const HIDDEN_SYSTEM_MAP = {
  systemA: "base_ollama",
  systemB: "altered_ollama",
  systemC: "chatgpt",
  systemD: "gemini",
  systemE: "copilot"
};

const COMPARISON_PROMPTS = [
  {
    id: "prompt1",
    title: "Prompt 1 — Subtle Negative Emotion (Ambiguity Test)",
    prompt:
      "I’ve been working very hard on my project at work lately, but it feels like nothing is going my way. I don’t know how to keep going and push through, it’s effecting my home life, sleep, and mental health.",
    responses: [
      {
        number: 1,
        system: "systemA",
        text: "You’re facing a tough stretch, and it’s completely understandable that the pressure of your work is taking a toll. Right now, progress may feel slow or impossible, but small, consistent steps will help you regain control. Focus on protecting your energy—prioritize rest, manage your workload, and ask for support when needed. The grind will pass, and you’ll come out stronger once you push through this phase. Keep moving forward, one task at a time."
      },
      {
        number: 2,
        system: "systemB",
        text: "You’re in a tough spot right now, and it’s clear you’re pushing through a lot. The grind can feel relentless, especially when progress feels slow or overwhelming. Break it down into smaller steps—focus on one manageable task at a time, and don’t hesitate to ask for support when needed. Small wins will help you regain momentum, and taking care of your sleep, routine, and mental energy will make everything feel more manageable. Keep going—you’ve got this."
      },
      {
        number: 3,
        system: "systemC",
        text: "It sounds like you’re under sustained pressure without seeing the payoff, and that’s starting to spill into the rest of your life. At this point, pushing harder usually isn’t the fix—resetting your approach is. Identify what’s actually blocking progress (unclear requirements, unrealistic timelines, lack of support) and address those directly with your manager or team rather than absorbing it alone. Set firmer boundaries around work hours to protect your sleep and recovery, even if that feels counterintuitive in the short term. Breaking the work into smaller, clearly defined wins can also help restore a sense of control and momentum. If the situation doesn’t improve, it’s worth seriously evaluating whether the environment itself is sustainable."
      },
      {
        number: 4,
        system: "systemD",
        text: "It is incredibly draining when you pour your entire focus into a project only to feel like you’re hitting a wall at every turn. That kind of persistent friction doesn't just stay at the office; it naturally bleeds into your rest and your headspace, making everything feel much heavier than it should. When the momentum stalls, the best move usually isn't to push harder against the same resistance, but to intentionally step back and reclaim your baseline. Taking a moment to prioritize your sleep and physical health over the immediate demands of the project isn't giving up—it’s the only way to ensure you have the clarity and stamina needed to actually solve the problems in front of you."
      },
      {
        number: 5,
        system: "systemE",
        text: "It sounds like the pressure from your project has built up to a point where it’s draining you in every direction, and that’s a heavy load for anyone to carry. When work starts affecting sleep, home life, and wellbeing, it’s a sign that you deserve real support, whether that’s speaking with a qualified professional or opening up to someone you trust. You don’t have to push through this alone, and taking steps to protect your health is just as important as the project itself. What part of the situation feels hardest to deal with right now — the workload, the expectations, or the constant stress?"
      }
    ]
  },
  {
    id: "prompt2",
    title: "Prompt 2 — Positive but Complex Emotion (Nuance Test)",
    prompt:
      "I just got promoted at work, which is amazing and I worked very hard to achieve this position, but now I feel a lot of pressure and I’m worried I might not have been the right choice.",
    responses: [
      {
        number: 6,
        system: "systemA",
        text: "Congratulations on your promotion—it’s earned, and now comes the work of stepping up to meet the new challenges. The responsibility will feel heavier at first, but focus on building confidence by tackling one thing at a time. Trust that your effort has already paid off, and this next phase is where you’ll prove what you can achieve. You’ve got this."
      },
      {
        number: 7,
        system: "systemB",
        text: "Your promotion is a well-earned milestone, and the weight of the role is natural—especially after putting in the effort to get here. Instead of focusing on doubt, channel that energy into learning and proving yourself through action. Break tasks into manageable steps, seek clarity from your team, and trust that your skills will guide you forward. This is your chance to grow, and every challenge is an opportunity to shine."
      },
      {
        number: 8,
        system: "systemC",
        text: "Congratulations on the promotion—that reflects proven capability, not luck. The pressure you’re feeling is typical when stepping into a higher-responsibility role, especially while you’re still calibrating expectations and processes. Focus on getting clear priorities from your manager, define what success looks like in the first 30–90 days, and break responsibilities into manageable pieces rather than trying to master everything at once. Lean on your team, ask targeted questions early, and treat this phase as a structured ramp-up rather than a performance test you’re expected to ace immediately."
      },
      {
        number: 9,
        system: "systemD",
        text: "That feeling of \"imposter syndrome\" is a common byproduct of a hard-earned success, but it’s important to remember that you didn't end up in this position by accident. Organizations don't hand out promotions as favors; they do so because you’ve already demonstrated the specific skills and results required for the next level. The pressure you’re feeling is likely just the gap between your current comfort zone and your new responsibilities, which is where growth actually happens. Trust the judgment of those who promoted you—they saw your potential from an objective perspective—and give yourself the grace to be a \"beginner\" at this higher level while you find your footing."
      },
      {
        number: 10,
        system: "systemE",
        text: "It makes sense that a promotion you worked hard for can still bring a wave of pressure, and feeling unsure doesn’t mean you’re not capable — it usually means you care about doing well. Many people experience this kind of self doubt when stepping into a bigger role, but it doesn’t erase the effort and skill that got you chosen in the first place. What part of the new responsibilities is making you question yourself the most?"
      }
    ]
  },
  {
    id: "prompt3",
    title: "Prompt 3 — Neutral / Everyday Context (Context Handling Test)",
    prompt:
      "I’ve got a lot to do today and not much time to do it. I know I just need to get through it but it feels like more keeps piling up and that I’ll never get everything done that I need to do get done.",
    responses: [
      {
        number: 11,
        system: "systemA",
        text: "You’re dealing with a busy workload, and it’s normal to feel like there’s always more to handle. Break it down into manageable chunks—focus on finishing one task before moving to the next. Set clear priorities and give yourself permission to pause if needed. Progress isn’t about doing everything perfectly; it’s about making steady forward movement. You’ll get through it."
      },
      {
        number: 12,
        system: "systemB",
        text: "You’re dealing with a packed schedule, and it’s easy to feel like there’s always more to do. Break tasks into smaller chunks—focus on finishing one piece at a time rather than trying to tackle everything at once. Prioritize what truly needs immediate attention and set aside what can wait. This way, you’ll make steady progress without burning out."
      },
      {
        number: 13,
        system: "systemC",
        text: "Start by accepting that you won’t get everything done today—then focus on what actually matters. Identify the top 2–3 tasks with the highest impact or urgency and commit to completing those, while deliberately deferring or delegating the rest where possible. Work in short, uninterrupted blocks to make steady progress, and avoid reacting to every new demand as it comes in. The key is shifting from trying to clear everything to controlling what you choose to complete."
      },
      {
        number: 14,
        system: "systemD",
        text: "When you're staring down a mountain of tasks that keeps growing, the sheer volume can make any progress feel invisible. The most effective way to break that cycle of overwhelm is to stop looking at the peak and focus entirely on the single next move. By triaging your list and tackling one high-priority item at a time, you regain a sense of agency that \"infinite\" to-do lists usually strip away. It’s also worth acknowledging that some days are simply about managing the overflow rather than clearing it; give yourself permission to focus on what is essential right now, and trust that once you break the initial gridlock, the rest will become much more manageable."
      },
      {
        number: 15,
        system: "systemE",
        text: "When the list keeps growing faster than you can work through it, the whole day can start to feel impossible, and that pressure alone can drain your energy before you even begin. Breaking things into a few small wins you can actually finish might help you regain a bit of control, and it’s okay if not everything gets done perfectly today — you’re one person, not a machine. What’s the one task that feels most urgent or heaviest on your mind right now?"
      }
    ]
  }
];

const OVERALL_SYSTEM_OPTIONS = [
  { id: "systemA", label: "System A" },
  { id: "systemB", label: "System B" },
  { id: "systemC", label: "System C" },
  { id: "systemD", label: "System D" },
  { id: "systemE", label: "System E" }
];

const SUGGESTED_PROMPTS = [
  { id: "sp1", text: "I’ve been feeling really overwhelmed with everything lately and I don’t know how to handle it anymore." },
  { id: "sp2", text: "I got into the university I wanted, which is amazing, but I’m also really nervous about moving away from home." },
  { id: "sp3", text: "I’ve recently had a death in the family and finding it really hard to move on an get through the day." },
  { id: "sp4", text: "Everyone else seems to be doing better than me, and I just feel stuck." },
  { id: "sp5", text: "I’ve been arguing a lot with a close friend recently and I’m not sure how to fix things." }
];

const RATING_ITEMS = [
  {
    id: "emotional_accuracy",
    label: "Q1 — Emotional Accuracy",
    statement: "The responses accurately understood and reflected the emotional tone of the prompts."
  },
  {
    id: "clarity",
    label: "Q2 — Clarity",
    statement: "The responses were clear, coherent, and easy to understand."
  },
  {
    id: "usefulness",
    label: "Q3 — Usefulness",
    statement: "The responses were helpful or useful in addressing the situation described."
  },
  {
    id: "trust",
    label: "Q4 — Trust",
    statement: "I would trust responses like these in a real-world situation."
  },
  {
    id: "context_awareness",
    label: "Q5 — Context Awareness",
    statement: "The responses appropriately considered the context of the prompt rather than giving generic answers."
  }
];

function getTodayDate() {
  return new Date().toLocaleDateString("en-GB");
}

function createInitialRankings() {
  const rankings = {};
  COMPARISON_PROMPTS.forEach((prompt) => {
    rankings[prompt.id] = {};
    prompt.responses.forEach((response) => {
      rankings[prompt.id][response.number] = "";
    });
  });
  return rankings;
}

function createInitialFollowups() {
  const followups = {};
  COMPARISON_PROMPTS.forEach((prompt) => {
    followups[prompt.id] = { bestFitWhy: "", standoutResponses: "" };
  });
  return followups;
}

function createInitialRatings() {
  const ratings = {};
  RATING_ITEMS.forEach((item) => {
    ratings[item.id] = "";
  });
  return ratings;
}

export default function QuestionnaireQuestions() {
  const navigate = useNavigate();
  const [participantId, setParticipantId] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [stage, setStage] = useState(1);

  const [rankings, setRankings] = useState(createInitialRankings);
  const [followups, setFollowups] = useState(createInitialFollowups);
  const [overallBestSystem, setOverallBestSystem] = useState("");

  const [selectedPromptId, setSelectedPromptId] = useState(SUGGESTED_PROMPTS[0].id);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const [ratings, setRatings] = useState(createInitialRatings);
  const [isGenerating, setIsGenerating] = useState(false);

  const textareaRef = useRef(null);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    const storedParticipantId = sessionStorage.getItem("participant-id");
    if (!storedParticipantId) {
      navigate("/questionnaire");
      return;
    }

    setParticipantId(storedParticipantId);
    setCurrentDate(getTodayDate());

    const storedRankings = sessionStorage.getItem("questionnaire-rankings");
    const storedFollowups = sessionStorage.getItem("questionnaire-followups");
    const storedOverall = sessionStorage.getItem("questionnaire-overall-best-system");
    const storedRatings = sessionStorage.getItem("questionnaire-model-ratings");
    const storedChatMessages = sessionStorage.getItem("questionnaire-altered-chat-messages");
    const storedStage = sessionStorage.getItem("questionnaire-stage");

    if (storedRankings) {
      try {
        setRankings(JSON.parse(storedRankings));
      } catch {}
    }
    if (storedFollowups) {
      try {
        setFollowups(JSON.parse(storedFollowups));
      } catch {}
    }
    if (storedOverall) setOverallBestSystem(storedOverall);
    if (storedRatings) {
      try {
        setRatings(JSON.parse(storedRatings));
      } catch {}
    }
    if (storedChatMessages) {
      try {
        setChatMessages(JSON.parse(storedChatMessages));
      } catch {}
    }
    if (storedStage) setStage(Number(storedStage));

    const responseMap = {};
    COMPARISON_PROMPTS.forEach((prompt) => {
      prompt.responses.forEach((response) => {
        responseMap[response.number] = {
          promptId: prompt.id,
          hiddenSystem: HIDDEN_SYSTEM_MAP[response.system]
        };
      });
    });

    sessionStorage.setItem("questionnaire-response-map", JSON.stringify(responseMap));
    sessionStorage.setItem("questionnaire-system-map", JSON.stringify(HIDDEN_SYSTEM_MAP));
  }, [navigate]);

  useEffect(() => {
    if (!participantId) return;

    sessionStorage.setItem("questionnaire-rankings", JSON.stringify(rankings));
    sessionStorage.setItem("questionnaire-followups", JSON.stringify(followups));
    sessionStorage.setItem("questionnaire-overall-best-system", overallBestSystem);
    sessionStorage.setItem("questionnaire-model-ratings", JSON.stringify(ratings));
    sessionStorage.setItem("questionnaire-altered-chat-messages", JSON.stringify(chatMessages));
    sessionStorage.setItem("questionnaire-stage", String(stage));
  }, [participantId, rankings, followups, overallBestSystem, ratings, chatMessages, stage]);

  const selectedPrompt = useMemo(
    () => SUGGESTED_PROMPTS.find((prompt) => prompt.id === selectedPromptId),
    [selectedPromptId]
  );

  const selectedChat = chatMessages[selectedPromptId] || [];

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedChat, isGenerating, selectedPromptId]);

  const isRankingValid = (promptId) => {
    const values = Object.values(rankings[promptId] || {});
    if (values.some((value) => !value)) return false;
    const uniqueValues = new Set(values);
    const expected = new Set(["1", "2", "3", "4", "5"]);
    if (uniqueValues.size !== 5) return false;
    return [...expected].every((value) => uniqueValues.has(value));
  };

  const comparisonPageComplete = useMemo(() => {
    const promptsComplete = COMPARISON_PROMPTS.every((prompt) => {
      const promptFollowup = followups[prompt.id];
      return (
        isRankingValid(prompt.id) &&
        promptFollowup.bestFitWhy.trim() &&
        promptFollowup.standoutResponses.trim()
      );
    });

    return promptsComplete && overallBestSystem;
  }, [rankings, followups, overallBestSystem]);

  const modelEvaluationComplete = useMemo(() => {
    const hasAllRatings = RATING_ITEMS.every((item) => ratings[item.id]);
    const hasAtLeastOneAssistantResponse = Object.values(chatMessages).some((messages) =>
      (messages || []).some(
        (message) => message.role === "assistant" && String(message.content || "").trim()
      )
    );

    return hasAllRatings && hasAtLeastOneAssistantResponse;
  }, [ratings, chatMessages]);

  const handleRankChange = (promptId, responseNumber, rankValue) => {
    setRankings((prev) => ({
      ...prev,
      [promptId]: {
        ...prev[promptId],
        [responseNumber]: rankValue
      }
    }));
  };

  const handleFollowupChange = (promptId, field, value) => {
    setFollowups((prev) => ({
      ...prev,
      [promptId]: {
        ...prev[promptId],
        [field]: value
      }
    }));
  };

  const handleRatingChange = (ratingId, value) => {
    setRatings((prev) => ({
      ...prev,
      [ratingId]: value
    }));
  };

  const handleSuggestionClick = (text) => {
    setChatInput(text);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleInputChange = (e) => {
    setChatInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isGenerating || !selectedPromptId) return;

    const existingMessages = chatMessages[selectedPromptId] || [];
    const userMessage = { role: "user", content: trimmed };

    setChatMessages((prev) => ({
      ...prev,
      [selectedPromptId]: [...(prev[selectedPromptId] || []), userMessage]
    }));

    setChatInput("");
    setIsGenerating(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const history = existingMessages.map((message) => ({
        role: message.role,
        content: message.content
      }));

      const response = await fetch("/.netlify/functions/ollama-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          history
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

      const assistantMessage = {
        role: "assistant",
        content: data.alteredResponse || "No altered response returned."
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedPromptId]: [...(prev[selectedPromptId] || []), userMessage, assistantMessage]
      }));

      sessionStorage.setItem("emotion-analysis", JSON.stringify(data.analysis || {}));
    } catch (error) {
      const assistantMessage = {
        role: "assistant",
        content: `Error: ${error.message}`
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedPromptId]: [...(prev[selectedPromptId] || []), userMessage, assistantMessage]
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!modelEvaluationComplete) return;

    try {
      const participantConsent = JSON.parse(sessionStorage.getItem("participant-consent") || "{}");
      const signatureConfirmed = sessionStorage.getItem("participant-signature-confirmed") === "true";

      const payload = {
        participantId,
        submittedAt: new Date().toISOString(),
        participantInfo: {
          participantId,
          date: currentDate
        },
        consent: {
          consentAnswers: participantConsent,
          signatureConfirmed
        },
        comparison: {
          rankings,
          followups,
          overallBestSystem
        },
        alteredModelEvaluation: {
          chatMessages,
          ratings
        },
        hiddenMappings: {
          responseMap: JSON.parse(sessionStorage.getItem("questionnaire-response-map") || "{}"),
          systemMap: JSON.parse(sessionStorage.getItem("questionnaire-system-map") || "{}")
        }
      };

      const response = await fetch("/.netlify/functions/final-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const rawText = await response.text();
      let data;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(rawText || "Server returned non-JSON response");
      }

      if (!response.ok) {
        throw new Error(data?.details || data?.error || "Submission failed");
      }

      sessionStorage.setItem("questionnaire-final-submission-preview", JSON.stringify(payload));
      alert("Submission completed successfully.");
      navigate("/");
    } catch (error) {
      alert(`Final submission failed: ${error.message}`);
    }
  };

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-topbar">
        <button className="questionnaire-home-button" onClick={() => navigate("/")} type="button">
          Home
        </button>

        <div className="questionnaire-title-block">
          <h1 className="questionnaire-title">Questionnaire</h1>
          <p className="questionnaire-subtitle">
            Participant ID: {participantId || "Loading..."} | Date: {currentDate || "Loading..."}
          </p>
        </div>
      </div>

      <div className="questionnaire-content">
        <div className="questionnaire-meta-card">
          <div className="questionnaire-meta-item">
            <span className="questionnaire-meta-label">Participant ID</span>
            <span className="questionnaire-meta-value">{participantId}</span>
          </div>

          <div className="questionnaire-meta-item">
            <span className="questionnaire-meta-label">Current Questionnaire Page</span>
            <span className="questionnaire-meta-value">
              {stage === 1 ? "Blind Response Comparison" : "Altered Model Evaluation"}
            </span>
          </div>
        </div>

        <div className="questionnaire-stage-tabs">
          <button
            type="button"
            className={`questionnaire-stage-tab ${stage === 1 ? "active" : ""}`}
            onClick={() => setStage(1)}
          >
            Page 1
          </button>
          <button
            type="button"
            className={`questionnaire-stage-tab ${stage === 2 ? "active" : ""}`}
            onClick={() => comparisonPageComplete && setStage(2)}
            disabled={!comparisonPageComplete}
          >
            Page 2
          </button>
        </div>

        {stage === 1 && (
          <div className="questionnaire-questions-stage">
            <section className="questionnaire-section">
              <h2 className="questionnaire-section-title">Blind Comparison of Responses</h2>
              <p className="questionnaire-helper-text">
                For each prompt, review all five numbered responses. Rank them from 1 (best) to 5 (worst).
              </p>
            </section>

            {COMPARISON_PROMPTS.map((prompt) => (
              <section className="questionnaire-section questionnaire-prompt-section" key={prompt.id}>
                <div className="questionnaire-prompt-banner">
                  <h3 className="questionnaire-prompt-title">{prompt.title}</h3>
                  <p className="questionnaire-prompt-text">{prompt.prompt}</p>
                </div>

                <div className="questionnaire-response-stack">
                  {prompt.responses.map((response) => (
                    <div className="questionnaire-response-card questionnaire-response-card-accent" key={response.number}>
                      <div className="questionnaire-response-card-top">
                        <span className="questionnaire-response-number-pill">Response {response.number}</span>
                      </div>
                      <div className="questionnaire-response-card-body">
                        <p className="questionnaire-response-text">{response.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="questionnaire-ranking-panel">
                  <div className="questionnaire-ranking-scale-labels">
                    <span>Best</span>
                    <span>Worst</span>
                  </div>

                  <div className="questionnaire-ranking-grid">
                    {prompt.responses.map((response) => (
                      <div className="questionnaire-ranking-item" key={`${prompt.id}-${response.number}`}>
                        <label className="questionnaire-ranking-item-label" htmlFor={`${prompt.id}-${response.number}`}>
                          Response {response.number}
                        </label>
                        <select
                          id={`${prompt.id}-${response.number}`}
                          value={rankings[prompt.id][response.number]}
                          onChange={(e) => handleRankChange(prompt.id, response.number, e.target.value)}
                        >
                          <option value="">Select rank</option>
                          <option value="1">1 - Best</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5 - Worst</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {!isRankingValid(prompt.id) && (
                  <p className="questionnaire-warning">
                    Each response for this prompt must have one unique rank from 1 to 5.
                  </p>
                )}

                <div className="questionnaire-long-answer-card">
                  <label className="questionnaire-long-answer-label">
                    Which response best fits the prompt and why?
                  </label>
                  <textarea
                    className="questionnaire-long-answer questionnaire-long-answer-large"
                    value={followups[prompt.id].bestFitWhy}
                    onChange={(e) => handleFollowupChange(prompt.id, "bestFitWhy", e.target.value)}
                    placeholder="Explain which numbered response best matched the prompt and why."
                  />
                </div>

                <div className="questionnaire-long-answer-card">
                  <label className="questionnaire-long-answer-label">
                    Were there any responses that stood out as significantly better or worse than the others? If so, which one(s) and why?
                  </label>
                  <textarea
                    className="questionnaire-long-answer questionnaire-long-answer-large"
                    value={followups[prompt.id].standoutResponses}
                    onChange={(e) => handleFollowupChange(prompt.id, "standoutResponses", e.target.value)}
                    placeholder="Describe any standout responses and explain why."
                  />
                </div>
              </section>
            ))}

            <section className="questionnaire-section">
              <div className="questionnaire-long-answer-card">
                <label className="questionnaire-long-answer-label">
                  Which system overall provided the best responses across all prompts?
                </label>
                <div className="questionnaire-system-options">
                  {OVERALL_SYSTEM_OPTIONS.map((option) => (
                    <label key={option.id} className="questionnaire-choice questionnaire-choice-soft">
                      <input
                        type="radio"
                        name="overallBestSystem"
                        value={option.id}
                        checked={overallBestSystem === option.id}
                        onChange={() => setOverallBestSystem(option.id)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <div className="questionnaire-footer-actions">
              {!comparisonPageComplete && (
                <p className="questionnaire-warning">
                  Complete all rankings, follow-up answers, and the overall system question before continuing.
                </p>
              )}

              <button
                className="questionnaire-continue-button"
                type="button"
                onClick={() => setStage(2)}
                disabled={!comparisonPageComplete}
              >
                Continue to Page 2
              </button>
            </div>
          </div>
        )}

        {stage === 2 && (
          <div className="questionnaire-questions-stage">
            <section className="questionnaire-section">
              <h2 className="questionnaire-section-title">Altered Model Evaluation</h2>
              <p className="questionnaire-helper-text">
                Use the suggested prompts if needed, or type your own message. Only the altered model is shown here.
              </p>
            </section>

            <div className="questionnaire-live-split">
              <div className="questionnaire-live-left">
                <div className="questionnaire-prompt-selector-card">
                  <h3 className="questionnaire-prompt-selector-title">Suggested prompts</h3>
                  <div className="questionnaire-suggestion-list">
                    {SUGGESTED_PROMPTS.map((prompt, index) => (
                      <button
                        key={prompt.id}
                        type="button"
                        className={`questionnaire-suggestion-card ${selectedPromptId === prompt.id ? "active" : ""}`}
                        onClick={() => {
                          setSelectedPromptId(prompt.id);
                          handleSuggestionClick(prompt.text);
                        }}
                      >
                        <span className="questionnaire-suggestion-number">Prompt {index + 1}</span>
                        <span className="questionnaire-suggestion-text">{prompt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="questionnaire-ratings-card">
                  <h3 className="questionnaire-prompt-selector-title">Rate the altered model overall</h3>

                  {RATING_ITEMS.map((item) => (
                    <div className="questionnaire-rating-block" key={item.id}>
                      <p className="questionnaire-rating-title">{item.label}</p>
                      <p className="questionnaire-rating-statement">{item.statement}</p>

                      <div className="questionnaire-scale-row">
                        {["1", "2", "3", "4", "5"].map((value) => (
                          <label key={value} className="questionnaire-scale-option questionnaire-choice-soft">
                            <input
                              type="radio"
                              name={item.id}
                              value={value}
                              checked={ratings[item.id] === value}
                              onChange={() => handleRatingChange(item.id, value)}
                            />
                            <span>{value}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="questionnaire-live-right">
                <div className="questionnaire-chat-shell">
                  <div className="questionnaire-chat-header">
                    <span className="questionnaire-response-badge">Altered Model Chat</span>
                  </div>

                  <div className="questionnaire-chat-messages" ref={chatScrollRef}>
                    {selectedChat.length === 0 ? (
                      <p className="questionnaire-placeholder-text">
                        Start the conversation by typing your own message or selecting a suggested prompt.
                      </p>
                    ) : (
                      selectedChat.map((message, index) => (
                        <div
                          key={`${message.role}-${index}`}
                          className={`questionnaire-chat-bubble ${
                            message.role === "user"
                              ? "questionnaire-chat-bubble-user"
                              : "questionnaire-chat-bubble-assistant"
                          }`}
                        >
                          {message.content}
                        </div>
                      ))
                    )}

                    {isGenerating && (
                      <div className="questionnaire-chat-bubble questionnaire-chat-bubble-assistant">
                        Generating response...
                      </div>
                    )}
                  </div>

                  <div className="questionnaire-chat-input-wrap">
                    <textarea
                      ref={textareaRef}
                      className="questionnaire-chat-input"
                      value={chatInput}
                      onChange={handleInputChange}
                      placeholder="Type a message to the altered model..."
                      rows={1}
                    />
                    <button
                      type="button"
                      className="questionnaire-generate-button"
                      onClick={handleSendChat}
                      disabled={isGenerating}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
                        <div className="questionnaire-safety-notice">
              <p>
                <strong>Prototype notice:</strong> This chatbot is a working
                prototype. Please review all responses carefully and do not rely
                on them without checking their suitability for your situation.
              </p>
              <p>
                <strong>Wellbeing notice:</strong> This tool is not a substitute
                for professional, medical, or crisis support. It may not
                respond appropriately to sensitive or high-risk situations. It
                should be used only by people who feel comfortable engaging with
                this kind of content, and anyone under 18 should use it with
                appropriate adult supervision.
              </p>
            </div>

            <div className="questionnaire-footer-actions">
              {!modelEvaluationComplete && (
                <p className="questionnaire-warning">
                  Send at least one message to the altered model and complete all 5 rating questions before submitting.
                </p>
              )}

              <button
                className="questionnaire-continue-button"
                type="button"
                onClick={handleFinalSubmit}
                disabled={!modelEvaluationComplete}
              >
                Submit Questionnaire
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}