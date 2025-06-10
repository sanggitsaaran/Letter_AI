require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const axios = require("axios");
const { nanoid } = require("nanoid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.post("/analyze", async (req, res) => { // <-- ADD async
  const userInput = req.body.text;

  if (!userInput) {
    return res.status(400).json({ error: "Text input is required" });
  }
  
  try {
    // Call our new Python API service
    const pythonApiResponse = await axios.post("http://127.0.0.1:8000/analyze", {
      text: userInput,
    });

    // Send the feedback from the Python API back to the frontend
    res.json({ feedback: pythonApiResponse.data.feedback });

  } catch (error) {
    console.error("Error calling Python API:", error.message);
    res.status(500).json({ 
        error: "Failed to get feedback from AI service.",
        details: error.message 
    });
  }
});

// GET all letters (just ID and title)
app.get("/letters", async (req, res) => {
  try {
    const letters = await Letter.find({}, 'title createdAt').sort({ createdAt: -1 });
    res.json(letters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch letters" });
  }
});

// GET a single letter's content
app.get("/letters/:id", async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ error: "Letter not found" });
    res.json(letter);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch letter" });
  }
});

// POST a new letter
app.post("/letters", async (req, res) => {
  try {
    const newLetter = new Letter({
      title: "New Letter",
      text: "Start writing..."
    });
    await newLetter.save();
    res.status(201).json(newLetter);
  } catch (error) {
    res.status(500).json({ error: "Failed to create new letter" });
  }
});

// DELETE a letter
app.delete("/letters/:id", async (req, res) => {
  try {
    const result = await Letter.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Letter not found" });
    res.status(200).json({ message: "Letter deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete letter" });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB 🚀"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Schema for storing writing progress
const letterSchema = new mongoose.Schema({
  _id: { type: String, default: () => nanoid(10) }, // e.g., 'abc123xyz'
  title: { type: String, default: "Untitled Letter" },
  text: String,
  createdAt: { type: Date, default: Date.now }
});
const Letter = mongoose.model("Letter", letterSchema);

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Save text to MongoDB
  socket.on("saveText", async ({id, text}) => {
    if (!id) return;
    try {
      await Letter.findByIdAndUpdate(id, { text });
      // We don't need to log every save event anymore, it's too noisy.
      // console.log(`Text saved for letter ${id}`);
    } catch(error) {
      console.error(`Failed to save text for letter ${id}:`, error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
