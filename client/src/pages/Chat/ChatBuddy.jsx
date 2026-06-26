import React, { useState, useRef, useEffect } from 'react';
import API from '../../api/axios';
import { Send, Loader, Bot } from 'lucide-react';

const quickResponses = ["Tell me a joke that make me laugh now", "I need someone to talk to", "I'm having a good day", "I'm feeling overwhelmed"];

const ChatBuddy = () => {
  const [messages, setMessages] = useState([{
    id: 1, type: 'ai',
    content: "Hi there! I'm your AI mental health buddy. I'm here to listen and support you. How are you feeling today? 💙",
    timestamp: new Date().toISOString()
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const formatTime = iso => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), type: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const history = messages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }));
      const res = await API.post('/chat', { message: text, conversationHistory: history });
     if (res.data.success) {
  setMessages(prev => [...prev, { id: Date.now()+1, type: 'ai', content: res.data.data.message || res.data.data.reply || "I'm here. Tell me more.", timestamp: new Date().toISOString() }]);
}
    } catch {
      setMessages(prev => [...prev, { id: Date.now()+1, type: 'ai', content: "I'm having trouble connecting. Please try again.", timestamp: new Date().toISOString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
          <Bot size={20} className="text-teal-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">AI Chat Buddy</p>
          <p className="text-xs text-teal-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full inline-block"></span> Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-y-auto space-y-4 mb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {msg.type === 'ai' && (
              <div className="w-7 h-7 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-teal-600" />
              </div>
            )}
            <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} max-w-xs`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                msg.type === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
              <p className="text-xs text-gray-300 mt-1 px-1">{formatTime(msg.timestamp)}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-50 rounded-full flex items-center justify-center">
              <Bot size={14} className="text-teal-600" />
            </div>
            <div className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <Loader size={14} className="text-teal-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickResponses.map((q, i) => (
          <button key={i} onClick={() => sendMessage(q)} disabled={isTyping}
            className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-40">
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Type a message..."
          disabled={isTyping}
          className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-sm transition disabled:opacity-50"
        />
        <button onClick={() => sendMessage(input)} disabled={isTyping || !input.trim()}
          className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
          <Send size={18} />
        </button>
      </div>

      <p className="text-xs text-gray-300 text-center mt-3">
        AI companion for support. If in crisis, please contact a mental health professional.
      </p>
    </div>
  );
};

export default ChatBuddy;