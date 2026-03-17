import React from 'react';
import { motion } from 'motion/react';

interface StudyChartProps {
  data: number[];
  labels: string[];
}

export const StudyChart: React.FC<StudyChartProps> = ({ data, labels }) => {
  const max = Math.max(...data, 1);
  
  return (
    <div className="flex items-end justify-between h-32 gap-3 px-2">
      {data.map((value, i) => {
        const height = (value / max) * 100;
        const isToday = i === data.length - 1;
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-high text-on-surface px-2 py-1 rounded text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity border border-outline-variant/20 z-20 pointer-events-none">
              {value} XP
            </div>

            <div 
              className="w-full flex items-end justify-center perspective-[1000px]"
              style={{ height: '100%' }}
            >
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 1, ease: "circOut", delay: i * 0.1 }}
                className={`w-full rounded-t-xl relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all duration-300 ${
                  isToday 
                    ? 'bg-gradient-to-t from-primary via-primary to-accent-purple shadow-lg shadow-primary/20 ring-1 ring-primary/50' 
                    : 'bg-surface-container-highest group-hover:bg-primary/20'
                }`}
              >
                {/* Visual texture for the bars */}
                <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                {!isToday && (
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.div>
            </div>
            
            <span className={`text-[8px] font-bold tracking-tighter transition-colors ${
              isToday ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
            }`}>
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
};
