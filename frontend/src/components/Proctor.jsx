import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const Proctor = ({
  referenceDescriptor,
  onFaceStatus,
  onMultiFace,
  onEmotion,
  onHeadDirection,
  onIdentityStatus,
  onAudioAlert,
}) => {
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  // ---------------------------
  // LOAD FACE-API MODELS
  // ---------------------------
  const loadModels = async () => {
    const MODEL_URL = "/models"; // public/models folder

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);

    setModelsLoaded(true);
  };

  // ---------------------------
  // START CAMERA
  // ---------------------------
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();

      // Start minimal audio monitoring
      startAudioDetection(stream);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // ---------------------------
  // LIGHTWEIGHT AUDIO DETECTION
  // ---------------------------
  const startAudioDetection = (stream) => {
    audioContextRef.current = new AudioContext();
    const source = audioContextRef.current.createMediaStreamSource(stream);

    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    source.connect(analyserRef.current);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudio = () => {
      analyserRef.current.getByteFrequencyData(dataArray);

      const volume =
        dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      if (volume > 40) {
        onAudioAlert("Talking / Noise detected");
      }

      requestAnimationFrame(checkAudio);
    };

    checkAudio();
  };

  // ---------------------------
  // MAIN PROCTOR LOOP
  // ---------------------------
  const startProctoring = () => {
    setInterval(async () => {
      if (!modelsLoaded) return;

      const detection = await faceapi
        .detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptors();

      // No face
      if (detection.length === 0) {
        onFaceStatus("No face detected");
        return;
      }

      // Multiple faces
      if (detection.length > 1) {
        onMultiFace(true);
      } else {
        onMultiFace(false);
      }

      const face = detection[0];
      onFaceStatus("Face detected");

      // ---------------------------
      // EMOTION DETECTION
      // ---------------------------
      const expressions = face.expressions;
      const topEmotion = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );
      onEmotion(topEmotion);

      // ---------------------------
      // HEAD DIRECTION (LEFT/RIGHT/UP/DOWN)
      // ---------------------------
      const landmarks = face.landmarks.positions;
      const nose = landmarks[30];
      const leftEye = landmarks[36];
      const rightEye = landmarks[45];

      const dx = nose.x - (leftEye.x + rightEye.x) / 2;
      const dy = nose.y - (landmarks[8].y - 20); // chin

      if (dx > 25) onHeadDirection("Looking Right");
      else if (dx < -25) onHeadDirection("Looking Left");
      else if (dy > 25) onHeadDirection("Looking Down");
      else onHeadDirection("Looking Straight");

      // ---------------------------
      // IDENTITY MATCH
      // ---------------------------
      if (referenceDescriptor) {
        const distance = faceapi.euclideanDistance(
          referenceDescriptor,
          face.descriptor
        );

        if (distance < 0.45) {
          onIdentityStatus("Identity Match ✓");
        } else {
          onIdentityStatus("Identity Mismatch ✗");
        }
      }
    }, 300);
  };

  // ---------------------------
  // INITIALIZE EVERYTHING
  // ---------------------------
  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded) {
      startCamera();
      startProctoring();
    }
  }, [modelsLoaded]);

  return (
    <div>
      <video ref={videoRef} width="350" height="250" autoPlay muted />
    </div>
  );
};

export default Proctor;
