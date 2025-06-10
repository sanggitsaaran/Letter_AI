const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { spawn } = require("child_process");

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

app.post("/analyze", (req, res) => {
  const userInput = req.body.text;

  if (!userInput) {
    return res.status(400).json({ error: "Text input is required" });
  }
  const pythonProcess = spawn("python", ["ai_model.py", userInput]);

  let output = "";
  let errorOutput = "";

  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error(`Python error: ${data.toString()}`);
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: `Python script exited with code ${code}`, details: errorOutput });
    }
    res.json({ feedback: output.trim() });
  });

  // pythonProcess.stdout.on("data", (data) => {
  //   res.json({ feedback: data.toString().trim() });
  // });

  // pythonProcess.stderr.on("data", (data) => {
  //   console.error(`Error: ${data}`);
  // });
});

// MongoDB Connection
const MONGO_URI = "mongodb+srv://letterai_user:dXrlpN4Cem3duAuE@letteraicluster.mwd6s.mongodb.net/?retryWrites=true&w=majority&appName=LetterAIClusterx";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB 🚀"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Schema for storing writing progress
const letterSchema = new mongoose.Schema({
  userId: String, // Later useful for authentication
  text: String,
});
const Letter = mongoose.model("Letter", letterSchema);

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Load previous writing session
  socket.on("loadText", async () => {
    const savedText = await Letter.findOne();
    socket.emit("loadText", savedText ? savedText.text : "");
  });

  // Save text to MongoDB
  socket.on("saveText", async (text) => {
    await Letter.findOneAndUpdate({}, { text }, { upsert: true });
    console.log("Text saved to MongoDB:", text);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
