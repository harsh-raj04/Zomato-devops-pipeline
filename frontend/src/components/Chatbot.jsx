import React, { useState, useRef, useEffect } from 'react';

const QUICK_REPLIES = [
  "What's your best restaurant?",
  "How do I place an order?",
  "Track my order",
  "Payment options",
  "Cancel my order"
];

const BOT_RESPONSES = {
  greeting: "Hello! 👋 I'm FoodBot, your AI assistant. How can I help you today?",
  restaurants: "🍽️ We have amazing restaurants! Some top picks:\n\n• **Spice Garden** - North Indian (⭐ 4.5)\n• **Pizza Paradise** - Italian (⭐ 4.3)\n• **Dragon Wok** - Chinese (⭐ 4.6)\n\nBrowse all restaurants on our home page!",
  order: "📦 To place an order:\n\n1. Select a restaurant\n2. Add items to your cart\n3. Click 'Place Order'\n4. Make payment\n\nYou'll receive a confirmation with your Order ID!",
  track: "🔍 To track your order:\n\n1. Login to your account\n2. Go to 'My Orders'\n3. View real-time status\n\nNeed help with a specific order? Share your Order ID!",
  payment: "💳 We accept:\n\n• Credit/Debit Cards\n• UPI (GPay, PhonePe, Paytm)\n• Net Banking\n• Cash on Delivery\n\nAll transactions are 100% secure!",
  cancel: "❌ To cancel an order:\n\n1. Go to 'My Orders'\n2. Select the order\n3. Click 'Cancel Order'\n\n⚠️ Orders can only be cancelled before they're prepared. Refunds process within 3-5 business days.",
  hours: "🕐 Most restaurants are open:\n\n• Lunch: 11 AM - 3 PM\n• Dinner: 6 PM - 11 PM\n\nHours vary by restaurant. Check individual listings for details!",
  delivery: "🚚 Delivery Info:\n\n• Average time: 30-45 minutes\n• Free delivery on orders above ₹199\n• Live tracking available\n• Contactless delivery option",
  default: "I'm not sure I understood that. Could you try rephrasing? Or choose from these topics:\n\n• Restaurant recommendations\n• How to order\n• Track order\n• Payment options\n• Delivery info"
};

function getResponse(message) {
  const lower = message.toLowerCase();
  
  if (lower.match(/hi|hello|hey|good/)) {
    return BOT_RESPONSES.greeting;
  }
  if (lower.match(/restaurant|best|recommend|suggest|food|eat/)) {
    return BOT_RESPONSES.restaurants;
  }
  if (lower.match(/order|place|how.*order|ordering/)) {
    return BOT_RESPONSES.order;
  }
  if (lower.match(/track|where|status|arriving/)) {
    return BOT_RESPONSES.track;
  }
  if (lower.match(/pay|payment|card|upi|cash|cod/)) {
    return BOT_RESPONSES.payment;
  }
  if (lower.match(/cancel|refund|return/)) {
    return BOT_RESPONSES.cancel;
  }
  if (lower.match(/time|hour|open|close|timing/)) {
    return BOT_RESPONSES.hours;
  }
  if (lower.match(/deliver|shipping|fast|quick/)) {
    return BOT_RESPONSES.delivery;
  }
  if (lower.match(/thank|thanks|bye|okay|ok/)) {
    return "You're welcome! 😊 Have a great meal! Feel free to ask if you need anything else.";
  }
  
  return BOT_RESPONSES.default;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: BOT_RESPONSES.greeting, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = { type: 'user', text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const response = getResponse(text);
      const botMessage = { type: 'bot', text: response, time: new Date() };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">🤖</div>
            <div>
              <div className="chatbot-name">FoodBot</div>
              <div className="chatbot-status">
                <span className="status-dot"></span>
                Always here to help
              </div>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.type}`}>
              {msg.type === 'bot' && <span className="message-avatar">🤖</span>}
              <div className="message-content">
                <div className="message-text" dangerouslySetInnerHTML={{ 
                  __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>') 
                }} />
                <div className="message-time">{formatTime(msg.time)}</div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <span className="message-avatar">🤖</span>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="quick-replies">
          {QUICK_REPLIES.map((reply, idx) => (
            <button 
              key={idx} 
              className="quick-reply-btn"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input */}
        <form className="chatbot-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isTyping}
          />
          <button type="submit" disabled={!input.trim() || isTyping}>
            ➤
          </button>
        </form>
      </div>
    </>
  );
}
