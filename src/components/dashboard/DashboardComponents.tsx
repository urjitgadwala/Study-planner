import React from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Trophy, 
  Smile, 
  Meh, 
  Frown, 
  TrendingUp 
} from 'lucide-react';
import { CalendarEvent } from '../../types';

export const Mascot = ({ progress }: { progress: number }) => {
  let MoodIcon = Meh;
  let moodColor = "text-on-surface-variant";
  let moodText = "Neutral";

  if (progress >= 80) {
    MoodIcon = Smile;
    moodColor = "text-primary";
    moodText = "Happy!";
  } else if (progress <= 20) {
    MoodIcon = Frown;
    moodColor = "text-tertiary";
    moodText = "Sleepy";
  }

  return (
    <div className="relative group">
      <motion.div 
        animate={{ 
          y: [0, -5, 0],
          scale: progress >= 80 ? [1, 1.1, 1] : 1
        }}
        transition={{ repeat: Infinity, duration: 3 }}
        className={`w-20 h-20 rounded-2xl bg-surface-container-highest flex items-center justify-center border-2 border-outline-variant/20 shadow-inner`}
      >
        <MoodIcon className={`w-10 h-10 ${moodColor} transition-colors duration-500`} />
      </motion.div>
      <div className="absolute -bottom-2 -right-2 bg-surface px-2 py-0.5 rounded-full border border-outline-variant/20 shadow-sm">
        <span className="text-[8px] font-bold uppercase tracking-tighter text-on-surface-variant">{moodText}</span>
      </div>
    </div>
  );
};

export const GamificationHeader = ({ levelInfo, xp, habits }: any) => {
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter((h: any) => h.completedDays.includes(today)).length;
  const totalHabits = habits.length;
  const progressToday = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  return (
    <div className="bg-surface-container-low/50 backdrop-blur-md rounded-3xl p-6 border border-outline-variant/15 flex flex-col md:flex-row items-center gap-8 shadow-xl">
      <div className="flex items-center gap-6">
        <Mascot progress={progressToday} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-headline text-2xl font-bold text-on-surface">{levelInfo.title}</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/30">Level {levelInfo.level}</span>
          </div>
          <p className="text-sm text-on-surface-variant">Keep completing habits to reach Level {levelInfo.level + 1}</p>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">XP Progress</span>
          <span className="text-sm font-bold text-primary">{xp % 1000} / 1000 XP</span>
        </div>
        <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden p-[2px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progress}%` }}
            className="h-full bg-gradient-to-r from-primary to-accent-purple rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col items-center p-3 bg-surface-container rounded-2xl border border-outline-variant/10 min-w-[80px] shadow-sm">
          <Flame className={`w-5 h-5 mb-1 ${completedToday > 0 ? 'text-tertiary animate-pulse' : 'text-outline-variant'}`} />
          <span className="text-lg font-bold text-on-surface">{completedToday}</span>
          <span className="text-[10px] font-bold text-outline-variant uppercase tracking-tighter">Streak</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-surface-container rounded-2xl border border-outline-variant/10 min-w-[80px] shadow-sm">
          <Trophy className="w-5 h-5 mb-1 text-secondary" />
          <span className="text-lg font-bold text-on-surface">12</span>
          <span className="text-[10px] font-bold text-outline-variant uppercase tracking-tighter">Badges</span>
        </div>
      </div>
    </div>
  );
};

export const ConsistencyHeatmap = ({ habits, events }: { habits: any[], events: CalendarEvent[] }) => {
  const today = new Date();
  const weeks = 20;
  const days = weeks * 7;
  
  const heatmapData = Array.from({ length: days }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const habitCompletions = habits.reduce((acc, h) => {
      return acc + (h.completedDays.includes(dateStr) ? 1 : 0);
    }, 0);

    const studyCompletions = events.filter(e => e.date === dateStr && e.type === 'Study Session' && e.completed).length;
    
    return { date: dateStr, count: habitCompletions + studyCompletions };
  });

  const getColor = (count: number) => {
    if (count === 0) return 'bg-surface-container-highest/30';
    if (count <= 2) return 'bg-primary/20';
    if (count <= 4) return 'bg-primary/50';
    if (count <= 6) return 'bg-primary/80';
    return 'bg-primary';
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-surface-container-low/50 backdrop-blur-md rounded-3xl p-8 border border-outline-variant/10">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Study Consistency
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-surface-container-highest/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/80" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
        <div className="grid grid-rows-7 gap-1.5 pt-6 text-[8px] font-bold text-outline uppercase tracking-tighter pr-2">
          {dayNames.map((day, i) => (
            <div key={day} className="h-3 flex items-center">{i % 2 === 1 ? day : ''}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1.5">
          {heatmapData.map((day, j) => (
            <motion.div
              key={day.date}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: j * 0.002 }}
              className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors duration-500`}
              title={`${day.date}: ${day.count} activities completed`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
