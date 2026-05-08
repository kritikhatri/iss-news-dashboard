import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2, Bot, User } from 'lucide-react';
import { chatWithHF } from '../utils/api';
import toast from 'react-hot-toast';

export default function Chatbot({ contextStr }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_history');
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([
          { role: 'assistant', content: 'Hello! I am your ISS & News Dashboard Assistant. Ask me anything about the current data!' }
        ]);
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
  }, []);

  // Save to localStorage when messages change (keep last 30)
  useEffect(() => {
    if (messages.length > 0) {
      const last30 = messages.slice(-30);
      localStorage.setItem('chat_history', JSON.stringify(last30));
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await chatWithHF(newMessages, contextStr);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error communicating with AI.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    const initialMsg = [{ role: 'assistant', content: 'Chat cleared. How can I help you today?' }];
    setMessages(initialMsg);
    localStorage.setItem('chat_history', JSON.stringify(initialMsg));
    toast.success('Chat history cleared!');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white rounded-full shadow-xl shadow-pink-500/30 transition-transform hover:scale-110 z-50 flex items-center justify-center"
        aria-label="Toggle Chat"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] max-h-[70vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 z-50 transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-blue-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-bold">Dashboard Assistant</h3>
            </div>
            <button 
              onClick={clearChat}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
              title="Clear Chat"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-pink-100 text-pink-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div 
                  className={`p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 max-w-[85%] self-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about ISS or News..."
                className="flex-grow px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-pink-500 focus:bg-white dark:focus:bg-slate-800 rounded-lg outline-none transition-colors text-sm"
                disabled={isTyping}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-50 text-white rounded-lg transition-colors flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
