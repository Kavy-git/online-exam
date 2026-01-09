import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./AttemptDetails.css";
import { motion } from "framer-motion";



const AttemptDetails = () => {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [test, setTest] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  


  useEffect(() => {
  const load = async () => {
    try {
      // 1) Fetch attempt
      const attemptRes = await axios.get(
        `http://localhost:4000/api/answers/${id}`
      );

      const attemptData = attemptRes.data.attempt || attemptRes.data;
      setAttempt(attemptData);

      // 2) Fetch snapshot safely
      try {
        const snapRes = await axios.get(
          `http://localhost:4000/api/attempt/test/${attemptData.testId}/student/${attemptData.regNo}`
        );
        setSnapshot(snapRes.data.attempt?.snapshot || snapRes.data.snapshot);
      } catch (err) {
        console.log("Snapshot not found");
      }

      // 3) Fetch test safely
      try {
        const testRes = await axios.get(
          `http://localhost:4000/api/tests/${attemptData.testId}`
        );
        setTest(testRes.data.test || testRes.data);
      } catch (err) {
        console.warn("TEST NOT FOUND — PROBABLY DELETED");
        setTest(null);
      }

    } catch (err) {
      console.error("Attempt loading failed:", err);
    }
  };

  load();
}, [id]);




  // LOADING SKELETON
  if (!attempt || !test) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="attempt-details">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-summary"></div>
          <div className="skeleton skeleton-summary"></div>

          <div className="skeleton skeleton-question"></div>
          <div className="skeleton skeleton-question"></div>
        </div>
      </motion.div>
    );
  }

  // SCORE CALCULATION
  let correct = 0;
  let wrong = 0;
  let notAnswered = 0;

 test.questions.forEach((q) => {
  const userAnswer = attempt.answers?.[q._id];

  if (!userAnswer || userAnswer.trim() === "") {
    notAnswered++;
    return;
  }

  const cleanUser = userAnswer.trim().toLowerCase();
  const cleanCorrect = q.answer.trim().toLowerCase();

  if (cleanUser === cleanCorrect) correct++;
  else wrong++;
});


  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="attempt-details">
        {/* HEADER */}
        <div className="attempt-header-top">
  <button className="back-btn" onClick={() => window.history.back()}>
    ← Go Back
  </button>
</div>

<div className="attempt-header">
  <h1>{test.title} - Attempt Summary</h1>
</div>


        {/* STUDENT INFO (Photo on RIGHT) */}
<div className="student-info-box">
  
  {/* LEFT SIDE: NAME + REG NO */}
  <div className="student-info-text">
    <h2>{attempt.name}</h2>
    <p>Register No: {attempt.regNo}</p>
    <p>Submitted At: {new Date(attempt.submittedAt).toLocaleString()}</p>

  </div>

  {test.requireCameraMic === "yes" ? (
  <img
    src={snapshot ? snapshot : "/default-avatar.png"}
    alt="student"
    className="student-info-photo"
  />
) : (
  <p className="no-camera-text"></p>
)}

</div>



        {/* SCORE SUMMARY */}
        <div className="score-summary">
          <h3>
            Correct: <span className="correct">{correct}</span>
          </h3>
          <h3>
            Wrong: <span className="wrong">{wrong}</span>
          </h3>
          <h3>
    Not Answered: <span className="not-answered">{notAnswered}</span>
  </h3>
  {test.requireCameraMic === "yes" && (
    <h3>
      Warning: <span className="warnings">{attempt.warnings?.length || 0}</span>
    </h3>
  )}
        </div>


        {/* ALL QUESTIONS */}
        {test.questions.map((q, index) => {
          const userAnswer = attempt.answers?.[q._id] || null;

          const isCorrect =
            userAnswer &&
            userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();

          return (
            <div key={q._id} className="answer-block">
              <h3>
                Q{index + 1}: {q.question}
              </h3>

              <p>
                <strong>Your Answer:</strong>{" "}
                <span className={isCorrect ? "correct-text" : "wrong-text"}>
                  {userAnswer || "Not Answered"}
                </span>
              </p>

              <p>
                <strong>Correct Answer:</strong> {q.answer}
              </p>

              <p className={isCorrect ? "correct-text" : "wrong-text"}>
                {isCorrect ? "✔ Correct" : "❌ Wrong"}
              </p>
              
            </div>
          );
        })}

        {/* Show per-question warnings if camera/mic is required */}
{test.requireCameraMic === "yes" && attempt.warnings?.length > 0 && (
  <div className="warning-list">
    <h4>⚠ Warning Events</h4>
    <ul>
      {attempt.warnings.map((w, i) => (
        <li key={i}>
          <strong>{w.time}</strong> — {w.message}
        </li>
      ))}
    </ul>
  </div>
)}


        
      </div>
    </motion.div>
  );
};

export default AttemptDetails;
