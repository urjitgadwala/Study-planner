import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-surface-container-low/30 rounded-[3rem] border border-dashed border-outline-variant/30"
    >
      <div className="w-20 h-20 bg-surface-container-high rounded-[2rem] flex items-center justify-center text-on-surface-variant/40 shadow-inner">
        <Icon className="w-10 h-10" />
      </div>
      <div className="max-w-xs space-y-2">
        <h3 className="text-xl font-headline font-bold text-on-surface">{title}</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-8 py-3 bg-primary text-on-primary rounded-2xl font-black text-sm hover:scale-[1.05] active:scale-[0.95] transition-all shadow-lg shadow-primary/20"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};
