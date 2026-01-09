import express from "express";
import Answer from "../models/Answer.js";
import StudentAttempt from "../models/StudentAttempt.js";
import Test from "../models/testModel.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

/* -------------------------------------------------------------
   1) SUBMIT ANSWERS (student)
------------------------------------------------------------- */
router.post("/submit", async (req, res) => {
  try {
    const { testId, name, regNo, answers, warnings } = req.body;

    if (!testId || !regNo || !answers) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    

    const attempt = new Answer({
      testId,
      name,
      regNo,
      answers,
      warnings: warnings || [],
    });

    await attempt.save();

    res.json({ success: true, message: "Submitted", attempt });

  } catch (err) {
    console.error("Submit Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});




/* -------------------------------------------------------------
   2) GET ATTEMPTS for TESTS CREATED BY LOGGED-IN TEACHER
------------------------------------------------------------- */
router.get("/attempts", auth, async (req, res) => {
  try {
    // 1️⃣ Get all tests created by this user
    const myTests = await Test.find({ createdBy: req.user.id }, "_id");
    const testIds = myTests.map((t) => t._id.toString());

    // 2️⃣ Get all student submissions for those tests
    const answers = await Answer.find({
      testId: { $in: testIds },
    }).lean();

    // 3️⃣ Get snapshots for those tests
    const snapshots = await StudentAttempt.find(
      { testId: { $in: testIds } },
      "-snapshot"
    ).lean();

    // 4️⃣ Merge snapshots with answers
    const merged = answers.map((a) => {
      const s = snapshots.find(
        (snap) => snap.testId.toString() === a.testId.toString() && snap.regNo === a.regNo
      );
      return {
        ...a,
        snapshotThumb: s?.snapshotThumb || null,
      };
    });

    res.json({ success: true, attempts: merged });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


/* -------------------------------------------------------------
   3) GET attempts for a specific test
------------------------------------------------------------- */
router.get("/byTest/:testId", async (req, res) => {
  try {
    const attempts = await Answer.find({ testId: req.params.testId }).lean();
    res.json({ success: true, attempts });

  } catch {
    res.status(500).json({ success: false, error: "Failed to load attempts" });
  }
});

/* -------------------------------------------------------------
   GET a single attempt by AttemptId   (PUBLIC)
------------------------------------------------------------- */
router.get("/:attemptId", async (req, res) => {
  try {
    const attempt = await Answer.findById(req.params.attemptId).lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    res.json({ success: true, attempt });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
router.get("/byReg/:regNo", async (req, res) => {
  try {
    const attempts = await Answer.find({ regNo: req.params.regNo }).lean();

    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});




export default router;
