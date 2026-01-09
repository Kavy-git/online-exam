import React, { useEffect } from "react";
import "./SubmissionSuccess.css";
import { motion } from "framer-motion";

const SubmissionSuccess = () => {
  useEffect(() => {
    // EXTRA SAFETY: Stop all running cameras anywhere
    document.querySelectorAll("video").forEach((video) => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    });
  }, []);
  useEffect(() => {
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = function () {
    window.history.go(1);
  };
}, []);


  return (
     <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="submission-container">
      <h1>🎉 Test Submitted Successfully!</h1>
      <p>Your responses have been recorded.</p>
    </div>
    </motion.div>
  );
};

export default SubmissionSuccess;
