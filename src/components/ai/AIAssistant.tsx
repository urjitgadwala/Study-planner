import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  BookOpen, 
  Brain, 
  Zap, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { chatWithAssistant, speakText } from '../../lib/ai';
import { useVoiceToText } from '../../hooks/useVoiceToText';

export const AIAssistant = ({ studyContext }: { studyContext: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const { isListening, startListening, stopListening } = useVoiceToText();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const userMsg = input.trim();
    if (!userMsg || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(
        [...messages, { role: 'user', content: userMsg }],
        studyContext
      );
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      if (isSpeechEnabled) {
        speakText(response);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I hit a snag in my neural circuits. Please try again soon." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => setInput(text));
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-96 h-[600px] bg-surface-container-low/95 backdrop-blur-2xl border border-outline-variant/20 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary to-accent-purple text-on-primary">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg leading-tight">Study Architect</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Reasoning Engine</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                    className={`p-2 rounded-full transition-all ${isSpeechEnabled ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}
                  >
                    {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-on-surface font-bold">How can I optimize your study sprint?</p>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">Ask about complex topics, syllabus strategies, or productivity tips.</p>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-on-primary rounded-tr-none' 
                      : 'bg-surface-container text-on-surface border border-outline-variant/10 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container p-4 rounded-2xl rounded-tl-none border border-outline-variant/10">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-outline-variant/10 bg-surface/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVoiceInput}
                  className={`p-3 rounded-2xl transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-surface-container-highest text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <div className="relative flex-1">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask your architect..."
                    className="w-full bg-surface-container-highest border-none rounded-2xl py-4 pl-4 pr-12 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-on-primary rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-tertiary text-on-tertiary' : 'bg-primary text-on-primary bg-gradient-to-br from-primary to-accent-purple'
        }`}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </button>
    </div>
  );
};
