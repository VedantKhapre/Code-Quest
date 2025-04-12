import React, { useState, useRef, useEffect } from 'react';
import '../styles/global.css';

const API_KEY = import.meta.env.PUBLIC_MISTRAL_API_KEY; // Mistral API Key

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help with your coding questions?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: [{ role: "user", content: userInput }]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      const botResponse = data?.choices?.[0]?.message?.content || 
      'Sorry, I could not generate a response.';

      setMessages([...newMessages, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      console.error('Mistral API Error:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-embedded">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message-wrapper message-wrapper--${message.role}`}
          >
            <div className={`chat-message chat-message--${message.role}`}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper message-wrapper--assistant">
            <div className="chat-message chat-message--assistant chat-message--loading">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Ask something about programming..."
          disabled={isLoading}
          className="chat-input"
        />
        <button 
          type="submit" 
          disabled={isLoading || !userInput.trim()} 
          className="chat-send-btn"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;