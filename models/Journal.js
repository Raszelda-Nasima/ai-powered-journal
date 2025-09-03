import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  sentiment: {
    label: String, // POSITIVE, NEGATIVE, NEUTRAL
    score: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Journal", journalSchema);
