import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/questionnaire.css";

const CONSENT_ITEMS = [
  {
    id: "q1",
    required: true,
    text: "I confirm that I have read and understood the participant information sheet."
  },
  {
    id: "q2",
    required: true,
    text: "I confirm that I have had the opportunity to consider the information and understand what taking part involves."
  },
  {
    id: "q3",
    required: true,
    text: "I understand that my participation is voluntary and that I am free to stop at any point before final submission."
  },
  {
    id: "q4",
    required: true,
    text: "I agree to take part in this study."
  },
  {
    id: "q5",
    required: false,
    text: "I agree that my submitted artefacts or written responses may be retained for analysis within this project."
  },
  {
    id: "q6",
    required: false,
    text: "I agree that anonymised data may be shared with Manchester Metropolitan University for academic purposes."
  },
  {
    id: "q7",
    required: false,
    text: "I agree that anonymised quotations may be used in the final report or presentation."
  },
  {
    id: "q8",
    required: false,
    text: "I agree that anonymised data may be archived or used in future related academic outputs."
  }
];
const INFORMATION_SECTIONS = [
  {
    title: "Study title",
    body: [
      "Synoptic Project Chatbot Study"
    ]
  },
  {
    title: "What is the purpose of this study?",
    body: [
      "This study evaluates chatbot responses and questionnaire data as part of an academic project.",
      "You will be asked to read the participant information, complete a consent form, and later answer survey questions."
    ]
  },
  {
    title: "What will I be asked to do?",
    body: [
      "You will read the participant information, complete the consent form, then answer the study questions.",
      "You may also interact with the chatbot interface as part of the study flow."
    ]
  },
  {
    title: "Do I have to take part?",
    body: [
      "No. Participation is voluntary.",
      "You should only continue if you understand the information provided and agree to participate."
    ]
  },
  {
    title: "How will my data be handled?",
    body: [
      "Your session is identified using a randomly generated participant ID rather than personally identifying information.",
      "Responses are intended to be stored without direct identifying details."
    ]
  },
  {
    title: "When will you destroy my information?",
    body: [
      "Identifiable data (if any) will be deleted within a month after data collection ends.",
      "Anonymised data may be retained for up to 5 years for academic record-keeping, and use in masters and doctorate study. Once anonymised, data cannot be withdrawn because it will no longer be linked to you."
    ]
  },
  {
    title: "Data Protection Law",
    body: [
      "Data protection legislation requires that we state the ‘legal basis’ for processing information about you. In the case of research, this is ‘a task in the public interest.’ If we use more sensitive information about you, such as information about your health, religion, or ethnicity (called ‘special category’ information), our basis lies in research in the public interest. Manchester Metropolitan is the Controller for this information and is responsible for looking after your data and using it in line with the requirements of the data protection legislation applicable in the UK.",
      "You have the right to make choices about your information under the data protection legislation, such as the right of access and the right to object, although in some circumstances these rights are not absolute. If you have any questions, or would like to exercise these rights, please contact the researcher or the University Data Protection Officer using the details below."
    ]
  },
  {
    title: "Can I stop taking part and delete my data?",
    body: [
      "You can stop being a part of the study at any time, without giving a reason. You can ask us to delete your data at any time, but it might not always be possible. If you ask us to delete information before 23/04/2026, we will make sure this is done. If you ask us to delete data after this point, we might not be able to. If your data is anonymised, we will not be able to withdraw it, because we will not know which data is yours."
    ]
  },
  {
    title: "What will happen to the results of the research study?",
    body: [
      "The results will be written up as part of a university project submission.",
      "Findings may also:",
      "• Be presented in academic presentations",
      "• Be included in anonymised academic publications",
      "• Participants will not be individually identified in any output"
    ]
  },
  {
    title: "Who has reviewed this research project?",
    body: [
      "This research project has been reviewed and approved by Manchester Metropolitan University’s Research Ethics Committee.",
      "Ethical approval number (EthOS): [approval number]"
    ]
  },
  {
    title: "Who do I contact if I have concerns about this study or I wish to complain?",
    body: [
      "Researcher:",
      "• Benjamin Nebreda",
      "• 23671206@stu.mmu.ac.uk",
      "Supervisor:",
      "• Kate MacFarlane",
      "• k.macfarlane@mmu.ac.uk",
      "Manchester Metropolitan Data Protection Officer our Data Protection Officer can be contacted using the dataprotection@mmu.ac.uk e-mail address, by calling +44 (0)7584 330586or in writing to: Data Protection Officer, Legal & Governance, Ormond Building, Lower Ormond Street, Manchester, M15 6BX",
      "UK Information Commissioner’s Office",
      "You have the right to complain directly to the Information Commissioner’s Office if you would like to complain about how we process your personal data:",
      "https://ico.org.uk/global/contact-us/"
    ]
  }
];

function generateParticipantId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `pid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getTodayDate() {
  return new Date().toLocaleDateString("en-GB");
}

export default function Questionnaire() {
  const navigate = useNavigate();

  const [participantId, setParticipantId] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [consentAnswers, setConsentAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
    q7: "",
    q8: ""
  });
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);

  useEffect(() => {
    const storedId = sessionStorage.getItem("participant-id");
    const storedConsent = sessionStorage.getItem("participant-consent");
    const storedSignature = sessionStorage.getItem("participant-signature-confirmed");

    const idToUse = storedId || generateParticipantId();

    setParticipantId(idToUse);
    setCurrentDate(getTodayDate());

    sessionStorage.setItem("participant-id", idToUse);

    if (storedConsent) {
      try {
        setConsentAnswers(JSON.parse(storedConsent));
      } catch {
        // ignore malformed session storage
      }
    }

    if (storedSignature) {
      setSignatureConfirmed(storedSignature === "true");
    }
  }, []);

  useEffect(() => {
    if (!participantId) return;

    sessionStorage.setItem("participant-consent", JSON.stringify(consentAnswers));
    sessionStorage.setItem(
      "participant-signature-confirmed",
      String(signatureConfirmed)
    );
  }, [consentAnswers, signatureConfirmed, participantId]);

  const handleConsentChange = (questionId, value) => {
    setConsentAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const requiredConsentComplete = useMemo(() => {
    return CONSENT_ITEMS
      .filter((item) => item.required)
      .every((item) => consentAnswers[item.id] === "yes");
  }, [consentAnswers]);

  const allRequiredComplete = requiredConsentComplete && signatureConfirmed;

  const handleContinue = () => {
    if (!allRequiredComplete) return;

    navigate("/questionnaire/questions");
  };

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-topbar">
        <button
          className="questionnaire-home-button"
          onClick={() => navigate("/")}
          type="button"
        >
          Home
        </button>

        <div className="questionnaire-title-block">
          <h1 className="questionnaire-title">Participant Information and Consent</h1>
          <p className="questionnaire-subtitle">
            Please read the information below before completing the consent form.
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
            <span className="questionnaire-meta-label">Date</span>
            <span className="questionnaire-meta-value">{currentDate}</span>
          </div>
        </div>

        <section className="questionnaire-section">
          <h2 className="questionnaire-section-title">Participant Information Sheet</h2>

          <div className="questionnaire-info-card">
            {INFORMATION_SECTIONS.map((section) => (
              <div className="questionnaire-info-block" key={section.title}>
                <h3 className="questionnaire-info-heading">{section.title}</h3>
                {section.body.map((paragraph, index) => (
                <p className="questionnaire-info-text" key={`${section.title}-${index}`}>
                    {paragraph.startsWith("http") ? (
                    <a
                        href={paragraph}
                        target="_blank"
                        rel="noreferrer"
                        className="questionnaire-info-link"
                    >
                        {paragraph}
                    </a>
                    ) : (
                    paragraph
                    )}
                </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="questionnaire-section">
          <h2 className="questionnaire-section-title">Consent Form</h2>

          <div className="questionnaire-consent-card">
            {CONSENT_ITEMS.map((item, index) => (
              <div className="questionnaire-consent-row" key={item.id}>
                <div className="questionnaire-consent-number">{index + 1}</div>

                <div className="questionnaire-consent-body">
                  <p className="questionnaire-consent-text">
                    {item.text}
                    {item.required && (
                      <span className="questionnaire-required-tag">Required</span>
                    )}
                  </p>

                  <div className="questionnaire-binary-group">
                    <label className="questionnaire-choice">
                      <input
                        type="radio"
                        name={item.id}
                        value="yes"
                        checked={consentAnswers[item.id] === "yes"}
                        onChange={() => handleConsentChange(item.id, "yes")}
                      />
                      <span>Yes</span>
                    </label>

                    <label className="questionnaire-choice">
                      <input
                        type="radio"
                        name={item.id}
                        value="no"
                        checked={consentAnswers[item.id] === "no"}
                        onChange={() => handleConsentChange(item.id, "no")}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="questionnaire-section">
          <h2 className="questionnaire-section-title">Signature Confirmation</h2>

          <div className="questionnaire-signature-card">
            <div className="questionnaire-signature-line">
              <span className="questionnaire-signature-label">Participant ID used as signature confirmation:</span>
              <span className="questionnaire-signature-value">{participantId}</span>
            </div>

            <div className="questionnaire-signature-line">
              <span className="questionnaire-signature-label">Date:</span>
              <span className="questionnaire-signature-value">{currentDate}</span>
            </div>

            <label className="questionnaire-signature-checkbox">
              <input
                type="checkbox"
                checked={signatureConfirmed}
                onChange={(e) => setSignatureConfirmed(e.target.checked)}
              />
              <span>
                I confirm that the participant ID shown above is my study identifier and acts as my signature confirmation for this consent form.
              </span>
            </label>
          </div>
        </section>

        <div className="questionnaire-footer-actions">
          {!requiredConsentComplete && (
            <p className="questionnaire-warning">
              Required consent items 1–4 must all be marked Yes before continuing.
            </p>
          )}

          {!signatureConfirmed && (
            <p className="questionnaire-warning">
              You must confirm the signature checkbox before continuing.
            </p>
          )}

          <button
            className="questionnaire-continue-button"
            type="button"
            onClick={handleContinue}
            disabled={!allRequiredComplete}
          >
            Continue to Questions
          </button>
        </div>
      </div>
    </div>
  );
}