import React, { Component } from 'react';
import { motion } from 'motion/react';
import { Book, Target, Zap, LogIn, AlertCircle } from 'lucide-react';

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
    {/* Decorative background elements */}
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-md w-full bg-surface-container-low/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-outline-variant/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] text-center space-y-8 relative z-10"
    >
      <div className="relative mx-auto w-24 h-24">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-br from-primary via-accent-purple to-secondary rounded-[2rem] opacity-30 blur-xl"
        />
        <div className="relative w-full h-full bg-gradient-to-br from-primary to-accent-purple rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/40 border border-white/20">
          <Book className="w-12 h-12 text-on-primary" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-5xl font-headline font-black text-on-surface tracking-tight leading-none bg-gradient-to-b from-on-surface to-on-surface-variant bg-clip-text text-transparent">
          Study<br/>Architect
        </h1>
        <p className="text-on-surface-variant font-bold text-sm uppercase tracking-[0.2em] opacity-60">The Future of Learning</p>
      </div>

      <div className="py-2 space-y-3">
        {[
          { icon: Target, title: 'AI Roadmaps', desc: 'Custom syllabus breakthroughs', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Zap, title: 'Neural Quizzing', desc: 'Retain 90% more knowledge', color: 'text-secondary', bg: 'bg-secondary/10' }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            className="flex items-center gap-4 text-left p-4 bg-white/5 rounded-2xl border border-outline-variant/10 hover:bg-white/10 transition-colors"
          >
            <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color} shadow-inner`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-on-surface">{item.title}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={onLogin}
        className="group relative w-full py-5 bg-primary text-on-primary rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/40 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <LogIn className="w-6 h-6" />
        Enter Workspace
      </button>
      
      <div className="flex flex-col gap-1 items-center">
        <div className="h-px w-12 bg-outline-variant/20 mb-2" />
        <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] font-black">Powered by Google Cloud & Groq</p>
      </div>
    </motion.div>
  </div>
);

export const LoadingScreen = () => (
  <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6">
    <div className="relative w-16 h-16">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-full h-full border-4 border-primary/20 border-t-primary rounded-full"
      />
      <Book className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
    </div>
    <p className="text-sm font-bold text-on-surface-variant animate-pulse uppercase tracking-widest">Initializing Portal...</p>
  </div>
);

export class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    // @ts-ignore
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        // @ts-ignore
        const parsed = JSON.parse(this.state.error.message);
        errorMessage = `Firestore Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}`;
      } catch (e) {
        // @ts-ignore
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
          <div className="bg-surface-container p-8 rounded-[2rem] border border-tertiary/20 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-tertiary/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-tertiary" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface">Application Error</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
