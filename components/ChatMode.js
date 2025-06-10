import { useState, useEffect } from "react";
import axios from "axios";
import "./ChatMode.css";

function ChatMode() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load conversations from localStorage on component mount
  useEffect(() => {
    const savedConversations = localStorage.getItem("conversations");
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
    
    // Create a new conversation if none exists
    if (!currentConversationId) {
      createNewConversation();
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  // Create a new conversation
  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation = {
      id: newId,
      title: `Conversation ${conversations.length + 1}`,
      messages: [],
      timestamp: new Date().toISOString()
    };
    
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversationId(newId);
    setChatHistory([]);
  };

  // Load a specific conversation
  const loadConversation = (id) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversationId(id);
      setChatHistory(conversation.messages);
    }
  };

  // Delete a conversation
  const deleteConversation = (id, e) => {
    e.stopPropagation(); // Prevent triggering the loadConversation
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    
    // If the current conversation is deleted, create a new one or load another
    if (id === currentConversationId) {
      if (updatedConversations.length > 0) {
        loadConversation(updatedConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  // Update conversation with new messages
  const updateCurrentConversation = (newHistory) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversationId 
          ? {...conv, messages: newHistory, timestamp: new Date().toISOString()} 
          : conv
      )
    );
  };

  // Update conversation title based on first message
  const updateConversationTitle = (history) => {
    if (history.length >= 1 && history[0].sender === "user") {
      const title = history[0].text.slice(0, 30) + (history[0].text.length > 30 ? '...' : '');
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId 
            ? {...conv, title} 
            : conv
        )
      );
    }
  };

  async function generateAnswer() {
    if (!question.trim()) return;
  
    const newHistory = [...chatHistory, { sender: "user", text: question }];
    setChatHistory(newHistory);
    setQuestion("");
  
    // Update conversation in storage
    updateCurrentConversation(newHistory);
  
    // Update title if this is the first message
    if (chatHistory.length === 0) {
      updateConversationTitle(newHistory);
    }
  
    const lastBotResponse = chatHistory
      .slice()
      .reverse()
      .find((msg) => msg.sender === "bot")?.text;
  
    const updatedHistory = [...newHistory, { sender: "bot", text: "Loading..." }];
    setChatHistory(updatedHistory);
  
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY_HERE",
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: lastBotResponse
                    ? `Based on my previous response: '${lastBotResponse}', ${question}`
                    : question,
                },
              ],
            },
          ],
        }
      );
  
      const botReply =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";
  
      const finalHistory = [...newHistory, { sender: "bot", text: botReply }];
      setChatHistory(finalHistory);
      updateCurrentConversation(finalHistory);
    } catch (error) {
      const errorHistory = [
        ...newHistory,
        { sender: "bot", text: "Error fetching response. Try again later." },
      ];
      setChatHistory(errorHistory);
      updateCurrentConversation(errorHistory);
    }
  }
  

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      generateAnswer();
    }
  };

  // Escape HTML to prevent XSS
  const escapeHTML = (str) => {
    if (!str) return ""; // Prevents calling replace on undefined/null
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Format messages using Markdown-like syntax
  const formatMessage = (text) => {
    text = escapeHTML(text);

    // Convert **bold text**
    text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    // Convert bullet points
    text = text.replace(/^\* (.*)$/gm, "<ul><li>$1</li></ul>");
    text = text.replace(/^- (.*)$/gm, "<ul><li>$1</li></ul>");

    // Convert numbered lists
    text = text.replace(/^(\d+)\. (.*)$/gm, "<ul><li>$2</li></ul>");

    // Convert block quotes
    text = text.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");

    // Convert code blocks (```...```)
    text = text.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");

    // Convert inline code (`code`)
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Convert LaTeX (for later MathJax rendering)
    text = text.replace(/\$\$(.*?)\$\$/g, '<div class="math">$1</div>');
    text = text.replace(/\$(.*?)\$/g, '<span class="math">$1</span>');

    // Convert horizontal rules (---)
    text = text.replace(/^---$/gm, "<hr>");

    // **💡 NEW FIX: Ensure Answers Appear on a New Line**
    text = text.replace(/\n([a-d]\)) /g, "<br>$1 ");

    // **💡 NEW FIX: Ensure 'd)' and the Next Question Don't Join Together**
    text = text.replace(/(d\)) (.*?)(?=\d+\.|\n|$)/g, "$1 $2<br><br>");

    return { __html: text };
  };

  // Format timestamp for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    const sidebarElement = document.querySelector('.chat-sidebar');
    if (sidebarElement) {
        if (sidebarOpen) {
            sidebarElement.classList.add('closed');
        } else {
            sidebarElement.classList.remove('closed');
        }
    }
};


  return (
    <div className={`chat-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Conversations</h3>
          <button className="new-chat-btn" onClick={createNewConversation}>
            <span>+</span> New Chat
          </button>
        </div>
        <div className="sidebar-content">
          {conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((conv) => (
            <div 
              key={conv.id} 
              className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
              onClick={() => loadConversation(conv.id)}
            >
              <div className="conversation-info">
                <div className="conversation-title">{conv.title}</div>
                <div className="conversation-date">{formatDate(conv.timestamp)}</div>
              </div>
              <button 
                className="delete-conversation-btn"
                onClick={(e) => deleteConversation(conv.id, e)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Toggle Sidebar Button */}
        <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
        
        <div className="chat-container">
          <div className="chat-box">
            {chatHistory.length === 0 ? (
              <div className="welcome-message">
                <div className="welcome-icon">💬</div>
                <h2>Welcome to Smart Study Helper!</h2>
                <p>Ask me anything to get started with your study session.</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div 
                  key={index} 
                  className={`chat-message ${msg.sender}`}
                  dangerouslySetInnerHTML={formatMessage(msg.text)}
                ></div>
              ))
            )}
          </div>

          {/* Input Bar at the Bottom */}
          <div className="chat-input">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
            />
            <button onClick={generateAnswer}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMode;
