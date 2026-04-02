import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './AttemptTest.css'
import { motion } from "framer-motion";

const AttemptTest = () => {
  const navigate = useNavigate();

  const [testCode, setTestCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setError("");

  const token = localStorage.getItem("token");
  if (!token) {
    setError("Please log in to attempt a test.");
    return;
  }

  if (!testCode) {
    setError("Please enter the test code");
    return;
  }

  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(testCode)) {
    setError("Invalid Test Code. Please enter a valid code.");
    return;
  }

  try {
    setLoading(true); // ✅ ADD

    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/tests/${testCode}`
    );

    const test = res.data.test;

    if (test.testType === "duration") {
      const startDateTime = new Date(`${test.testDate}T${test.startTime}`);
      const endDateTime = new Date(`${test.testDate}T${test.endTime}`);
      const now = new Date();

      if (now < startDateTime) {
        setError("❌ This test has not started yet.");
        return;
      }

      if (now > endDateTime) {
        setError("❌ This test is already over.");
        return;
      }
    }

    // ✅ CORRECT NAVIGATION
    navigate(`/attempt-info/${test._id}`);

  } catch (err) {
    setError("Test not found. Please enter a valid code.");
  } finally {
    setLoading(false); // ✅ ADD
  }
};



  return (
    <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="attempt-test-container">
      <h1>Attempt Test</h1>

      <input
        type="text"
        placeholder="Enter Test Code"
        value={testCode}
        onChange={(e) => setTestCode(e.target.value)}
        className="test-code-input"
      />

      <button
        className="paste-code-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Loading..." : "Submit Code"}
      </button>

      <div className="rules-box">
  <h3>📘 Rules & Regulations</h3>
  <ul>
    <li>Make sure your camera🎥 is turned on throughout the exam.</li>
    <li>Switching tabs or minimizing the window is strictly prohibited.</li>
    <li>Multiple faces detected will lead to automatic warnings.⚠️</li>
    <li>Maintain proper lighting for accurate face detection.</li>
    <li>Do not refresh or close the window during the test.</li>
    <li>Ensure a stable internet connection before starting.</li>
    <li>Make should you take test in a silent environment.</li>
  </ul>
</div>


      {error && <p className="error-message">{error}</p>}
    </div>
    </motion.div>
  );
};

export default AttemptTest;
