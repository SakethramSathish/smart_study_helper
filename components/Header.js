import React from "react";
import "./ChatHeader.css"; // Updated CSS file

export default function Header() {
  return (
    <div className="chat-header">
      <div className="logo">
        <h1>Smart Study Helper 📚🤖</h1>
      </div>
      <div className="nav-links">
        <span>Chat Mode</span>
        <span>Flashcards</span>
      </div>
    </div>
  );
}
