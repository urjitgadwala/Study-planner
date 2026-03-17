import React from 'react';
import { motion } from 'motion/react';
import { Target, CalendarClock, TrendingUp } from 'lucide-react';
import { ConsistencyHeatmap } from '../dashboard/DashboardComponents';
import { Subject, Task, Habit, CalendarEvent } from '../../types';

interface AnalyticsDashboardProps {
  subjects: Subject[];
  tasks: Task[];
  habits: Habit[];
  events: CalendarEvent[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ subjects, tasks, habits, events }) => {
  const totalTopics = subjects.reduce((acc, s) => acc + s.sections.reduce((a, sec) => a + sec.topics.length, 0), 0);
  const completedTopics = subjects.reduce((acc, s) => acc + s.sections.reduce((a, sec) => a + sec.topics.filter(t => t.completed).length, 0), 0);
  
  const taskCompletion = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) || 0;
  
  const subjectStats = subjects.map(s => {
    const total = s.sections.reduce((acc, sec) => acc + sec.topics.length, 0);
    const completed = s.sections.reduce((acc, sec) => acc + sec.topics.filter(t => t.completed).length, 0);
    return {
      title: s.title,
      progress: Math.round((completed / total) * 100) || 0,
      color: s.color,
      completed,
      total
    };
  });

  const weeklyStudyTime = [
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 6.2 },
    { day: 'Wed', hours: 3.8 },
    { day: 'Thu', hours: 5.5 },
    { day: 'Fri', hours: 7.0 },
    { day: 'Sat', hours: 2.5 },
    { day: 'Sun', hours: 1.5 },
  ];

  const maxHours = Math.max(...weeklyStudyTime.map(d => d.hours)) || 1;

  return (
    <motion.div 
      key="analytics"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-10 space-y-10 max-w-[1600px]"
    >
      <div className="mb-10">
        <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-2 text-on-surface">Performance Analytics</h2>
        <p className="font-body text-on-surface-variant">Visual breakdown of your academic and habit progress.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low/50 backdrop-blur-md rounded-3xl p-8 border border-outline-variant/10">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-8 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Subject Mastery
          </h3>
          <div className="space-y-8">
            {subjectStats.map(stat => (
              <div key={stat.title}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-sm font-bold text-on-surface">{stat.title}</span>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{stat.completed} / {stat.total} Topics</p>
                  </div>
                  <span className="text-lg font-headline font-black" style={{ color: stat.color }}>{stat.progress}%</span>
                </div>
                <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden p-[1px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.color}40` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low/50 backdrop-blur-md rounded-3xl p-8 border border-outline-variant/10 flex flex-col items-center text-center">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-6">Task Efficiency</h3>
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-highest" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                <motion.circle 
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * taskCompletion) / 100 }}
                  cx="80" cy="80" fill="transparent" r="70" stroke="url(#taskGradient)" strokeDasharray="440" strokeLinecap="round" strokeWidth="12"
                ></motion.circle>
                <defs>
                  <linearGradient id="taskGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#3b82f6' }}></stop>
                    <stop offset="100%" style={{ stopColor: '#60a5fa' }}></stop>
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-3xl font-headline font-black text-on-surface">{taskCompletion}%</span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">You've completed {tasks.filter(t => t.completed).length} out of {tasks.length} tasks today.</p>
          </div>

          <div className="bg-surface-container-low/50 backdrop-blur-md rounded-3xl p-8 border border-outline-variant/10 flex flex-col items-center text-center">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-6">Syllabus Coverage</h3>
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-highest" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                <motion.circle 
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * (completedTopics / (totalTopics || 1) * 100)) / 100 }}
                  cx="80" cy="80" fill="transparent" r="70" stroke="url(#syllabusGradient)" strokeDasharray="440" strokeLinecap="round" strokeWidth="12"
                ></motion.circle>
                <defs>
                  <linearGradient id="syllabusGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#4edea3' }}></stop>
                    <stop offset="100%" style={{ stopColor: '#00a572' }}></stop>
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-3xl font-headline font-black text-on-surface">{totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0}%</span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">{completedTopics} topics mastered across all subjects.</p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-12 bg-surface-container-low/50 backdrop-blur-md rounded-3xl p-8 border border-outline-variant/10">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-8 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-secondary" />
            Weekly Study Analytics
          </h3>
          <div className="flex items-end justify-between h-48 gap-4 px-4">
            {weeklyStudyTime.map(data => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="relative w-full flex justify-center items-end h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.hours / maxHours) * 100}%` }}
                    className="w-full max-w-[40px] bg-secondary/20 rounded-t-xl group-hover:bg-secondary/40 transition-colors relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-3 py-1 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                      {data.hours} hrs
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12">
          <ConsistencyHeatmap habits={habits} events={events} />
        </div>
      </div>
    </motion.div>
  );
};
