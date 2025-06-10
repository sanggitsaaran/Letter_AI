import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

// Define the shape of a Letter object
interface Letter {
  _id: string;
  title: string;
  text: string;
  createdAt: string;
}

const socket = io("http://localhost:5000");

export default function App() {
  // State for the list of all letters in the sidebar
  const [letters, setLetters] = useState<Letter[]>([]);
  // State for the currently selected letter's ID
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  // State for the text in the editor
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchLetters = useCallback(async () => {
    const response = await fetch("http://localhost:5000/letters");
    const data = await response.json();
    setLetters(data);
    // If there's no active letter, select the first one
    if (!activeLetterId && data.length > 0) {
      setActiveLetterId(data[0]._id);
    }
  }, [activeLetterId]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  useEffect(() => {
  // When the activeLetterId changes, fetch its full content
  const fetchLetterContent = async () => {
    if (!activeLetterId) {
      // If no letter is selected, clear the editor.
      setText("");
      setFeedback("");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/letters/${activeLetterId}`);
      
      // NEW: Check if the response was successful (e.g., not a 404 or 500)
      if (!response.ok) {
        throw new Error(`Failed to fetch letter. Status: ${response.status}`);
      }

      const data: Letter = await response.json();
      setText(data.text);
      setFeedback(""); // Clear feedback when switching letters

    } catch (error) {
      console.error("Could not load letter content:", error);
      // This handles the error case, preventing a crash.
      setText("Error: Could not load this letter.");
      // Optional: You could also try to refresh the letter list here.
      // fetchLetters(); 
    }
  };

  fetchLetterContent();
}, [activeLetterId]);

  // Debouncing for AI feedback (this logic remains the same)
  useEffect(() => {
    if (text.trim() === "" || text.startsWith("Error:")) {
      setFeedback("");
      return;
    }
    const handler = setTimeout(() => getAIFeedback(text), 800);
    return () => clearTimeout(handler);
  }, [text]);

  const handleCreateNewLetter = async () => {
    const response = await fetch("http://localhost:5000/letters", { method: "POST" });
    const newLetter: Letter = await response.json();
    setLetters([newLetter, ...letters]); // Add to top of the list
    setActiveLetterId(newLetter._id); // Make it active
  };
  
  const handleDeleteLetter = async (idToDelete: string) => {
    await fetch(`http://localhost:5000/letters/${idToDelete}`, { method: "DELETE" });
    // Refetch the list to update the UI
    fetchLetters();
    // If we deleted the active letter, we need to select another one
    if(activeLetterId === idToDelete) {
      setActiveLetterId(null);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    socket.emit("saveText", { id: activeLetterId, text: newText });
  };

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

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
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
                  onClick={(e) => { e.stopPropagation(); handleDeleteLetter(letter._id); }}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  DELETE
                </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="w-3/4 p-8 flex flex-col">
        {activeLetterId ? (
          <>
            <textarea
              className="w-full flex-grow p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Start writing..."
              value={text}
              onChange={handleTyping}
            />
            <div className="mt-4 p-4 h-48 bg-white rounded-md border border-gray-200 overflow-y-auto">
              {isLoading ? (
                <p className="text-lg text-gray-500">AI is thinking...</p>
              ) : (
                <p className="text-lg text-green-700 whitespace-pre-wrap">{feedback}</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-500">Select a letter or create a new one to begin.</p>
          </div>
        )}
      </main>
    </div>
  );
}
