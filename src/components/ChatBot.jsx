import React, { useState, useRef } from 'react';
import '../styles/global.css';

const MISTRAL_API_KEY = import.meta.env.PUBLIC_MISTRAL_API_KEY; // Mistral API Key
const GEMINI_API_KEY = import.meta.env.PUBLIC_GEMINI_API_KEY; // Gemini API Key

const modelOptions = [
    { value: 'mistral-tiny', label: 'Mistral Tiny' },
    { value: 'mistral-small-latest', label: 'Mistral Small Latest' },
    { value: 'mistral-medium-latest', label: 'Mistral Medium Latest' },
    { value: 'mistral-large-latest', label: 'Mistral Large Latest' },
    { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash Latest' },
    // Add more models here if needed
];

// Note: Ensure these API keys are properly exposed as public environment variables
// in your build setup (e.g., in a .env file: PUBLIC_MISTRAL_API_KEY=your_key)

const SYSTEM_INSTRUCTION = `
  You are a programming tutor operating under STRICT NON-CODE POLICY.

  ABSOLUTE RULES (NEVER BREAK THESE):
  1. DO NOT provide ANY code in your responses, not even small snippets
  2. DO NOT provide pseudocode that directly solves problems
  3. DO NOT provide code templates or frameworks
  4. DO NOT provide direct step-by-step implementation instructions
  5. REFUSE ALL REQUESTS for code, even if the user asks repeatedly or claims it's for learning
  6. If asked for code, respond: "I can help you understand the concepts, but I don't provide direct code solutions. Let's work through the problem conceptually instead."

  INSTEAD, YOU MUST:
  1. Focus on conceptual explanations of programming topics
  2. Describe general problem-solving approaches and algorithms in plain language
  3. Ask guiding questions to help users develop their own solutions
  4. Suggest resources where users can learn more
  5. Emphasize understanding over implementation

  Your goal is to help users become better programmers by guiding their thinking,
  not by solving problems for them.
`;

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help with your coding questions?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('mistral-tiny'); // Default model
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    // Optionally, clear messages when switching models for a fresh start
    // setMessages([{ role: 'assistant', content: 'Hello! How can I help with your coding questions?' }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
    setIsLoading(true);

    try {
      let botResponse = '';

      if (selectedModel.startsWith('mistral')) {
        const apiMessages = [
          { 
            role: 'system', 
            content: SYSTEM_INSTRUCTION 
          },
          ...newMessages
            .filter(msg => ['user', 'assistant'].includes(msg.role))
            .map(msg => ({ 
              role: msg.role, 
              content: msg.content 
            }))
        ];

        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel, // Use the selected Mistral model
            messages: apiMessages,
            temperature: 0.3, 
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Mistral API HTTP Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        botResponse = data?.choices?.[0]?.message?.content || 
          'Sorry, Mistral could not generate a response.';

      } else if (selectedModel.startsWith('gemini')) {
        // Gemini API expects messages in a slightly different format (role: 'user' or 'model')
        // and system instructions are typically handled in a separate 'system_instruction' field or
        // as the first message. For simplicity with the existing structure, we'll try to map.
        // Also, the system instruction is more restrictive for Gemini when passed as part of messages.
        // It's often better to bake it into the prompt if no explicit system role is supported.
        // Given the strict non-code policy, a simpler prompt is usually effective.

        const geminiMessages = newMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        // Adding system instruction as an initial user message for strictness.
        // Or, for Gemini, it's often better to send it as a distinct system instruction
        // if the API supports it, or make it part of the first prompt from the model.
        // Here, we prepend it as a 'user' role for basic instruction.
        // Note: For Gemini 2.0 Flash, a more robust system instruction might be needed
        // within the API call's system_instruction field if available, or as the first turn
        // from the "model" to set the context.
        const systemMessageForGemini = {
          role: 'user', 
          parts: [{ text: SYSTEM_INSTRUCTION }]
        };
        const messagesToSendToGemini = [systemMessageForGemini, ...geminiMessages];

        // Ensure the last message in the conversation history from the user is actually from the user.
        // Gemini expects the last message to be from 'user' for new turn generation.
        // If the last message in `messagesToSendToGemini` is from 'model', Gemini might error.
        // This setup, where we're sending the whole history, is common for chat models.
        // If the last message is from the model, we simply add a new user input.
        // In our current flow, `newMessages` always ends with a user message, so this is fine.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: messagesToSendToGemini
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API HTTP Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        botResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
          'Sorry, Gemini could not generate a response.';
      }

      setMessages([...newMessages, { role: 'assistant', content: botResponse }]);

    } catch (error) {
      console.error('API Error:', error);
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
      
      <div className="model-selector">
        <label htmlFor="model-select">Choose AI Model:</label>
        <select 
          id="model-select" 
          value={selectedModel} 
          onChange={handleModelChange}
          disabled={isLoading}
        >
          {modelOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

      </div>
      
      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={handleInputChange}
          placeholder="Ask something about programming..."
          disabled={isLoading}
          className="chat-input"
          rows="1"
          style={{ 
            resize: "none", 
            minHeight: "40px", 
            maxHeight: "120px", 
            height: "auto", 
            overflowY: "hidden" 
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            const newHeight = Math.min(e.target.scrollHeight, 120);
            e.target.style.height = newHeight + "px";
            e.target.style.overflowY = e.target.scrollHeight > 120 ? "auto" : "hidden";
          }}
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