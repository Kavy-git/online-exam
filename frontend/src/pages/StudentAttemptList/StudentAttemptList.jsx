import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./StudentAttemptList.css";

const StudentAttemptList = () => {
  const { regNo } = useParams();
  const [attempts, setAttempts] = useState([]);
  const navigate = useNavigate();

  const fetchAttempts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/answers/byReg/${regNo}`
      );
      setAttempts(res.data.attempts || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [regNo]);

  return (
    <div className="student-attempt-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Go Back
      </button>

      <h2>Attempts by {regNo}</h2>

      {attempts.length === 0 ? (
        <p>No attempts found for this ID.</p>
      ) : (
        attempts.map((a) => (
          <div
            key={a._id}
            className="attempt-box"
            onClick={() => navigate(`/attemptdetails/${a._id}`)}
          >
            <h3>{a.name}</h3>
            <p>Test ID: {a.testId}</p>
            <p>Date: {new Date(a.submittedAt).toLocaleString("en-IN")}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentAttemptList;
