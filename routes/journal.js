import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import Journal from "../models/Journal.js";

const router = express.Router();

// Middleware: Verify Token
const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ msg: "No auth token" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified.id;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Invalid token" });
  }
};

// Add Journal Entry + AI Sentiment
router.post("/add", auth, async (req, res) => {
  try {
    const { text } = req.body;

    // Call Hugging Face sentiment API
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      { inputs: text },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );

    const sentiment = response.data[0][0]; // e.g. { label: "POSITIVE", score: 0.98 }

    const newEntry = new Journal({
      userId: req.user,
      text,
      sentiment,
    });
    await newEntry.save();

    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Entries for a User
router.get("/", auth, async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
