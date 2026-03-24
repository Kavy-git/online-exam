import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Test.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Test = () => {
  const [activeTab, setActiveTab] = useState("created");
  const [testsCreated, setTestsCreated] = useState([]);
  const [regNo, setRegNo] = useState("");

  const navigate = useNavigate();

  // ---------------- FETCH CREATED TESTS ----------------
  const fetchCreatedTests = async () => {
    try {
      const res = await axios.get("${import.meta.env.VITE_API_URL}/api/tests", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      setTestsCreated(res.data.tests);
    } catch (err) {
      console.error("Failed to fetch tests:", err);
    }
  };

  // ---------------- RUN ON TAB SWITCH ----------------
  useEffect(() => {
    if (activeTab === "created") fetchCreatedTests();
  }, [activeTab]);

  const openTestDetails = (id) => navigate(`/testdetails/${id}`);

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const handleSubmitReg = () => {
  if (!regNo.trim()) {
    alert("Please enter your Register Number");
    return;
  }

  navigate(`/attemptsby/${regNo}`);
};


  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="test-container">

        {/* ------------------- TABS ------------------- */}
        <div className="test-tabs">
          <button
            className={activeTab === "created" ? "active" : ""}
            onClick={() => setActiveTab("created")}
          >
            Test Created
          </button>

          <button
            className={activeTab === "attempted" ? "active" : ""}
            onClick={() => setActiveTab("attempted")}
          >
            Test Attempted
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* ------------------- CREATED TESTS ------------------- */}
          {activeTab === "created" && (
            <motion.div
              key="createdTab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2>Created Tests</h2>

              {testsCreated.length === 0 ? (
                <p>No tests created yet.</p>
              ) : (
                testsCreated.map((test) => (
                  <button
                    key={test._id}
                    className="test-button"
                    onClick={() => openTestDetails(test._id)}
                  >
                    <h3>{test.title}</h3>
                    <p>{test.questions.length} Questions</p>
                    <p className="created-time">
                      Created: {formatDate(test.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </motion.div>
          )}

          {/* ------------------- ATTEMPTED TEST FORM ONLY ------------------- */}
          {activeTab === "attempted" && (
            <motion.div
              key="attemptedTab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="reg-form"
            >
              <h3>Enter Your Register Number</h3>

              <input
                type="text"
                placeholder="Register Number"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
              />

              <button className="submit-reg-btn" onClick={handleSubmitReg}>
                Submit
              </button>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </motion.div>
  );
};

export default Test;
