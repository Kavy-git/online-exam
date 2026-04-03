import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./AttemptInfo.css";
import { motion } from "framer-motion";

const AttemptInfo = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ SAFETY CHECK
  if (!id) {
    return <h2>Invalid Test ID</h2>;
  }

  // ✅ STATES
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [error, setError] = useState("");

  const [requireCameraMic, setRequireCameraMic] = useState("no");
  const [permissionGranted, setPermissionGranted] = useState(false);

  const [snapshotPopup, setSnapshotPopup] = useState(false);
  const [snapshot, setSnapshot] = useState("");
  const [stream, setStream] = useState(null);

  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD TEST ---------------- */
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tests/${id}`
        );

        const test = res?.data?.test || res?.data;

        if (!test) {
          setError("Test not found");
          return;
        }

        const cam = test?.requireCameraMic?.toLowerCase() || "no";
        setRequireCameraMic(cam);

      } catch (err) {
        setError("Error loading test");
      } finally {
        setLoading(false); // ✅ CORRECT PLACE
      }
    };

    fetchTest();
  }, [id]);

  /* ---------------- CAMERA ---------------- */
  const requestPermissions = async () => {
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(camStream);
      setPermissionGranted(true);

      const video = document.getElementById("camVideo");
      video.srcObject = camStream;
      video.play();
    } catch {
      setError("Camera & Microphone required.");
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

  /* ---------------- SNAPSHOT ---------------- */
  const takeSnapshot = () => {
    const video = document.getElementById("camVideo");
    const canvas = document.getElementById("snapCanvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    setSnapshot(canvas.toDataURL("image/png"));
  };

  /* ---------------- START TEST ---------------- */
  const handleStartTest = async () => {
    if (!name || !regNo) {
      setError("Please enter all fields.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/attempt`,
        { testId: id, name, regNo, snapshot },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      navigate(`/attempt-test/${id}`);

    } catch {
      setError("Failed to save details.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOADING UI ---------------- */
  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="attempt-info-container">
        <h1>Attender Details</h1>

        <video id="camVideo" autoPlay style={{ display: "none" }} />
        <canvas id="snapCanvas" style={{ display: "none" }} />

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Register Number"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
        />

        {requireCameraMic === "yes" && (
          <>
            {!permissionGranted && (
              <button onClick={requestPermissions}>
                Allow Camera
              </button>
            )}

            {permissionGranted && (
              <button onClick={() => setSnapshotPopup(true)}>
                Take Snapshot
              </button>
            )}
          </>
        )}

        <button onClick={handleStartTest} disabled={loading}>
          {loading ? "Starting..." : "Start Test"}
        </button>

        {error && <p className="error">{error}</p>}
      </div>
    </motion.div>
  );
};

export default AttemptInfo;