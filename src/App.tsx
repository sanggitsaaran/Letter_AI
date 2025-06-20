import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { PlusIcon, TrashIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { Switch } from '@headlessui/react';

interface Letter {
  _id: string;
  title: string;
  text: string;
  createdAt: string;
}

// The socket connection needs the full URL, as it's not a standard HTTP request
const socket = io("http://localhost:5000");
const LOCAL_STORAGE_KEY = "letter-ai-active-id";
const LOCAL_STORAGE_KEY_THEME = "letter-ai-theme";

// --- Dark Mode Toggle Component ---
function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    return savedTheme === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);
  
  return (
    <Switch
      checked={isDarkMode}
      onChange={setIsDarkMode}
      className={`${
        isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`${
          isDarkMode ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </Switch>
  );
}

export default function App() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(() => localStorage.getItem(LOCAL_STORAGE_KEY));
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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">LetterLift</h1>
          <ThemeToggle />
        </div>
        <button
          onClick={handleCreateNewLetter}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 mb-4 transition-all duration-200 font-semibold shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          New Letter
        </button>
        <div className="flex-grow overflow-y-auto space-y-1 pr-1">
          {letters.map((letter) => (
            <div
              key={letter._id}
              onClick={() => setActiveLetterId(letter._id)}
              className={`p-3 rounded-lg cursor-pointer group flex justify-between items-center transition-colors duration-150 ${
                activeLetterId === letter._id 
                ? "bg-indigo-100 dark:bg-indigo-900/50" 
                : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
            >
              <span className="font-medium truncate">{letter.title}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteLetter(letter._id); }}
                className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <main className="w-3/4 p-8 flex flex-col gap-6">
        {activeLetterId ? (
          <>
            <div className="relative w-full flex-grow rounded-xl shadow-lg">
              <div className="absolute inset-0 p-5 font-mono text-lg text-gray-400 pointer-events-none whitespace-pre-wrap break-words">
                {text}<span className="opacity-60">{suggestion}</span>
              </div>
              <textarea
                ref={textAreaRef}
                className="absolute inset-0 w-full h-full p-5 bg-white/80 dark:bg-gray-800/80 border border-transparent focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-lg text-gray-900 dark:text-gray-100 caret-indigo-500 transition-all duration-200"
                placeholder="Start writing..."
                value={text}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
              />
            </div>
            
            <div className="p-5 h-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-y-auto">
              <h3 className="font-bold text-gray-500 dark:text-gray-400 mb-2">AI Assistant</h3>
              {isLoading ? (
                <p className="text-lg text-gray-500">AI is thinking...</p>
              ) : (
                <p className="text-lg text-green-700 dark:text-green-400 whitespace-pre-wrap">{feedback}</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full rounded-xl bg-white dark:bg-gray-800">
            <p className="text-xl text-gray-500">Select a letter or create a new one to begin.</p>
          </div>
        )}
      </main>
    </div>
  );
}