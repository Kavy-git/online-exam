import express from "express";
import Test from "../models/testModel.js";
import StudentAttempt from "../models/StudentAttempt.js";
import Answer from "../models/Answer.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// CREATE TEST
// CREATE TEST (UPDATED WITH VALIDATION + TIME FIX)
router.post("/create",auth, async (req, res) => {
  try {
    const {
      title,
      questions,
      testType,
      testDate,
      startTime,
      endTime,
      timerHours,
      timerMinutes,
      timerSeconds,
      requireCameraMic
    } = req.body;

    // ===== BASIC VALIDATION =====
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title & at least one question are required"
      });
    }

    if (!testType) {
      return res.status(400).json({
        success: false,
        message: "testType is required"
      });
    }

    // ====== DURATION VALIDATION ======
    if (testType === "duration") {
      if (!testDate || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: "For duration tests, testDate, startTime & endTime are required"
        });
      }

      // Fix time format (HH:MM → HH:MM:SS)
      req.body.startTime =
        startTime.length === 5 ? startTime + ":00" : startTime;

      req.body.endTime =
        endTime.length === 5 ? endTime + ":00" : endTime;
    }

    // ====== TIMER VALIDATION ======
    if (testType === "timer") {
      if (
        timerHours === "" ||
        timerMinutes === "" ||
        timerSeconds === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Timer hours, minutes, and seconds are required"
        });
      }
    }

    // ====== CAMERA/MIC VALIDATION ======
    if (!requireCameraMic) {
      return res.status(400).json({
        success: false,
        message: "Camera & Mic requirement must be selected"
      });
    }

    // ====== SAVE TEST ======
    const test = new Test({
  ...req.body,
  createdBy: req.user.id   // 🔥 VERY IMPORTANT
});

    await test.save();

    res.json({
      success: true,
      message: "Test created successfully",
      test
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// GET ALL TESTS
router.get("/", auth, async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user.id });
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



// ⭐ PUBLIC ROUTE — ANY LOGGED STUDENT CAN ACCESS TEST USING CODE
router.get("/:id", async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }
    res.json({ success: true, test });

  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid Test ID" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    // ⭐ VERY IMPORTANT ⭐
    // Your frontend expects { success, test }
    res.json({
      success: true,
      test: test
    });

  } catch (err) {
    return res.status(400).json({ success: false, message: "Invalid Test ID" });
  }
});


router.delete("/:id", auth, async (req, res) => {
  try {
    const testId = req.params.id;

    // Check test belongs to the logged-in teacher
    const test = await Test.findOne({ _id: testId, createdBy: req.user.id });

    if (!test) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized delete"
      });
    }

    // Delete test
    await test.deleteOne();

    // DELETE all attempts for this test
    await StudentAttempt.deleteMany({ testId });

    // DELETE all answers for this test
    await Answer.deleteMany({ testId });

    res.json({
      success: true,
      message: "Test and all related attempts & answers deleted",
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


export default router;
