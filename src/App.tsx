import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function App() {
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.emit("loadText");
    socket.on("loadText", (data) => {
      setText(data || "");
    });

    return () => {
      socket.off("loadText");
    };
  }, []);

  useEffect(() => {
    // If text is empty, clear feedback and don't do anything
    if (text.trim() === "") {
      setFeedback("");
      return;
    }

    // Set a timer to fetch feedback after 800ms of inactivity
    const handler = setTimeout(() => {
      getAIFeedback(text);
    }, 800); // Wait for 800ms

    // Cleanup function: If the user types again, cancel the previous timer
    return () => {
      clearTimeout(handler);
    };
  }, [text]);

  const getAIFeedback = async (currentText: string) => {
    setIsLoading(true); // Show the loading indicator
    setFeedback(""); // Clear old feedback

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText }),
      });

      if (!response.ok) {
        throw new Error("Failed to get feedback from server");
      }

      const data = await response.json();
      setFeedback(data.feedback);
    } catch (error) {
      console.error("Error fetching AI feedback:", error);
      setFeedback("Sorry, an error occurred while getting feedback.");
    } finally {
      setIsLoading(false); // Hide the loading indicator
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    socket.emit("saveText", newText); // We still save in real-time
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          Letter Writing AI ✍️
        </h1>
        <textarea
          className="w-full h-64 p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Start writing your letter..."
          value={text}
          onChange={handleTyping}
        />
        <div className="mt-4 p-4 h-32 bg-white rounded-md border border-gray-200">
          {/* --- NEW: Conditional rendering for loading/feedback --- */}
          {isLoading ? (
            <p className="text-lg text-gray-500">AI is thinking...</p>
          ) : (
            <p className="text-lg text-green-700 whitespace-pre-wrap">
              {feedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
