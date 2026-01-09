import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  name: { type: String, required: true },
  regNo: { type: String, required: true },
  answers: { type: Object, required: true },

 // ⭐ Make warnings optional with default empty array
  warnings: {
    type: [
      {
        message: { type: String },
        time: { type: String },
      },
    ],
    default: [],
  },




  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Answer", answerSchema);
