import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./AttemptInfo.css";
import { motion } from "framer-motion";

const AttemptInfo = () => {
  const navigate = useNavigate();
  const { id } = useParams();


  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [error, setError] = useState("");

  const [requireCameraMic, setRequireCameraMic] = useState("no");
  const [permissionGranted, setPermissionGranted] = useState(false);

  const [snapshotPopup, setSnapshotPopup] = useState(false);
  const [snapshot, setSnapshot] = useState("");
  const [stream, setStream] = useState(null);
  
  const [loading, setLoading] = useState(false);


  /* ---------------- LOAD TEST ---------------- */
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/${id}`);
        const cam = res.data.test?.requireCameraMic?.toLowerCase() || "no";

        setRequireCameraMic(cam);

      } catch (err) {
        console.error("Error loading test:", err);
      }
    };

    fetchTest();
  }, [id]);

  /* ---------------- CAMERA PERMISSION ---------------- */
  const requestPermissions = async () => {
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(camStream);
      setPermissionGranted(true);
      setError("");

      const video = document.getElementById("camVideo");
      video.srcObject = camStream;
      video.play();

    } catch (err) {
      setError("Camera & Microphone permissions are required.");
    }
  };
  useEffect(() => {
  if (snapshotPopup && stream) {
    const popupVideo = document.getElementById("popupCam");
    if (popupVideo) {
      popupVideo.srcObject = stream;
      popupVideo.play();
    }
  }
}, [snapshotPopup, stream]);


  /* ---------------- TAKE SNAPSHOT ---------------- */
  const takeSnapshot = () => {
    const video = document.getElementById("camVideo");
    const canvas = document.getElementById("snapCanvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = canvas.toDataURL("image/png");
    setSnapshot(imgData);
  };

  setLoading(true);
  const handleStartTest = async () => {
  if (!name || !regNo) {
    setError("Please enter all fields.");
    return;
  }

  try {
    setLoading(true);

    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/attempt`,
      {
        testId: id,
        name,
        regNo,
        snapshot,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    navigate(`/attempt-test/${id}`);

  } catch (err) {
    setError("Failed to save student details.");
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="attempt-info-container">
        <h1>Attender Details</h1>

        {/* Hidden items */}
        <video id="camVideo" autoPlay playsInline style={{ display: "none" }} />
        <canvas id="snapCanvas" style={{ display: "none" }} />

        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Register Number"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
        />

        {requireCameraMic === "yes" && (
          <>
            {!permissionGranted && (
              <button onClick={requestPermissions}>
                Allow Camera & Microphone
              </button>
            )}

            {permissionGranted && (
              <button onClick={() => setSnapshotPopup(true)}>
                Take Snapshot
              </button>
            )}
          </>
        )}

        {/* SNAPSHOT POPUP */}
{snapshotPopup && (
  <div className="snapshot-popup">
    <div className="popup-box">
      <h3>📸 Snapshot Capture</h3>

      {/* LIVE CAMERA (only when snapshot is NOT taken) */}
      {!snapshot && (
        <video
          id="popupCam"
          autoPlay
          playsInline
          style={{
            width: "100%",
            borderRadius: "12px",
            marginTop: "10px",
            border: "2px solid #d0d7ff"
          }}
        />
      )}

      {/* SHOW SNAPSHOT ONLY AFTER TAKING */}
      {snapshot && (
        <img
          src={snapshot}
          alt="Captured"
          style={{
            width: "100%",
            borderRadius: "12px",
            marginTop: "10px",
            border: "2px solid #d0d7ff"
          }}
        />
      )}

      <div className="popup-btn-row">

        {/* TAKE SNAPSHOT BUTTON */}
        {!snapshot && (
          <button
            className="blue-btn"
            onClick={takeSnapshot}
          >
            Take Snapshot
          </button>
        )}

        {/* RETAKE BUTTON ONLY AFTER SNAPSHOT */}
        {snapshot && (
          <button
            className="green-btn"
            onClick={() => setSnapshot("")}
          >
            Retake Snapshot
          </button>
        )}

        <button className="close-btn" onClick={() => setSnapshotPopup(false)}>
          Close
        </button>
      </div>
    </div>
  </div>
)}



        <button
          className="start-test-btn"
          onClick={handleStartTest}
          disabled={loading}
        >
          {loading ? "Starting..." : "Start Test"}
        </button>

        {error && <p className="error">{error}</p>}
      </div>
    </motion.div>
  );
};

export default AttemptInfo;
