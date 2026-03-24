import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./TestDetails.css";
import { motion } from "framer-motion";

const TestDetails = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/tests/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      alert("Test deleted successfully!");
      navigate("/Test");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete test");
    }
  };

  const handleShare = () => setShowSharePopup(true);

const copyCode = () => {
  let extraInfo = "";

  // ⭐ TIMER TEST → ADD DURATION
  if (test?.testType === "timer") {
    const totalMinutes =
      Number(test?.timerHours || 0) * 60 +
      Number(test?.timerMinutes || 0) +
      Math.floor(Number(test?.timerSeconds || 0) / 60);

    extraInfo = `⏳ Duration: ${totalMinutes} minutes`;
  }

  // ⭐ DURATION TEST → ADD DATE + TIME
  else if (test?.testType === "duration") {
    const formattedDate = test?.testDate
      ? new Date(test.testDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "--";

    const start =
      test?.startTime?.length === 5
        ? `${test.startTime}:00`
        : test?.startTime || "--";

    const end =
      test?.endTime?.length === 5
        ? `${test.endTime}:00`
        : test?.endTime || "--";

    extraInfo = `📅 Date: ${formattedDate}
🕒 Start Time: ${start}
🕓 End Time: ${end}`;
  }

  // ⭐ NON-DURATION TEST
  else if (test?.testType === "non-duration") {
    extraInfo = `⏳ Duration: No fixed duration`;
  }

  // ============================ FINAL MESSAGE ============================
  const message = `✨ Welcome to Zonline ✨

📝 Test Name: ${test?.title}
📘 Test Type: ${test?.testType}

${extraInfo}

🎥 Camera Required: ${
    test?.requireCameraMic?.toLowerCase() === "yes" ? "YES" : "NO"
  }
🎤 Microphone Required: ${
    test?.requireCameraMic?.toLowerCase() === "yes" ? "YES" : "NO"
  }

🔐 Test Code: ${test?._id}

Enter this code inside Zonline to attempt the test!
`;

  navigator.clipboard.writeText(message);
  alert("Message copied!");
};



  const fetchData = async () => {
    try {
      // 1️⃣ Fetch Test
      const testRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tests/${id}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      setTest(testRes.data.test);


      // 2️⃣ Fetch Answers
      const answersRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/answers/byTest/${id}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      // 3️⃣ Fetch Snapshots
      const snapshotsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attempt/byTest/${id}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const answerList = answersRes.data.attempts || [];
      const snapshotList = snapshotsRes.data.attempts || [];

      // 4️⃣ Merge snapshot → answer
      const merged = answerList.map((ans) => {
        const snap = snapshotList.find(
          (s) =>
            String(s.testId) === String(ans.testId) &&
            String(s.regNo).toLowerCase() === String(ans.regNo).toLowerCase()
        );

        return {
          ...ans,
          snapshotThumb: snap?.snapshotThumb || null,
        };
      });

      merged.sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );

      setAttempts(merged);
    } catch (error) {
      console.error("Error fetching test:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // =============================
  // BEFORE LOADING — SHOW SKELETON
  // =============================
  if (!test) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="test-details">
          <h2>Loading test details...</h2>
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-box"></div>
          <div className="skeleton skeleton-box"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="test-details">
        <button
          className="back-btn"
          onClick={() => {
            if (window.history.length > 2) navigate(-1);
            else navigate("/Test");
          }}
        >
          ← Go Back
        </button>

        <div className="header-row">
          <h1>{test?.title}</h1>
          <div className="right-buttons">
            <button className="share-btn" onClick={handleShare}>
              Share
            </button>
            <button className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>

        <h2>Questions & Answers</h2>

        {/* SAFE CHECK */}
        {test?.questions?.length === 0 ? (
          <p>No questions found.</p>
        ) : (
          test?.questions?.map((q, i) => (
            <div key={i} className="question-block">
              <h3>
                Q{i + 1}. {q.question}
              </h3>

              {q.type === "mcq" && (
                <ul>
                  {q.options.map((opt, j) => (
                    <li key={j}>{opt}</li>
                  ))}
                </ul>
              )}

              <p>
                <strong>Answer: </strong>
                {q.answer}
              </p>
            </div>
          ))
        )}

        {/* SHARE POPUP */}
{showSharePopup && (
  <div className="popup">
    <div className="popup-box">
      <h2>Welcome to Zonline</h2>

      <p>
        Enter this code to attempt <strong>"{test?.title}"</strong>
      </p>

      <p><strong>Test Code:</strong> {test?._id}</p>

      {/* TIMER → ONLY show duration */}
      {test?.testType === "timer" && (
        <p>
          <strong>Duration:</strong>{" "}
          {Number(test.timerHours) * 60 +
            Number(test.timerMinutes) +
            Math.floor(Number(test.timerSeconds) / 60)}{" "}
          minutes
        </p>
      )}

      {/* DURATION TEST → show Date + Start/End time */}
      {test?.testType === "duration" && (
        <>
          <p>
            <strong>Date:</strong>{" "}
            {test.testDate && !isNaN(new Date(test.testDate))
              ? new Date(test.testDate).toLocaleDateString()
              : "--"}
          </p>

          <p><strong>Start Time:</strong> {test?.startTime || "--"}</p>
          <p><strong>End Time:</strong> {test?.endTime || "--"}</p>
        </>
      )}

      {/* NON-DURATION */}
      {test?.testType === "non-duration" && (
        <p><strong>Duration:</strong> No fixed duration</p>
      )}

      {/* Camera / Mic */}
      <p>
        <strong>Camera Required:</strong>{" "}
        {test?.requireCameraMic?.toLowerCase() === "yes" ? "YES" : "NO"}
      </p>

      <p>
        <strong>Microphone Required:</strong>{" "}
        {test?.requireCameraMic?.toLowerCase() === "yes" ? "YES" : "NO"}
      </p>

      <button onClick={copyCode}>Copy Code</button>
      <button onClick={() => setShowSharePopup(false)}>Close</button>
    </div>
  </div>
)}

        <hr />

        <h2>Attenders Details</h2>

        <div className="student-grid">
          {attempts.length === 0 ? (
            <p className="no-attempts">No one has attempted this test yet.</p>
          ) : (
            attempts.map((a) => {
              let correct = 0,
                wrong = 0,
                notAnswered = 0;

              test?.questions?.forEach((q) => {
                const userAns = a.answers?.[q._id];

                if (!userAns || userAns.trim() === "") {
                  notAnswered++;
                  return;
                }

                if (
                  userAns.trim().toLowerCase() ===
                  q.answer.trim().toLowerCase()
                )
                  correct++;
                else wrong++;
              });

              return (
                <div
                  key={a._id}
                  className="student-card"
                  onClick={() => navigate(`/attemptdetails/${a._id}`)}
                >
                  {test?.requireCameraMic?.toLowerCase() === "yes" && (
                    <img
                      src={a.snapshotThumb || "/default-avatar.png"}
                      alt="student"
                      className="student-photo"
                    />
                  )}

                  <h3>{a.name}</h3>
                  <p>{a.regNo}</p>

                  <div className="count-row">
                    <span className="correct">✔ {correct}</span>
                    <span className="wrong">✘ {wrong}</span>
                    <span className="not-answered">N/A {notAnswered}</span>
                    {test?.requireCameraMic?.toLowerCase() === "yes" && (
                      <span className="warnings">
                        ⚠ {a.warnings?.length || 0}
                      </span>
                    )}
                  </div>

                  <p className="submitted-time">
                    Submitted:{" "}
                    {new Date(a.submittedAt).toLocaleString("en-IN")}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TestDetails;
