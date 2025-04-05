import { useState, useEffect } from "react";
import "../App.css";
import { Plus } from "lucide-react"; // Import the Plus icon

function FlashcardMode() {
  const [flashcards, setFlashcards] = useState([]);

  // Load flashcards from local storage when the component mounts
  useEffect(() => {
    const storedFlashcards = localStorage.getItem("flashcards");
    if (storedFlashcards) {
      setFlashcards(JSON.parse(storedFlashcards));
    }
  }, []);

  // Save flashcards to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  const toggleFlip = (index) => {
    setFlashcards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, flipped: !card.flipped } : card
      )
    );
  };

  const addFlashcard = () => {
    const question = prompt("Enter the question:");
    const answer = prompt("Enter the answer:");
    if (question && answer) {
      setFlashcards([...flashcards, { question, answer, flipped: false }]);
    }
  };

  const deleteFlashcard = (index, event) => {
    event.stopPropagation(); // Prevent flip when deleting
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  return (
    <div className="flashcard-container">
      <button 
        className="add-flashcard-btn" 
        onClick={addFlashcard}
      >
        <Plus size={20} className="plus-icon" />
        Add Flashcard
      </button>

      <div className="flashcard-grid">
        {flashcards.map((card, index) => (
          <div
            key={index}
            className={`flashcard ${card.flipped ? "flipped" : ""}`}
            onClick={() => toggleFlip(index)}
          >
            <div className="flashcard-inner">
              <div className="flashcard-front">{card.question}</div>
              <div className="flashcard-back">{card.answer}</div>
            </div>
            <button
              className="delete-btn"
              onClick={(e) => deleteFlashcard(index, e)}
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FlashcardMode;
