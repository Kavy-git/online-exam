import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  type: String,
  question: String,
  options: [String],
  answer: String
});

const testSchema = new mongoose.Schema({
  title: String,
  questions: [questionSchema],
  testType: String,
  testDate: String,
  startTime: String,
  endTime: String,
  timerHours: String,
  timerMinutes: String,
  timerSeconds: String,
  requireCameraMic: { type: String, default: "no" },

  // ⭐ VERY IMPORTANT
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Test", testSchema);
