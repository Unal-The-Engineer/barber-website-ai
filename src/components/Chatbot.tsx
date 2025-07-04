import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Scissors } from 'lucide-react';
import { ChatMessage } from '../types/types';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Elite Cuts AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare conversation context for API
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Call chatbot API
      const response = await fetch('http://localhost:8000/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          conversation_history: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, an error occurred. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 bg-brown-800 hover:bg-brown-900 text-vintage-cream p-4 border-2 border-brown-700 shadow-vintage-lg transition-all duration-300 hover:scale-110 z-50 animate-bounce-gentle"
      >
        {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 w-96 h-[500px] bg-vintage-cream border-4 border-brown-800 shadow-vintage-lg flex flex-col z-50 animate-slide-up">
          {/* Header */}
          <div className="bg-brown-800 text-vintage-cream p-6 border-b-2 border-brown-700">
            <div className="flex items-center">
              <Scissors className="h-6 w-6 mr-3 animate-pulse-soft" />
              <div>
                <span className="font-bold text-lg font-serif">Elite Cuts AI Assistant</span>
                <div className="text-xs text-cream-200 uppercase tracking-wider">AI Powered Assistant</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-vintage-pattern">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex animate-slide-up ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs p-4 border-2 transition-all duration-300 ${
                  message.sender === 'user'
                    ? 'bg-brown-800 text-vintage-cream border-brown-700'
                    : 'bg-vintage-cream text-brown-900 border-brown-600'
                }`}>
                  <div className="flex items-start space-x-3">
                    {message.sender === 'bot' && (
                      <Bot className="h-5 w-5 mt-0.5 text-brown-700" />
                    )}
                    {message.sender === 'user' && (
                      <User className="h-5 w-5 mt-0.5 text-cream-200" />
                    )}
                    <div className="text-sm whitespace-pre-line font-medium">{message.text}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start animate-slide-up">
                <div className="max-w-xs p-4 border-2 bg-vintage-cream text-brown-900 border-brown-600">
                  <div className="flex items-start space-x-3">
                    <Bot className="h-5 w-5 mt-0.5 text-brown-700" />
                    <div className="text-sm font-medium">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-brown-700 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-brown-700 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-brown-700 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Invisible element for auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t-2 border-brown-800 bg-brown-800">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 p-3 border-2 border-brown-600 bg-vintage-cream text-brown-900 focus:outline-none focus:ring-2 focus:ring-brown-700 transition-all duration-300 placeholder-brown-500 font-medium disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`p-3 border-2 transition-all duration-300 ${
                  inputText.trim() && !isLoading
                    ? 'bg-vintage-cream hover:bg-cream-100 text-brown-900 border-brown-600 hover:scale-105'
                    : 'bg-brown-600 text-brown-400 cursor-not-allowed border-brown-500'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;