import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AttemptTestPage.css";
import { motion } from "framer-motion";
import * as faceapi from "face-api.js";

const AttemptTestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  /* UI for attempted list */
  const [showAttempted, setShowAttempted] = useState(false);
  const [showNotAttempted, setShowNotAttempted] = useState(false);

  /* Camera */
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  /* PROCTORING STATES */
  const [faceStatus, setFaceStatus] = useState("Detecting...");
  const [emotion, setEmotion] = useState("Detecting...");
  const [multiFace, setMultiFace] = useState(false);
  const [identityStatus, setIdentityStatus] = useState("Verifying...");
  const [audioStatus, setAudioStatus] = useState("Detecting...");
  const [windowStatus, setWindowStatus] = useState("In Focus ✔");
  const [submitting, setSubmitting] = useState(false);



  const [referenceDescriptor, setReferenceDescriptor] = useState(null);
  const [warning, setWarning] = useState("");
  const [warningLog, setWarningLog] = useState([]);

/* ⭐ ADD THIS FUNCTION HERE */
const pushWarning = (msg) => {
  setWarning(msg);

  setWarningLog((prev) => {
    if (prev.length > 0 && prev[prev.length - 1].message === msg) {
      return prev; // skip duplicate warnings
    }
    return [...prev, { message: msg, time: new Date().toLocaleString() }];
  });
};


  /* ------------------ TIMER ------------------ */
  useEffect(() => {
    
    if (timeLeft === 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft((t) => t - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [test, timeLeft]);

  /* ------------------ LOAD TEST ------------------ */
 /* ------------------ LOAD TEST ------------------ */
useEffect(() => {
  const fetchTest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to continue.");
        navigate("/");
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tests/${id}`,
        
      );

       

      const testData = res.data.test;
      setTest(testData);

      // ⭐ NON-DURATION TEST (no timer)
      if (testData.testType === "nonduration") {
        setTimeLeft(null);
        return;
      }

      // ⭐ DURATION TEST (by date/time)
      if (testData.testType === "duration") {
        const now = new Date();
        const start = new Date(`${testData.testDate}T${testData.startTime}`);
        const end = new Date(`${testData.testDate}T${testData.endTime}`);

        if (now < start) {
          alert("Test has not started yet!");
          return;
        }

        if (now > end) {
          alert("Test is already over!");
          return;
        }

        const secondsLeft = Math.floor((end - now) / 1000);
        setTimeLeft(secondsLeft);
        return;
      }

      // ⭐ TIMER TEST (H/M/S)
      if (testData.testType === "timer") {
        const h = Number(testData.timerHours || 0);
        const m = Number(testData.timerMinutes || 0);
        const s = Number(testData.timerSeconds || 0);

        setTimeLeft(h * 3600 + m * 60 + s);
        return;
      }
    } catch (err) {
      console.error("Error loading test:", err);
    }
  };

  fetchTest();
}, [id]);


  /* ------------------ CAMERA START ------------------ */
  useEffect(() => {
    if (!test) return;
    if (test.requireCameraMic?.toLowerCase() !== "yes") return;

    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        cameraStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        console.log("Camera started");
      } catch (err) {
        console.error("Camera Error:", err);
      }
    };

    startCam();

    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [test]);



 /* -------------- LOAD FACE MODELS + SNAPSHOT -------------- */
useEffect(() => {
  const loadModels = async () => {

    // Wait until test is loaded
  if (!test) return;

    // ❗ If camera is NOT required, skip all face-api loading
    if (test?.requireCameraMic?.toLowerCase() !== "yes") {
      console.log("Camera/Mic not required → skipping face model load");
      return;
    }

    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

    console.log("FaceAPI models loaded");

    let reg =
  (localStorage.getItem("regNoActual") || localStorage.getItem("regNo") || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");  // remove invalid chars


    try {
      const snap = await axios.get(
  `${import.meta.env.VITE_API_URL}/api/attempt/test/${id}/student/${reg}`,
  
);


      if (!snap.data.attempt?.snapshot) {
        console.warn("Snapshot not found");
        return;
      }

      const img = await faceapi.fetchImage(snap.data.attempt.snapshot);

      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        console.log("Reference face loaded");
        setReferenceDescriptor(detection.descriptor);
      }
    } catch (err) {
      console.warn("❗ No saved snapshot found — skipping face recognition");
    }
  };

  loadModels();
}, [id, test]);

  /* ----------- PROCTORING: REALTIME PROCESSING ----------- */
  useEffect(() => {
    if (!videoRef.current) return;

    const interval = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptors();

      if (!detections || detections.length === 0) {
        setFaceStatus("No face detected");
        if (!submitting) {
          pushWarning("⚠ No face detected!");
        }
        
        return;
      }

      /* Face detected */
      setFaceStatus("Detected ✔");

      /* Multi-face */
      setMultiFace(detections.length > 1);
      if (detections.length > 1) {
        pushWarning("⚠ Multiple faces detected!");
      } else {
  setWarning(""); // UI clear only (OK)
}


      

      /* Emotion */
      const expr = detections[0].expressions;
      const topEmotion = Object.entries(expr).sort((a, b) => b[1] - a[1])[0][0];
      setEmotion(topEmotion);

      /* Head pose */
      const nose = detections[0].landmarks.getNose();
      const leftX = nose[0].x;
      const rightX = nose[6].x;

      if (rightX - leftX > 20) {
  setFaceStatus("Looking Left");
  setWarning("⚠  looking left detected.");
} 
else if (leftX - rightX > 20) {
  setFaceStatus("Looking Right");
  setWarning("⚠  looking right detected.");
} 
else {
  setFaceStatus("Straight");
}

      /* Identity match */
      if (referenceDescriptor && detections[0]?.descriptor) {
        const distance = faceapi.euclideanDistance(
          detections[0].descriptor,
          referenceDescriptor
        );

        if (distance < 0.5) {
  setIdentityStatus("Matched ✔");
} else {
  setIdentityStatus("Mismatch ❌");
  pushWarning("⚠ Identity mismatch detected!");
}

      } else {
        setIdentityStatus("Verifying...");
      }
    }, 500);

    return () => clearInterval(interval);
  }, [referenceDescriptor]);

  /* ------------------ AUDIO DETECTION (UNCHANGED) ------------------ */
  useEffect(() => {
    if (!test) return;
    if (test.requireCameraMic?.toLowerCase() !== "yes") return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      const data = new Uint8Array(analyser.frequencyBinCount);

      const loop = () => {
        analyser.getByteFrequencyData(data);
        const volume = data.reduce((a, b) => a + b, 0) / data.length;
        if (volume > 30) {
  setAudioStatus("⚠ Noise Detected");
  pushWarning("⚠ Noise detected!");
} else {
  setAudioStatus("Clear");
}

        requestAnimationFrame(loop);
      };

      loop();
    });
  }, [test]);

/* ------------------ WINDOW/TAB SWITCH DETECTION ------------------ */
useEffect(() => {
  const handleBlur = () => {
     if (!submitting) {   // <-- ADD THIS
      setWindowStatus("Window Lost ❌");
      pushWarning("⚠ You switched the tab/window!");
    }
  };

  const handleVisibility = () => {
    if (document.hidden) {
      setWindowStatus("Not Visible ❌");
      pushWarning("⚠ Test window not visible!");
    } else {
      setWindowStatus("In Focus ✔");
    }
  };

  window.addEventListener("blur", handleBlur);
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    window.removeEventListener("blur", handleBlur);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, []);
/* ------------------ BLOCK COPY/PASTE & RIGHT CLICK ------------------ */
useEffect(() => {
  const block = (e) => e.preventDefault();

  // Disable right click
  document.addEventListener("contextmenu", block);

  // Disable copy, paste, cut
  document.addEventListener("copy", block);
  document.addEventListener("paste", block);
  document.addEventListener("cut", block);

  // Disable text selection
  document.addEventListener("selectstart", block);

  // Disable shortcut keys
  const keyBlock = (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      ["c", "v", "x", "s", "p", "a"].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }

    // Disable PrintScreen
    if (e.key === "PrintScreen") {
      e.preventDefault();
    }
  };

  document.addEventListener("keydown", keyBlock);

  return () => {
    document.removeEventListener("contextmenu", block);
    document.removeEventListener("copy", block);
    document.removeEventListener("paste", block);
    document.removeEventListener("cut", block);
    document.removeEventListener("selectstart", block);
    document.removeEventListener("keydown", keyBlock);
  };
}, []);

  

  /* ------------------ UPDATE ANSWER ------------------ */
  const updateAnswer = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  /* ------------------ FINAL SUBMIT ------------------ */
  const handleFinalSubmit = async () => {
  try {
    setSubmitting(true); // ❌ STOP ALL WARNINGS
    

    // STOP CAMERA
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }

    // SEND ANSWERS
     // SEND ANSWERS
const token = localStorage.getItem("token");

await axios.post(
  `${import.meta.env.VITE_API_URL}/api/answers/submit`,
  {
    testId: id,
    name: localStorage.getItem("studentName"),
    regNo:
      localStorage.getItem("regNoActual") || localStorage.getItem("regNo"),
    answers,
    warnings: warningLog,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    // SMALL DELAY TO ENSURE CAMERA RELEASE
    setTimeout(() => {
      window.location.href = "/submitted";
    }, 150);

  } catch (err) {
    alert("Submit failed");
  }
};


  if (!test) return <h2>Loading...</h2>;

  const q = test.questions[currentIndex];

  const formatTime = (sec) => {
    if (sec === null) return "No Time Limit";
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  /* ========================= UI ========================= */
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="attempt-layout">
        {/* LEFT PANEL */}
        <div className="left-nav">
          <h3>Questions</h3>

          <div className="question-grid">
            {test.questions.map((ques, i) => (
              <button
                key={i}
                className={`q-btn ${
                  currentIndex === i ? "active" : ""
                } ${answers[ques._id] ? "attempted" : "not-attempted"}`}
                onClick={() => setCurrentIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Attempted */}
          <div className="dropdown-section">
            <button
              className="dropdown-header"
              onClick={() => setShowAttempted(!showAttempted)}
            >
              Attempted ▼
            </button>

            {showAttempted && (
              <div className="dropdown-list">
                {test.questions.map(
                  (q, i) =>
                    answers[q._id] && (
                      <button
                        key={i}
                        className="dropdown-item attempted"
                        onClick={() => setCurrentIndex(i)}
                      >
                        Question {i + 1}
                      </button>
                    )
                )}
              </div>
            )}
          </div>

          {/* Not Attempted */}
          <div className="dropdown-section">
            <button
              className="dropdown-header"
              onClick={() => setShowNotAttempted(!showNotAttempted)}
            >
              Not Attempted ▼
            </button>

            {showNotAttempted && (
              <div className="dropdown-list">
                {test.questions.map(
                  (q, i) =>
                    !answers[q._id] && (
                      <button
                        key={i}
                        className="dropdown-item not-attempted"
                        onClick={() => setCurrentIndex(i)}
                      >
                        Question {i + 1}
                      </button>
                    )
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="center-question">
          <div className="title-row">
            <h2>{test.title}</h2>

            <span className="badge">
              {test.testType}: {formatTime(timeLeft)}
            </span>
          </div>

          <h3>
            Question {currentIndex + 1} / {test.questions.length}
          </h3>

          <p className="question-text">{q.question}</p>

          {q.type === "mcq" ? (
            <div className="options">
              {q.options.map((opt, i) => (
                <label key={i} className="option-box">
                  <input
                    type="radio"
                    name={q._id}
                    checked={answers[q._id] === opt}
                    onChange={() => updateAnswer(q._id, opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="short-answer"
              value={answers[q._id] || ""}
              onChange={(e) => updateAnswer(q._id, e.target.value)}
            />
          )}

          <div className="nav-buttons">
            <button
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
            >
              Previous
            </button>

            

            {currentIndex < test.questions.length - 1 ? (
              <button onClick={() => setCurrentIndex((i) => i + 1)}>
                Next
              </button>
            ) : (
              <button className="final-submit" onClick={handleFinalSubmit}>
                Final Submit
              </button>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        {test.requireCameraMic?.toLowerCase() === "yes" && (
          <div className="right-proctor">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="video-feed"
            />

            <div className="proctor-status">
              <h4>PROCTORING STATUS</h4>

              <p>
                <b>Face:</b> {faceStatus}
              </p>
              <p>
                <b>Identity:</b> {identityStatus}
              </p>
              <p>
                <b>Faces Detected:</b> {multiFace ? "Multiple ❌" : "Single ✔"}
              </p>
              <p>
                <b>Emotion:</b> {emotion}
              </p>
              <p>
                <b>Audio:</b> {audioStatus}
              </p>
              <p>
  <b>Window:</b> {windowStatus}
</p>

            </div>
            {warning && (
  <div className="warning-box">
    {warning}
  </div>
)}

          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AttemptTestPage;
