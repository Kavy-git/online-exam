import express from "express";
import StudentAttempt from "../models/StudentAttempt.js";
import Answer from "../models/Answer.js";
import sharp from "sharp";


const router = express.Router();

/* -------------------------------------------------------------
   1) SAVE SNAPSHOT + THUMBNAIL
------------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { testId, name, regNo, snapshot } = req.body;

    if (!testId || !regNo) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const finalSnapshot = snapshot && snapshot.trim() !== "" ? snapshot : null;

    

    let thumbnailBase64 = null;

    if (finalSnapshot) {
      const base64Data = finalSnapshot.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const thumbBuffer = await sharp(buffer)
        .resize(128, 128)
        .jpeg({ quality: 70 })
        .toBuffer();

      thumbnailBase64 = `data:image/jpeg;base64,${thumbBuffer.toString("base64")}`;
    }

    const attempt = new StudentAttempt({
      testId,// ⭐ ADD THIS LINE
      name,
      regNo,
      snapshot: finalSnapshot,
      snapshotThumb: thumbnailBase64,
    });

    await attempt.save();

    res.json({
      success: true,
      message: "Snapshot saved successfully",
      attempt,
    });
  } catch (err) {
    console.error("Snapshot save error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------------------------------------------
   2) GET SNAPSHOTS WITHOUT FULL IMAGE
------------------------------------------------------------- */
router.get("/byTest/:testId", async (req, res) => {
  try {
    const attempts = await StudentAttempt.find(
      { testId: req.params.testId },
      "-snapshot"
    ).sort({ createdAt: -1 });

    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------------------------------------------
   3) GET FULL ATTEMPT
------------------------------------------------------------- */
router.get("/full/:answerId", async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    if (!answer)
      return res.status(404).json({ success: false, message: "Attempt not found" });

    const snapshot = await StudentAttempt.findOne({
      testId: answer.testId,
      regNo: answer.regNo,
    });

    res.json({
      success: true,
      answer: answer._doc,
      snapshot: snapshot?.snapshot || null,
      thumbnail: snapshot?.snapshotThumb || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------------------------------------------
   4) GET SNAPSHOT BY TEST + REGNO
------------------------------------------------------------- */
router.get("/test/:testId/student/:regNo", async (req, res) => {
  try {
    const attempt = await StudentAttempt.findOne({
      testId: req.params.testId,
      regNo: { $regex: new RegExp("^" + req.params.regNo + "$", "i") },
    });

    if (!attempt)
      return res.status(404).json({ success: false, message: "Snapshot not found" });

    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------------------------------------------
   5) GET ATTEMPT BY ID
------------------------------------------------------------- */
router.get("/id/:id", async (req, res) => {
  try {
    const attempt = await StudentAttempt.findById(req.params.id);
    if (!attempt)
      return res.status(404).json({ success: false, message: "Attempt not found" });

    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
