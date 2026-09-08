import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Mic, RotateCcw } from 'lucide-react';
import { sendMessage } from '../services/aiService';
import { 
  estimateWaitTime, calculateFarmersAhead, 
  calculateRecommendedArrival, formatWaitTime, formatTime 
} from '../services/predictionService';

const SUGGESTED_QUESTIONS = [
  'Mera token kab aayega?',
  'Kitne log mere aage hain?',
  'Mandi kab jaana chahiye?',
  'Meri payment kab milegi?',
  'Procurement complete hua kya?',
];

export default function AIAssistant({ procurement, queue }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: `Namaste! Main Bhumi Sahayak hoon — aapka AI assistant.\n\nAap mujhse Hindi, Hinglish ya English mein poochh sakte hain:\n• Token status\n• Queue ki jankari\n• Payment ki sthiti\n• Mandi kab jaana hai`,
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      window.lenis?.stop();
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    } else {
      window.lenis?.start();
    }
    return () => {
      window.lenis?.start();
    };
  }, [isOpen]);

  const buildContext = () => {
    const farmerToken = procurement?.tokenNumber || 247;
    const currentToken = queue?.currentToken || 213;
    const avgProcessing = queue?.averageProcessingMinutes || 1.5;
    const farmersAhead = calculateFarmersAhead(farmerToken, currentToken);
    const estimatedWait = estimateWaitTime(farmersAhead, avgProcessing);
    const { arrivalTime, departureTime } = calculateRecommendedArrival(estimatedWait);

    return {
      farmerToken,
      currentToken,
      farmersAhead,
      estimatedWait,
      crop: procurement?.crop || 'Wheat',
      mandiName: procurement?.mandiName || 'Jaipur Procurement Centre',
      amount: procurement?.amount || 26400,
      paymentStatus: procurement?.paymentStatus || 'Processing',
      procurementStatus: procurement?.status || 'IN_QUEUE',
      arrivalTime: arrivalTime ? formatTime(arrivalTime) : null,
      departureTime: departureTime ? formatTime(departureTime) : null,
    };
  };

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;
    const question = text.trim();
    setInput('');

    // Add farmer message
    const farmerMsg = { id: Date.now(), role: 'farmer', text: question, time: new Date() };
    setMessages(prev => [...prev, farmerMsg]);
    setLoading(true);

    try {
      const context = buildContext();
      const { reply, intent } = await sendMessage(question, context, procurement?.farmerId);

      const aiMsg = { 
        id: Date.now() + 1, 
        role: 'ai', 
        text: reply, 
        intent,
        time: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: 'Maafi chahta hoon, abhi AI se connect nahi ho pa raha. Kripya thodi der baad dobara try karein.',
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      role: 'ai',
      text: 'Namaste! Main Bhumi Sahayak hoon. Aap mujhse kuch bhi poochh sakte hain.',
      time: new Date(),
    }]);
  };

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-800 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-primary-900 transition-all duration-200 hover:scale-110 animate-pulse-green"
          aria-label="Open Bhumi Sahayak AI"
        >
          <Bot size={24} className="text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs font-bold" style={{fontSize:'8px'}}>AI</span>
          </span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div 
          data-lenis-prevent="true"
          className="fixed bottom-6 right-6 z-50 w-full max-w-sm md:max-w-md h-[520px] md:h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col animate-slide-up overflow-hidden"
        >
          
          {/* Header */}
          <div className="bg-primary-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/20">
              <img src="/logo.png" alt="Bhumi Sahyog" className="w-6 h-6 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm" style={{fontFamily:'Outfit,sans-serif'}}>
                Bhumi Sahayak
              </p>
              <div className="flex items-center gap-1.5">
                <div className="live-dot w-1.5 h-1.5 bg-green-400 flex-shrink-0"></div>
                <p className="text-green-300 text-xs">Groq AI Powered · Live</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={clearChat} 
                className="p-1.5 text-primary-300 hover:text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
                title="Clear chat"
              >
                <RotateCcw size={15} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-primary-300 hover:text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'farmer' ? 'justify-end' : 'justify-start'} gap-2 animate-fade-in`}
              >
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 bg-primary-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                    <img src="/logo.png" alt="AI" className="w-4 h-4 object-contain" />
                  </div>
                )}
                <div className={msg.role === 'farmer' ? 'chat-bubble-farmer' : 'chat-bubble-ai'}>
                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
                {msg.role === 'farmer' && (
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={14} className="text-primary-700" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 bg-primary-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-accent-400" />
                </div>
                <div className="chat-bubble-ai">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-sm">Soch raha hoon...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 border-t border-slate-100 bg-white flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-primary-50 text-primary-800 border border-primary-200 rounded-full cursor-pointer hover:bg-primary-100 transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="px-3 py-3 border-t border-slate-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hindi/Hinglish/English mein likhen..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder-slate-400"
                aria-label="Message input"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  input.trim() && !loading 
                    ? 'bg-primary-800 text-white hover:bg-primary-900' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-1.5">
              Powered by Groq AI • Demo Mode
            </p>
          </div>
        </div>
      )}
    </>
  );
}
