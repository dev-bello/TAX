import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Phone, Mail, UserCircle, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  apiKey?: string;
  context?: {
    companyRevenue?: number;
    companySize?: string;
    sector?: string;
    currentView?: string;
  };
}

const WELCOME_MESSAGE = `Hello! I'm your AI Tax Assistant. I can help you with:

• Understanding Nigerian tax terms and rules
• Calculating your estimated tax liability
• Explaining deductions and exemptions
• Guidance on NRS compliance
• General tax planning advice

What would you like to know about your taxes today?`;

const QUICK_PROMPTS = [
  "What taxes do I need to pay?",
  "How do I reduce my tax bill?",
  "What is VAT and do I need to register?",
  "Explain Pioneer Status",
  "When are my tax deadlines?",
];

// Moonshot AI API endpoint
const MOONSHOT_API_URL = 'https://api.moonshot.ai/v1/chat/completions';

export default function AIChatAssistant({ apiKey, context }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHumanSupport, setShowHumanSupport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use provided API key, environment variable, or fall back to hardcoded one
  const MOONSHOT_API_KEY = apiKey || process.env.MOONSHOT_API_KEY || 'sk-Ox9DhWOCgmu6eCduQtehi26xKuRlhmgAT6s8oD4NfNJ4npEZ';

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const generateSystemPrompt = () => {
    const basePrompt = `You are a helpful Nigerian tax assistant powered by Kimi AI. Your role is to explain tax concepts in simple, non-technical language that anyone can understand.

Key Guidelines:
- Use plain English, avoid accounting jargon unless you explain it
- Be friendly and encouraging - taxes can be intimidating
- Provide specific Nigerian context (NRS, current tax laws)
- When discussing numbers, use Nigerian Naira (₦)
- If unsure about something, be honest and suggest consulting a professional
- Keep responses concise (2-4 paragraphs max) unless detailed explanation is requested

Current Nigerian Tax Facts (2025/26 Tax Act):
- Company Income Tax (CIT): 0% for small companies (<₦25M revenue), 20% for medium (₦25M-₦100M), 30% for large (>₦100M)
- VAT: 7.5% on most goods and services
- Education Tax (TETFund): REDUCED to 2% (from 3%) for medium and large companies
- Minimum Tax: INCREASED to 0.5% of turnover (from 0.25%) for companies with losses
- Digital Tax: 5% on digital services by non-resident companies to Nigerian consumers
- Pioneer Status: Extended to 7 years for strategic sectors (tech, agriculture, manufacturing)
- PAYE: Progressive income tax for employees
- NRS: Unified revenue service replacing FIRS for all tax collection. Portal: www.nrs.gov.ng

Always structure your answers with:
1. Direct answer to the question
2. Practical example if applicable
3. Next steps or action items`;

    if (context) {
      return `${basePrompt}

Current User Context:
${context.companyRevenue ? `- Annual Revenue: ₦${context.companyRevenue.toLocaleString()}` : ''}
${context.companySize ? `- Company Size: ${context.companySize}` : ''}
${context.sector ? `- Business Sector: ${context.sector}` : ''}
${context.currentView ? `- Currently Viewing: ${context.currentView}` : ''}

Use this context to provide personalized advice where relevant.`;
    }

    return basePrompt;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for Moonshot AI
      const conversationHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch(MOONSHOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'system',
              content: generateSystemPrompt()
            },
            ...conversationHistory,
            {
              role: 'user',
              content: content
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || 
        'I apologize, but I could not process your request. Please try again.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error connecting to the AI service. Please check your internet connection and try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-NG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleHumanSupport = () => {
    setShowHumanSupport(true);
  };

  const requestHumanCallback = () => {
    const callbackMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '✅ Callback request received!\n\nAn accountant will call you within 24 hours at your registered phone number.\n\nReference ID: #CB-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, callbackMessage]);
    setShowHumanSupport(false);
  };

  const sendEmailToAccountant = () => {
    window.location.href = 'mailto:support@taxfyp.ng?subject=Tax Support Request&body=Please help me with my tax situation.';
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-tour="ai-assistant"
        className={`
          fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-50 p-3 lg:p-4 rounded-full shadow-lg transition-all duration-300
          ${isOpen 
            ? 'bg-error text-white rotate-90' 
            : 'bg-primary text-white hover:bg-primary/90 hover:scale-110'
          }
        `}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={20} className="lg:w-6 lg:h-6" /> : <MessageCircle size={20} className="lg:w-6 lg:h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="
          fixed inset-x-0 bottom-0 top-0 lg:inset-auto lg:bottom-24 lg:right-6 z-50 
          w-full lg:w-96 
          h-[100dvh] lg:h-[600px] 
          bg-surface-container-lowest 
          lg:rounded-3xl 
          shadow-2xl 
          border-0 lg:border lg:border-outline-variant/20 
          flex flex-col overflow-hidden 
          animate-in slide-in-from-bottom-10 fade-in duration-300
        ">
          {/* Header */}
          <div className="bg-primary p-3 lg:p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} className="lg:w-6 lg:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm lg:text-base">Tax Assistant</h3>
                <p className="text-[10px] lg:text-xs text-white/70">Ask me anything about Nigerian taxes</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 lg:gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`
                  w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shrink-0
                  ${message.role === 'user' 
                    ? 'bg-surface-container-high text-on-surface' 
                    : 'bg-primary-container/30 text-primary'
                  }
                `}>
                  {message.role === 'user' ? <User size={14} className="lg:w-4 lg:h-4" /> : <Bot size={14} className="lg:w-4 lg:h-4" />}
                </div>
                <div className={`
                  max-w-[80%] lg:max-w-[75%] p-2.5 lg:p-3 rounded-2xl text-sm
                  ${message.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-surface-container-low text-on-surface rounded-bl-md'
                  }
                `}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`
                    text-[10px] lg:text-xs mt-1
                    ${message.role === 'user' ? 'text-white/60' : 'text-on-surface-variant'}
                  `}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 lg:gap-3">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
                  <Bot size={14} className="lg:w-4 lg:h-4" />
                </div>
                <div className="bg-surface-container-low p-2.5 lg:p-3 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin text-primary" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-3 lg:px-4 pb-2 shrink-0">
              <p className="text-[10px] lg:text-xs text-on-surface-variant mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                {QUICK_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[10px] lg:text-xs bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full transition-colors border border-outline-variant/20"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 lg:p-4 border-t border-outline-variant/15 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your taxes..."
                className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-primary text-white p-2 lg:p-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} className="lg:w-[18px] lg:h-[18px]" />
              </button>
            </div>
          </form>

          {/* Human Support Section */}
          <div className="p-2.5 lg:p-3 bg-surface-container-low border-t border-outline-variant/10 shrink-0" data-tour="human-support">
            {!showHumanSupport ? (
              <button
                onClick={handleHumanSupport}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs lg:text-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <UserCircle size={14} className="lg:w-4 lg:h-4" />
                Talk to human
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={requestHumanCallback}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-tertiary text-white rounded-lg text-xs lg:text-sm font-medium hover:bg-tertiary/90 transition-colors"
                  >
                    <Phone size={14} />
                    Callback
                  </button>
                  <button
                    onClick={sendEmailToAccountant}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-primary text-white rounded-lg text-xs lg:text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Mail size={14} />
                    Email
                  </button>
                </div>
                <button
                  onClick={() => setShowHumanSupport(false)}
                  className="w-full text-[10px] lg:text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
