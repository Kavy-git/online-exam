import mongoose from "mongoose";

const studentAttemptSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  name: { type: String, required: true },
  regNo: { type: String, required: true },
  snapshot: { type: String },  // added snapshot field
  snapshotThumb: { type: String },   // THUMBNAIL photo (small, fast)
 
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("StudentAttempt", studentAttemptSchema, "studentattempts");

