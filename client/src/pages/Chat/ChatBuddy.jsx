import React, { useState, useRef, useEffect } from 'react';
import API from '../../api/axios';
import { MessageCircle, Send, Loader } from 'lucide-react';

const ChatBuddy = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi there! I'm your AI mental health buddy. How are you feeling today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      const conversationHistory = messages
        .filter(msg => msg.type === 'user' || msg.type === 'ai')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      const response = await API.post('/chat', {
        message: userMessage.content,
        conversationHistory
      });

      if (response.data.success) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'ai',
          content: response.data.data.reply || "I understand. Tell me more.",
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const quickResponses = [
    "I'm feeling anxious",
    "I need someone to talk to",
    "I'm having a good day",
    "I'm feeling overwhelmed"
  ];

  return (
    <div className="max-w-2xl mx-auto py-12 flex flex-col h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <MessageCircle size={30} className="text-indigo-500" />
          AI Chat Buddy
        </h1>
        <p className="text-gray-300">Chat with your mental health companion</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-200 border border-gray-700'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              <p className={`text-xs text-gray-600 mt-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <Loader size={20} className="text-indigo-500 animate-spin" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-gray-600 text-center mt-6">
          {error}
        </p>
      )}

      {/* Quick Response Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickResponses.map((quickResponse, index) => (
          <button
            key={index}
            onClick={() => setInputMessage(quickResponse)}
            disabled={isTyping}
            className="bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs px-3 py-1 rounded-full transition-colors disabled:opacity-50"
          >
            {quickResponse}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-3 mb-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={isTyping || !inputMessage.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <Send size={18} />
        </button>
      </form>

      {/* Safety Notice */}
      <p className="text-xs text-gray-600 text-center">
        I'm an AI companion designed to provide support. If you're in crisis, please contact a mental health professional or crisis hotline.
      </p>
    </div>
  );
};

export default ChatBuddy; 
