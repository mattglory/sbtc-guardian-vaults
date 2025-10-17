import { useState, useEffect, useRef } from 'react';
import { aiAPI, marketAPI } from '../services/api';
import { MessageSquare, Send, Sparkles, X, Bot, User } from 'lucide-react';

export default function AIChat({ vaultBalance, riskProfile, address }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load AI status
    loadAIStatus();
    
    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm your AI portfolio advisor. Ask me anything about your vault, market conditions, or DeFi strategies!",
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadAIStatus = async () => {
    try {
      const status = await aiAPI.getAIStatus();
      setAiStatus(status.data);
    } catch (error) {
      console.error('Error loading AI status:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Get current BTC price for context
      const btcData = await marketAPI.getBTCPrice();
      
      // Prepare context
      const context = {
        vaultBalance,
        riskProfile,
        address,
        btcPrice: btcData.data.usd,
        btcChange: btcData.data.usd_24h_change
      };

      // Get AI response
      const response = await aiAPI.chat(inputValue, context);

      const aiMessage = {
        role: 'assistant',
        content: response.answer,
        provider: response.provider,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "Should I rebalance my portfolio?",
    "What's the current market outlook?",
    "How risky is my current allocation?",
    "When should I take profits?"
  ];

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 z-50 group"
      >
        <Sparkles className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900 animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-gradient-to-br from-gray-900 to-purple-900/50 rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col z-50 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-6 h-6 text-purple-400" />
            {aiStatus && (
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                aiStatus.openai ? 'bg-green-500' : 'bg-blue-500'
              }`}></div>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Portfolio Advisor</h3>
            {aiStatus && (
              <p className="text-xs text-gray-400">
                Powered by {aiStatus.openai ? 'GPT-4' : aiStatus.grok ? 'Grok' : 'Neural Network'}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-blue-600' 
                : 'bg-gradient-to-br from-purple-600 to-blue-600'
            }`}>
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[85%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-gray-800/50 text-gray-200 rounded-tl-sm border border-purple-500/20'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.provider && (
                <p className="text-xs text-gray-500 mt-1">
                  via {message.provider}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block p-3 rounded-2xl rounded-tl-sm bg-gray-800/50 border border-purple-500/20">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && !loading && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-full transition-colors border border-purple-500/30"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || loading}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
