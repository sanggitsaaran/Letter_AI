import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";

interface Letter {
  _id: string;
  title: string;
  text: string;
  createdAt: string;
}

// The socket connection needs the full URL, as it's not a standard HTTP request
const socket = io("http://localhost:5000");
const LOCAL_STORAGE_KEY = "letter-ai-active-id";

export default function App() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  });
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const fetchLetters = useCallback(async () => {
    try {
      const response = await fetch("/letters");
      const data = await response.json();
      setLetters(data);
    } catch (error) {
      console.error("Failed to fetch letters list:", error);
    }
  }, []);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]); // Run only once on mount

  useEffect(() => {
    if (letters.length > 0) {
      const activeLetterExists = letters.some(l => l._id === activeLetterId);
      if (!activeLetterExists) {
        // If the active ID is invalid (e.g., deleted), select the first letter in the list.
        setActiveLetterId(letters[0]._id);
      }
    } else {
      // If there are no letters, ensure nothing is selected.
      setActiveLetterId(null);
    }
  }, [letters, activeLetterId]);

  useEffect(() => {
    const fetchLetterContent = async () => {
      if (!activeLetterId) {
        setText("");
        setFeedback("");
        return;
      }
      try {
        // Use the proxy
        const response = await fetch(`/letters/${activeLetterId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch letter. Status: ${response.status}`);
        }
        const data: Letter = await response.json();
        setText(data.text);
        setFeedback("");
      } catch (error) {
        console.error("Could not load letter content:", error); // Refresh list in case the letter was deleted
        setText(""); // Set text to a safe, empty state
        setFeedback(""); // Also clear feedback
      }
    };
    fetchLetterContent();
  }, [activeLetterId]);

  useEffect(() => {
    if (activeLetterId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, activeLetterId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [activeLetterId]);

  useEffect(() => {
    setSuggestion("");
    if (text === null || text.trim() === "" || text.startsWith("Error:")) {
      setFeedback("");
      return;
    }
    const feedbackHandler = setTimeout(() => getAIFeedback(text), 1500);
    const predictionHandler = setTimeout(() => getAIPrediction(text), 300);
    return () => {
      clearTimeout(feedbackHandler);
      clearTimeout(predictionHandler);
    };
  }, [text]);

  const getAIFeedback = async (currentText: string) => {
    setIsLoading(true);
    setFeedback("");
    try {
      // Use the proxy
      const response = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText }),
      });
      if (!response.ok) throw new Error("Server error on feedback");
      const data = await response.json();
      setFeedback(data.feedback);
    } catch (error) {
      console.error("Error fetching AI feedback:", error);
      setFeedback("Sorry, an error occurred while getting feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAIPrediction = async (currentText: string) => {
    if (currentText.endsWith(" ")) return;
    try {
      // Use the proxy
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText }),
      });
      if (!response.ok) throw new Error("Server error on prediction");
      const data = await response.json();
      if (data.prediction) {
        setSuggestion(data.prediction);
      }
    } catch (error) {
      console.error("Prediction failed:", error);
    }
  };
  
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    socket.emit("saveText", { id: activeLetterId, text: newText });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestion && (e.key === "Tab" || e.key === "ArrowRight")) {
      e.preventDefault();
      const newText = text + suggestion;
      setText(newText);
      setSuggestion("");
    }
  };

  const handleCreateNewLetter = async () => {
    try {
      const response = await fetch("/letters", { method: "POST" });
      const newLetter: Letter = await response.json();
      // Prepend to the list and set as active immediately
      setLetters([newLetter, ...letters]);
      setActiveLetterId(newLetter._id);
    } catch (error) {
      console.error("Failed to create new letter:", error);
    }
  };

  const handleDeleteLetter = async (idToDelete: string) => {
    const newLetters = letters.filter(l => l._id !== idToDelete);
    setLetters(newLetters);

    if (activeLetterId === idToDelete) {
        const nextActiveId = newLetters.length > 0 ? newLetters[0]._id : null;
        setActiveLetterId(nextActiveId);
    }

    try {
      await fetch(`/letters/${idToDelete}`, { method: "DELETE" });
      // Simply refetch the list. The useEffects will handle the rest.
    } catch (error) {
      console.error("Failed to delete letter:", error);
      fetchLetters();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-1/4 bg-white border-r border-gray-200 p-4 flex flex-col">
        <h1 className="text-xl font-bold text-blue-600 mb-4">My Letters</h1>
        <button
          onClick={handleCreateNewLetter}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mb-4"
        >
          + New Letter
        </button>
        <div className="flex-grow overflow-y-auto">
          {letters.map((letter) => (
            <div
              key={letter._id}
              onClick={() => setActiveLetterId(letter._id)}
              className={`p-2 my-1 rounded-md cursor-pointer flex justify-between items-center ${
                activeLetterId === letter._id ? "bg-blue-100" : "hover:bg-gray-50"
              }`}
            >
              <span className="font-medium truncate">{letter.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLetter(letter._id);
                }}
                className="text-red-400 hover:text-red-600 text-xs font-bold"
              >
                DELETE
              </button>
            </div>
          ))}
        </div>
      </div>

      <main className="w-3/4 p-8 flex flex-col">
        {activeLetterId ? (
          <>
            <div className="relative w-full flex-grow">
              <div
                className="absolute inset-0 p-4 font-mono text-lg text-gray-400 pointer-events-none whitespace-pre-wrap break-words"
              >
                {text}
                <span className="opacity-75">{suggestion}</span>
              </div>
              <textarea
                ref={textAreaRef}
                className="absolute inset-0 w-full h-full p-4 bg-transparent border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-lg text-gray-800 caret-black"
                placeholder="Start writing..."
                value={text}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="mt-4 p-4 h-48 bg-white rounded-md border border-gray-200 overflow-y-auto">
              {isLoading ? (
                <p className="text-lg text-gray-500">AI is thinking...</p>
              ) : (
                <p className="text-lg text-green-700 whitespace-pre-wrap">
                  {feedback}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-500">
              Select a letter or create a new one to begin.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}