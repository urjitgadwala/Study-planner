import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { Subject, CalendarEvent } from '../../types';

interface WeeklyPlannerProps {
  subjects: Subject[];
  onPlanGenerated: (events: CalendarEvent[]) => void;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ subjects, onPlanGenerated }) => {
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  const generatePlan = () => {
    const newEvents: CalendarEvent[] = [];
    const today = new Date();
    
    subjects.forEach(subject => {
      const hours = allocations[subject.id] || 0;
      if (hours > 0) {
        for (let i = 1; i <= Math.min(hours, 7); i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          newEvents.push({
            id: `weekly-${subject.id}-${i}-${Date.now()}`,
            title: `Study: ${subject.title}`,
            subject: subject.title,
            type: 'Study Session',
            date: dateStr,
            time: '10:00',
            duration: '1h',
            reminders: ['1h'],
            completed: false,
            isRecurring: false
          });
        }
      }
    });
    
    onPlanGenerated(newEvents);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-10 space-y-8 max-w-4xl mx-auto"
    >
      <div className="text-center space-y-4">
        <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">Weekly Study Architect</h2>
        <p className="text-on-surface-variant font-medium">Allocate your study hours intelligently for the upcoming week.</p>
      </div>

      <div className="bg-surface-container-low/50 backdrop-blur-md rounded-3xl p-8 border border-outline-variant/10 space-y-6 shadow-2xl">
        {subjects.map(subject => (
          <div key={subject.id} className="flex items-center justify-between gap-6 p-6 rounded-2xl bg-surface-container/30 border border-outline-variant/5 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: subject.color }}></div>
              <span className="font-bold text-on-surface text-lg">{subject.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                min="0"
                max="40"
                value={allocations[subject.id] || 0}
                onChange={(e) => setAllocations({ ...allocations, [subject.id]: parseInt(e.target.value) || 0 })}
                className="w-24 bg-surface-container-highest border-none rounded-xl px-4 py-3 text-center font-black text-xl text-primary focus:ring-2 focus:ring-primary/50 shadow-inner"
              />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest w-12">Hours</span>
            </div>
          </div>
        ))}
        
        {subjects.length === 0 && (
          <div className="p-10 text-center italic text-on-surface-variant">No subjects added yet. Add subjects to plan your week.</div>
        )}

        <button 
          onClick={generatePlan}
          className="w-full py-5 bg-primary text-on-primary rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-8"
        >
          <Sparkles className="w-6 h-6" />
          Generate Weekly Study Plan
        </button>
      </div>
    </motion.div>
  );
};
