import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { getSmartSuggestions } from '../../lib/ai';

export const SmartSuggestions = ({ studyContext }: { studyContext: any }) => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestion = async () => {
    setIsLoading(true);
    try {
      const result = await getSmartSuggestions(studyContext);
      setSuggestion(result);
    } catch (error) {
      setSuggestion("Focus on your core engineering modules today.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestion();
  }, []);

  return (
    <div className="bg-gradient-to-br from-primary/10 via-accent-purple/10 to-transparent rounded-[2rem] p-8 border border-primary/20 shadow-lg shadow-primary/5 relative overflow-hidden group">
      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain className="w-6 h-6 text-on-primary" />
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Smart Suggestion</h3>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Contextual Reasoning</p>
            </div>
          </div>
          <button 
            onClick={fetchSuggestion}
            disabled={isLoading}
            className="p-2 hover:bg-white/5 rounded-xl text-on-surface-variant hover:text-primary transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="h-4 bg-surface-container-highest/50 rounded-full w-full animate-pulse" />
              <div className="h-4 bg-surface-container-highest/50 rounded-full w-2/3 animate-pulse" />
            </motion.div>
          ) : (
            <motion.div
              key="suggestion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <p className="text-on-surface font-medium leading-relaxed italic">
                "{suggestion}"
              </p>
              
              <div className="flex items-center gap-3 pt-2">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all">
                  Take Action <ArrowRight className="w-3 h-3" />
                </button>
                <div className="h-px flex-1 bg-outline-variant/10" />
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-tertiary" />
                  <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter">AI Optimized</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
