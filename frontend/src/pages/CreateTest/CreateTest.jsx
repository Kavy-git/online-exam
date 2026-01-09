import React, { useState } from "react";
import "./CreateTest.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const CreateTest = () => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // Test timing state
  const [testType, setTestType] = useState("");
  const [testDate, setTestDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timerHours, setTimerHours] = useState("");
  const [timerMinutes, setTimerMinutes] = useState("");
  const [timerSeconds, setTimerSeconds] = useState("");
  const [requireCameraMic, setRequireCameraMic] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==============================
  // ADD QUESTIONS
  // ==============================
  const addMCQ = () => {
    setQuestions([
      ...questions,
      { type: "mcq", question: "", options: ["", ""], answer: "" },
    ]);
  };

  const addShortAnswer = () => {
    setQuestions([...questions, { type: "short", question: "", answer: "" }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  // ==============================
  // VALIDATION
  // ==============================
  const validateQuestions = () => {
    const basicValid =
      title.trim() !== "" &&
      questions.every(
        (q) =>
          q.question.trim() !== "" &&
          q.answer.trim() !== "" &&
          (q.type !== "mcq" ||
            (q.options.length >= 2 &&
              q.options.every((opt) => opt.trim() !== "")))
      );

    if (!basicValid) return false;

    if (testType === "") {
      alert("Please select a test type.");
      return false;
    }

    if (testType === "duration") {
      if (!testDate || !startTime || !endTime) {
        alert("Please fill Date, Start Time & End Time for duration tests.");
        return false;
      }
    }

    if (testType === "timer") {
      if (
        timerHours === "" ||
        timerMinutes === "" ||
        timerSeconds === "" ||
        (Number(timerHours) === 0 &&
          Number(timerMinutes) === 0 &&
          Number(timerSeconds) === 0)
      ) {
        alert("Please enter a valid timer.");
        return false;
      }
    }

    if (requireCameraMic === "") {
      alert("Select camera/mic requirement.");
      return false;
    }

    return true;
  };

  // ==============================
  // FIX TIME FORMAT (HH:MM → HH:MM:SS)
  // ==============================
  const fixTime = (t) => (t.length === 5 ? `${t}:00` : t);

  // ==============================
  // SEND TEST TO BACKEND
  // ==============================
  
const confirmCreate = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (loading) return; 
  setLoading(true);

  try {
    const res = await axios.post(
      "http://localhost:4000/api/tests/create",
      {
        title,
        questions,
        testType,
        testDate,
        startTime: fixTime(startTime),
        endTime: fixTime(endTime),
        timerHours,
        timerMinutes,
        timerSeconds,
        requireCameraMic,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"), // 🔥 REQUIRED
        },
      }
    );

    console.log("Test Created:", res.data);
    alert("Test created successfully!");
    setShowPopup(false);
    navigate("/Test");

  } catch (error) {
    console.error(error);
    alert("Failed to create test.");
  } finally {
    setLoading(false);
  }
};



  const handleCreateClick = () => {
    if (!validateQuestions()) return;
    setShowPopup(true);
  };

  // ==============================
  // RENDER UI
  // ==============================
  return (
     <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="create-test-container">
      <h1>Create Your Test</h1>

      {/* Title */}
      <div className="title-box">
        <input
          type="text"
          placeholder="Enter Test Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Test Type */}
      <div className="test-type-dropdown">
        <label>Select Test Type: </label>
        <select value={testType} onChange={(e) => setTestType(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="duration">Duration</option>
          <option value="non-duration">None</option>
          <option value="timer">Timer</option>
        </select>
      </div>

      {/* Duration Inputs */}
      {testType === "duration" && (
        <div className="duration-section">
          <label>Date: </label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
          />

          <label>Start Time (HH:MM:SS): </label>
          <input
            type="time"
            step="1"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <label>End Time (HH:MM:SS): </label>
          <input
            type="time"
            step="1"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      )}

      {/* Timer Inputs */}
      {testType === "timer" && (
        <div className="timer-section">
          <label>Set Timer:</label>
          <div className="timer-inputs">
            <input
              type="number"
              min="0"
              placeholder="Hours"
              value={timerHours}
              onChange={(e) => setTimerHours(e.target.value)}
            />
            <span>:</span>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="Minutes"
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(e.target.value)}
            />
            <span>:</span>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="Seconds"
              value={timerSeconds}
              onChange={(e) => setTimerSeconds(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="button-row">
        <button onClick={addMCQ}>➕ Add MCQ</button>
        <button onClick={addShortAnswer}>✏️ Add Short Answer</button>
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <div key={i} className="question-card">
          <div className="question-header">
            <h3>{q.type === "mcq" ? `MCQ ${i + 1}` : `Short Answer ${i + 1}`}</h3>
            <button className="remove-btn" onClick={() => removeQuestion(i)}>
              ✖
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter your question..."
            value={q.question}
            onChange={(e) => updateQuestion(i, "question", e.target.value)}
          />

          {q.type === "mcq" && (
            <div className="options">
              {q.options.map((opt, j) => (
                <div key={j} className="option-item">
                  <input
                    type="text"
                    placeholder={`Option ${j + 1}`}
                    value={opt}
                    onChange={(e) =>
                      updateOption(i, j, e.target.value)
                    }
                  />
                  {q.options.length > 2 && (
                    <button
                      className="remove-option-btn"
                      onClick={() => removeOption(i, j)}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              <button className="add-option-btn" onClick={() => addOption(i)}>
                ➕ Add Option
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Enter correct answer..."
            value={q.answer}
            onChange={(e) => updateQuestion(i, "answer", e.target.value)}
          />
        </div>
      ))}

      {/* Camera/Mic requirement */}
      <div className="camera-mic-requirement">
        <label>Attender must give Camera & Microphone for better proctoring :</label>

        <div className="toggle-buttons">
          <button
            className={requireCameraMic === "yes" ? "active-toggle" : ""}
            onClick={() => setRequireCameraMic("yes")}
            type="button"
          >
            YES
          </button>

          <button
            className={requireCameraMic === "no" ? "active-toggle" : ""}
            onClick={() => setRequireCameraMic("no")}
            type="button"
          >
            NO
          </button>
        </div>
      </div>

      {/* Create */}
      <div className="create-section">
        <button
          className="create-btn"
          disabled={questions.length === 0}
          onClick={handleCreateClick}
        >
          ✅ Create Test
        </button>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-box">
            <h2>Confirm Test Creation?</h2>
            <div className="popup-buttons">
              <button onClick={confirmCreate}>Confirm</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
     </motion.div>
  );
};

export default CreateTest;
