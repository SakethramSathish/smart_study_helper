import React, { useState, useEffect } from 'react';
import "./AskAIMode.css";
import { Send, BookOpen, Loader, RotateCcw, Star, Video } from 'lucide-react';

const AskAIMode = () => {
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Load favorites from localStorage on component mount
    const savedFavorites = localStorage.getItem('aiExplainerFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const fetchAIResponse = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBRYI95jDuX8gGWcI3iAgJhFF81O_2W-Dg",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Explain ${query} in a well-structured format with examples. Include key concepts, practical applications, and comprehensive explanation. Format using markdown with headers, bullet points, and code examples if applicable.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content) {
        const aiText = data.candidates[0].content.parts[0].text;
        setAiResponse(aiText);
        
        // Add to history
        const newHistoryItem = { query, response: aiText, timestamp: new Date().toISOString() };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 20)); // Keep last 20 items
        
        // Fetch related YouTube videos
        fetchYouTubeVideos(query);
      } else {
        setError("Failed to get a valid response from the AI.");
      }
    } catch (err) {
      setError(`Error: ${err.message || "Failed to fetch AI response"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchYouTubeVideos = async (searchTerm) => {
    try {
      // In a real implementation, you would use the YouTube Data API
      // For demo purposes, we'll simulate with sample data
      // Replace this with actual YouTube API integration
      setTimeout(() => {
        setVideos([
          {
            id: 'video1',
            title: `Learn about ${searchTerm} - Comprehensive Guide`,
            thumbnail: `https://via.placeholder.com/120x90.png?text=${searchTerm}`,
            channelName: 'Education Channel',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}+tutorial`
          },
          {
            id: 'video2', 
            title: `${searchTerm} for Beginners`,
            thumbnail: `https://via.placeholder.com/120x90.png?text=${searchTerm}`,
            channelName: 'Learn Fast',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}+for+beginners`
          },
          {
            id: 'video3',
            title: `Advanced ${searchTerm} Concepts`,
            thumbnail: `https://via.placeholder.com/120x90.png?text=${searchTerm}`,
            channelName: 'Pro Academy',
            url: `https://www.youtube.com/results?search_query=advanced+${encodeURIComponent(searchTerm)}`
          }
        ]);
      }, 800);
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  const saveToFavorites = () => {
    if (!query || !aiResponse) return;
    
    const favorite = {
      id: Date.now(),
      query,
      response: aiResponse,
      timestamp: new Date().toISOString()
    };
    
    const updatedFavorites = [...favorites, favorite];
    setFavorites(updatedFavorites);
    localStorage.setItem('aiExplainerFavorites', JSON.stringify(updatedFavorites));
  };

  const clearResults = () => {
    setQuery('');
    setAiResponse('');
    setVideos([]);
  };

  const loadFromHistory = (item) => {
    setQuery(item.query);
    setAiResponse(item.response);
    fetchYouTubeVideos(item.query);
  };

  // Add this function to the AskAIMode component
  const formatMessage = (text) => {
    if (!text) return { __html: "" };
    
    // First, let's handle code blocks before any other processing
    // This prevents the markdown inside code blocks from being processed
    const codeBlocks = [];
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
      const id = `CODE_BLOCK_${codeBlocks.length}`;
      codeBlocks.push(code);
      return id;
    });
    
    // Process bullet points - First group them together
    let lines = text.split('\n');
    let result = [];
    let currentList = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const bulletMatch = line.match(/^[\*\-] (.*)$/);
      
      if (bulletMatch) {
        if (!currentList) {
          currentList = ['<ul>'];
        }
        currentList.push(`<li>${bulletMatch[1]}</li>`);
      } else if (currentList) {
        // End the current list
        currentList.push('</ul>');
        result.push(currentList.join(''));
        currentList = null;
        result.push(line);
      } else {
        result.push(line);
      }
    }
    
    // Handle any remaining list
    if (currentList) {
      currentList.push('</ul>');
      result.push(currentList.join(''));
    }
    
    text = result.join('\n');
    
    // Process other markdown elements
    text = text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic text
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Headers (h1, h2, h3)
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
      // Block quotes
      .replace(/^> (.*?)$/gm, "<blockquote>$1</blockquote>")
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>");
    
    // Restore code blocks
    codeBlocks.forEach((code, i) => {
      text = text.replace(
        `CODE_BLOCK_${i}`, 
        `<pre><code>${code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
      );
    });
    
    return { __html: text };
  };

  return (
    <div className="ask-ai-container">
      <div className="ask-ai-header">
        <div className="feature-icon">
          <BookOpen size={24} />
        </div>
        <h2>Ask AI Explainer</h2>
      </div>
      
      <div className="ask-ai-main">
        <div className="ask-ai-input-section">
          <div className="input-with-button">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter any topic or concept you want to learn about..."
              className="ask-ai-input"
              onKeyPress={(e) => e.key === 'Enter' && fetchAIResponse()}
              disabled={isLoading}
            />
            <button 
              className="send-button" 
              onClick={fetchAIResponse}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? <Loader className="spin-animation" size={20} /> : <Send size={20} />}
            </button>
          </div>
          
          <div className="action-buttons">
            <button 
              className="secondary-button" 
              onClick={clearResults} 
              disabled={isLoading || (!aiResponse && !videos.length)}
            >
              <RotateCcw size={16} /> Clear
            </button>
            <button 
              className="secondary-button"
              onClick={saveToFavorites}
              disabled={isLoading || !aiResponse}
            >
              <Star size={16} /> Save
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="content-container">
          <div className="ai-response-section">
            {isLoading ? (
              <div className="loading-container">
                <Loader className="spin-animation" />
                <p>Generating comprehensive explanation...</p>
              </div>
            ) : aiResponse ? (
              <div className="ai-response-content">
                <div className="ai-response-header">
                  <h3>AI Explanation</h3>
                </div>
                <div className="markdown-content">
                  {/* In a real implementation, you would use a markdown parser here */}
                  <div className="markdown-content" dangerouslySetInnerHTML={formatMessage(aiResponse)}></div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>Ask anything to get started</h3>
                <p>Enter any topic, concept, or question above and the AI will provide a detailed explanation with examples</p>
              </div>
            )}
          </div>
          
          {videos.length > 0 && (
            <div className="video-recommendations">
              <div className="section-header">
                <Video size={20} />
                <h3>Video Recommendations</h3>
              </div>
              <div className="videos-grid">
                {videos.map(video => (
                  <a 
                    key={video.id} 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="video-card"
                  >
                    <div className="video-thumbnail">
                      <img src={video.thumbnail} alt={video.title} />
                    </div>
                    <div className="video-info">
                      <h4>{video.title}</h4>
                      <p>{video.channelName}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {history.length > 0 && (
          <div className="history-section">
            <div className="section-header">
              <h3>Recent Searches</h3>
            </div>
            <div className="history-items">
              {history.slice(0, 5).map((item, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => loadFromHistory(item)}
                >
                  <p>{item.query}</p>
                  <small>{new Date(item.timestamp).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskAIMode;