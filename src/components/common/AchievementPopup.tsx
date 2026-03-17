import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Zap } from 'lucide-react';

interface AchievementPopupProps {
  show: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  type: 'achievement' | 'level-up' | 'streak';
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ 
  show, 
  onClose, 
  title, 
  subtitle,
  type 
}) => {
  const configs = {
    achievement: { icon: Trophy, color: 'text-primary', bg: 'bg-primary/10' },
    'level-up': { icon: Star, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
    streak: { icon: Zap, color: 'text-secondary', bg: 'bg-secondary/10' }
  };

  const Icon = configs[type].icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-10 left-10 z-[120] flex items-center gap-4 p-4 bg-surface-container-low/90 backdrop-blur-xl border border-outline-variant/20 rounded-2xl shadow-2xl min-w-[300px]"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${configs[type].bg} ${configs[type].color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-headline font-bold text-on-surface">{title}</h4>
            <p className="text-xs text-on-surface-variant">{subtitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
          >
            Dismiss
          </button>
          
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 4, ease: 'linear' }}
            onAnimationComplete={onClose}
            className={`absolute bottom-0 left-0 h-1 rounded-full ${configs[type].color.replace('text-', 'bg-')}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
