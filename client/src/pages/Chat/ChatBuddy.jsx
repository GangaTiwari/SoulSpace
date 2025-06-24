import React, { useState, useRef, useEffect } from 'react';
import API from '../../api/axios';

const ChatBuddy = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi there! I'm your AI mental health buddy. I'm here to listen, support, and chat with you. How are you feeling today?",
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
      // Prepare conversation history for the AI
      const conversationHistory = messages
        .filter(msg => msg.type === 'user' || msg.type === 'ai')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      // Call the AI API
      const response = await API.post('/chat', {
        message: inputMessage,
        conversationHistory: conversationHistory
      });

      // Defensive: ensure aiMessage.content is always a string
      let aiContent = response.data.data.message;
      if (typeof aiContent !== 'string') {
        try {
          aiContent = JSON.stringify(aiContent);
        } catch (e) {
          aiContent = '[Invalid AI response]';
        }
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiContent,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Failed to get AI response. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('Messages:', messages);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 flex flex-col">
      <div className="bg-white dark:bg-gray-800 shadow-2xl border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-2xl">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🤖</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">AI Chat Buddy</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your supportive AI companion</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 mx-4 mt-4 rounded-2xl shadow-md">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 border-x border-gray-100 dark:border-gray-800 rounded-b-2xl shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md relative text-sm leading-relaxed whitespace-pre-wrap ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                  }`}
                >
                  <p>{
                    typeof message.content === 'string' || typeof message.content === 'number'
                      ? message.content
                      : '[Invalid message content]'
                  }</p>
                  <p className={`text-xs mt-2 text-right ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-400'}`}>{formatTime(message.timestamp)}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 rounded-b-2xl shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
            >
              Send
            </button>
          </form>
          
          {/* Quick Responses */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "I'm feeling anxious",
              "I need someone to talk to",
              "I'm having a good day",
              "I'm feeling overwhelmed"
            ].map((quickResponse, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(quickResponse)}
                disabled={isTyping}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 shadow"
              >
                {quickResponse}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900 border-t border-yellow-200 dark:border-yellow-700 p-4 rounded-b-2xl shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-600 dark:text-yellow-200 text-lg">⚠️</div>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold">Important:</p>
              <p>I'm an AI companion designed to provide support and conversation. If you're experiencing a mental health crisis or need immediate help, please contact a mental health professional or call a crisis hotline.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBuddy; 