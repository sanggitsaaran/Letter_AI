import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function App() {
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    socket.emit("loadText");
    socket.on("loadText", (data) => {
      setText(data);
    });
    socket.on("aiFeedback", (data) => setFeedback(data));
    return () => {socket.off("aiFeedback");};
  }, []);

  const handleTyping = async  (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    socket.emit("userTyping", newText);
    socket.emit("saveText", newText);

    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });

    const data = await response.json();
    setFeedback(data.feedback);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Letter Writing AI ✍️</h1>
      <textarea
        className="w-2/3 h-40 p-2 border border-gray-400 rounded-md focus:outline-none"
        placeholder="Start writing your letter..."
        value={text}
        onChange={handleTyping}
      />
      <p className="mt-4 text-lg font-semibold text-green-600">{feedback}</p>
    </div>
  );
}
