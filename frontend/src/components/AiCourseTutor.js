import React, { useState, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { FaBrain, FaPaperPlane, FaRedo, FaCheck, FaTimes, FaGraduationCap } from "react-icons/fa"
import { getBackendUrl } from "../utils/apiConfig"
import "./AiCourseTutor.css"

function AiCourseTutor({ courseTitle, courseCategory, activeVideoId }) {
  const backendUrl = getBackendUrl()
  const [activeTab, setActiveTab] = useState("explain") // "explain" | "quiz" | "ask"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Explain State
  const [explanation, setExplanation] = useState("")

  // Quiz State
  const [quizList, setQuizList] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})

  // Chat / Ask State
  const [chatLog, setChatLog] = useState([])
  const [customQuestion, setCustomQuestion] = useState("")

  const token = localStorage.getItem("token")
  const authHeaders = { Authorization: `Bearer ${token}` }

  // Load explanation automatically when course/tab changes
  useEffect(() => {
    if (activeTab === "explain" && !explanation && courseTitle) {
      handleFetchExplanation()
    }
    if (activeTab === "quiz" && quizList.length === 0 && courseTitle) {
      handleFetchQuiz()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, courseTitle])

  const handleFetchExplanation = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(
        `${backendUrl}/api/ai/explain`,
        {
          courseTitle,
          topic: courseCategory || courseTitle,
          context: `Explaining key principles for ${courseTitle}`,
        },
        { headers: authHeaders }
      )
      setExplanation(res.data?.explanation || "No explanation returned.")
    } catch (err) {
      console.error("AI explain error:", err)
      setError("Unable to reach AI tutor. Please check network connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleFetchQuiz = async () => {
    setLoading(true)
    setError(null)
    setSelectedAnswers({})
    try {
      const res = await axios.post(
        `${backendUrl}/api/ai/quiz`,
        {
          courseTitle,
          category: courseCategory,
          topic: courseTitle,
        },
        { headers: authHeaders }
      )
      setQuizList(Array.isArray(res.data?.quiz) ? res.data.quiz : [])
    } catch (err) {
      console.error("AI quiz error:", err)
      setError("Failed to generate quiz questions.")
    } finally {
      setLoading(false)
    }
  }

  const handleSendCustomQuestion = async (e) => {
    if (e) e.preventDefault()
    if (!customQuestion.trim() || loading) return

    const questionText = customQuestion.trim()
    setCustomQuestion("")
    setLoading(true)
    setError(null)

    // Append user message immediately
    const userMsg = { role: "user", text: questionText, time: new Date() }
    setChatLog((prev) => [...prev, userMsg])

    try {
      const res = await axios.post(
        `${backendUrl}/api/ai/explain`,
        {
          courseTitle,
          topic: courseCategory,
          userQuestion: questionText,
        },
        { headers: authHeaders }
      )

      const aiMsg = {
        role: "assistant",
        text: res.data?.explanation || "I couldn't process that question. Try asking differently.",
        time: new Date(),
      }
      setChatLog((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error("Custom question error:", err)
      setError("AI tutor temporarily unavailable.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (questionIdx, optionIdx) => {
    if (selectedAnswers[questionIdx] !== undefined) return // already answered
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }))
  }

  return (
    <div className="ai-tutor-container">
      {/* Header */}
      <div className="ai-tutor-header">
        <div className="ai-header-brand">
          <div className="ai-title-wrap">
            <FaBrain className="ai-sparkle-icon" />
            <span className="ai-tutor-title">SkillVoyage AI Tutor</span>
          </div>
          <span className="ai-model-tag">Groq 120B</span>
        </div>

        {/* Mode Tabs */}
        <div className="ai-mode-tabs" role="tablist">
          <button
            type="button"
            className={`ai-tab-btn ${activeTab === "explain" ? "active" : ""}`}
            onClick={() => setActiveTab("explain")}
          >
            Concepts
          </button>
          <button
            type="button"
            className={`ai-tab-btn ${activeTab === "quiz" ? "active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            Quiz
          </button>
          <button
            type="button"
            className={`ai-tab-btn ${activeTab === "ask" ? "active" : ""}`}
            onClick={() => setActiveTab("ask")}
          >
            Ask Tutor
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="ai-tutor-viewport">
        {loading && (
          <div className="ai-thinking-state">
            <div className="ai-thinking-spinner" />
            <span className="ai-thinking-text">Groq AI is analyzing course concepts...</span>
          </div>
        )}

        {error && !loading && (
          <div className="ai-output-card" style={{ borderColor: "#ef4444" }}>
            <span style={{ color: "#f87171", fontSize: "0.85rem", fontWeight: 600 }}>⚠️ {error}</span>
            <button
              type="button"
              className="ai-refresh-btn"
              onClick={activeTab === "explain" ? handleFetchExplanation : handleFetchQuiz}
            >
              <FaRedo /> Retry
            </button>
          </div>
        )}

        {/* TAB 1: Concept Explanation */}
        {!loading && activeTab === "explain" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="explain-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="ai-output-card"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 className="ai-output-title">Lecture Key Concepts</h4>
                <button
                  type="button"
                  className="ai-refresh-btn"
                  onClick={handleFetchExplanation}
                  title="Regenerate Summary"
                >
                  <FaRedo /> Refresh
                </button>
              </div>

              <div className="ai-output-text">
                {explanation || "Click refresh to generate AI key takeaways for this course."}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* TAB 2: Practice Quiz */}
        {!loading && activeTab === "quiz" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="quiz-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.82rem", color: "#818cf8", fontWeight: 700, textTransform: "uppercase" }}>
                  Active Concept Check
                </span>
                <button type="button" className="ai-refresh-btn" onClick={handleFetchQuiz} title="New Questions">
                  <FaRedo /> New Quiz
                </button>
              </div>

              {quizList.map((item, qIdx) => {
                const userChoice = selectedAnswers[qIdx]
                const hasAnswered = userChoice !== undefined
                const isCorrect = hasAnswered && userChoice === item.answerIndex

                return (
                  <div key={qIdx} className="quiz-card">
                    <span className="quiz-question-number">Question {qIdx + 1} of 3</span>
                    <h5 className="quiz-question-text">{item.question}</h5>

                    <div className="quiz-options-list">
                      {item.options?.map((opt, oIdx) => {
                        let btnClass = "quiz-option-btn"
                        if (hasAnswered) {
                          if (oIdx === item.answerIndex) {
                            btnClass += " selected-correct"
                          } else if (userChoice === oIdx) {
                            btnClass += " selected-wrong"
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            className={btnClass}
                            disabled={hasAnswered}
                            onClick={() => handleSelectOption(qIdx, oIdx)}
                          >
                            <span style={{ opacity: 0.6, fontSize: "0.78rem", minWidth: "16px" }}>
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span style={{ flex: 1 }}>{opt}</span>
                            {hasAnswered && oIdx === item.answerIndex && <FaCheck style={{ color: "#10b981" }} />}
                            {hasAnswered && userChoice === oIdx && !isCorrect && (
                              <FaTimes style={{ color: "#ef4444" }} />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {hasAnswered && (
                      <div className="quiz-explanation-box">
                        <strong style={{ color: isCorrect ? "#34d399" : "#f87171" }}>
                          {isCorrect ? "Correct! " : "Incorrect. "}
                        </strong>
                        {item.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* TAB 3: Custom Q&A */}
        {activeTab === "ask" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", minHeight: "100%" }}>
            {chatLog.length === 0 && !loading && (
              <div className="ai-output-card" style={{ textAlign: "center", padding: "28px 18px" }}>
                <FaGraduationCap style={{ fontSize: "2rem", color: "#6366f1", margin: "0 auto 10px" }} />
                <h4 style={{ color: "#ffffff", fontSize: "0.95rem", margin: "0 0 6px" }}>Ask Any Technical Question</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>
                  Ask about code snippets, best practices, or specific lines from this course.
                </p>
              </div>
            )}

            {chatLog.map((msg, i) => (
              <div
                key={i}
                className="ai-output-card"
                style={{
                  background: msg.role === "user" ? "#1e293b" : "#090e1a",
                  borderColor: msg.role === "user" ? "#334155" : "#1e293b",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {msg.role === "user" ? (
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#818cf8" }}>You</span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981" }}>SkillVoyage AI</span>
                  )}
                </div>
                <div className="ai-output-text">{msg.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input bar for Ask Mode */}
      {activeTab === "ask" && (
        <form className="ai-chat-input-bar" onSubmit={handleSendCustomQuestion}>
          <input
            type="text"
            className="ai-query-input"
            placeholder="Ask AI tutor about this course..."
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
          />
          <button type="submit" className="ai-send-btn" disabled={!customQuestion.trim() || loading}>
            <FaPaperPlane />
          </button>
        </form>
      )}
    </div>
  )
}

export default AiCourseTutor
