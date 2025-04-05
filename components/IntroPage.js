import React from "react";
import "./IntroPage.css"
import { MessageSquare, Book, Clock, ArrowRight, BookOpen } from "lucide-react";

const IntroPage = ({ onModeChange }) => {
  return (
    <div className="intro-container">
      <div className="hero-section">
        <h1 className="hero-title">Supercharge Your Study Sessions</h1>
        <p className="hero-tagline">
          An AI-powered study assistant designed to help you learn more
          effectively, remember information longer, and manage your study time
          efficiently.
        </p>
        <button className="cta-button" onClick={() => onModeChange("chat")}>
          Get Started <ArrowRight size={18} />
        </button>
      </div>

      <div className="features-grid">
        <div className="feature-card" onClick={() => onModeChange("chat")}>
          <div className="feature-icon">
            <MessageSquare size={32} />
          </div>
          <h3 className="feature-title">Chat Mode</h3>
          <p className="feature-description">
            Get instant answers to your questions, explanations for complex topics, and
            personalized study guidance from our AI assistant.
          </p>
          <button className="feature-button">Try Chat Mode</button>
        </div>

        <div className="feature-card" onClick={() => onModeChange("flashcards")}>
          <div className="feature-icon">
            <Book size={32} />
          </div>
          <h3 className="feature-title">Flashcards</h3>
          <p className="feature-description">
            Create and study with digital flashcards to strengthen your memory and
            test your knowledge on any subject effectively.
          </p>
          <button className="feature-button">Try Flashcards</button>
        </div>

        <div className="feature-card" onClick={() => onModeChange("timer")}>
          <div className="feature-icon">
            <Clock size={32} />
          </div>
          <h3 className="feature-title">Timer</h3>
          <p className="feature-description">
            Use the Pomodoro technique and other time management tools to 
            maintain focus and optimize your study sessions.
          </p>
          <button className="feature-button">Try Timer</button>
        </div>
        
        <div className="feature-card" onClick={() => onModeChange("askai")}>
          <div className="feature-icon">
            <BookOpen size={32} />
          </div>
          <h3 className="feature-title">AI Explainer</h3>
          <p className="feature-description">
            Get comprehensive explanations on any topic with examples, key concepts, 
            and practical applications supported by related video resources.
          </p>
          <button className="feature-button">Try AI Explainer</button>
        </div>
      </div>
        

      <div className="testimonial-section">
        <h3 className="testimonial-title">Students Love Smart Study Helper</h3>
        <div className="testimonial-container">
          <div className="testimonial-quote">
            "This app has completely transformed how I study. The AI chat helps me understand difficult concepts, and the Pomodoro timer keeps me focused."
          </div>
          <div className="testimonial-author">— Alex S., Computer Science Student</div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;