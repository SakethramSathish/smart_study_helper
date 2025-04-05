import { useState, useEffect } from "react";
import "./App.css";
import ChatMode from "./components/ChatMode";
import FlashcardMode from "./components/FlashcardMode";
import TimerMode from "./components/TimerMode";
import AskAIMode from "./components/AskAIMode";  // Import our new component
import IntroPage from "./components/IntroPage";
// Import Lucide React icons
import { Moon, Sun, Book, MessageSquare, Clock, Home, BookOpen } from "lucide-react";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [mode, setMode] = useState("intro");

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      {/* Header updated with AskAI instead of Study Plan */}
      <header className="chat-header">
        <div className="logo">
          <h1>
            <Book className="inline-block mr-2" />
            Smart Study Helper
          </h1>
        </div>
        <nav className="nav-links">
          <span
            className={mode === "intro" ? "active-link" : ""}
            onClick={() => setMode("intro")}
          >
            <Home className="inline-block mr-1" size={18} />
            Home
          </span>
          <span
            className={mode === "chat" ? "active-link" : ""}
            onClick={() => setMode("chat")}
          >
            <MessageSquare className="inline-block mr-1" size={18} />
            Chat Mode
          </span>
          <span
            className={mode === "flashcards" ? "active-link" : ""}
            onClick={() => setMode("flashcards")}
          >
            <Book className="inline-block mr-1" size={18} />
            Flashcards
          </span>
          <span
            className={mode === "askai" ? "active-link" : ""}
            onClick={() => setMode("askai")}
          >
            <BookOpen className="inline-block mr-1" size={18} />
            Ask AI Explainer
          </span>
          <span
            className={mode === "timer" ? "active-link" : ""}
            onClick={() => setMode("timer")}
          >
            <Clock className="inline-block mr-1" size={18} />
            Timer
          </span>
        </nav>
        <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Content Container with new AskAI mode */}
      <div className="content-container">
        {mode === "intro" ? (
          <IntroPage onModeChange={setMode} />
        ) : mode === "chat" ? (
          <ChatMode />
        ) : mode === "flashcards" ? (
          <FlashcardMode />
        ) : mode === "askai" ? (
          <AskAIMode />
        ) : (
          <TimerMode />
        )}
      </div>
    </div>
  );
}

export default App;