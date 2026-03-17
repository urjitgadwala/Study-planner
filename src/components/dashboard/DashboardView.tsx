import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Settings, 
  Timer, 
  CalendarClock, 
  CheckCircle,
  TrendingUp,
  Star,
  Users,
  Flame,
  Medal,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GamificationHeader } from './DashboardComponents';
import { SmartSuggestions } from './SmartSuggestions';
import { StudyChart } from './StudyChart';
import { CalendarEvent, Task, View } from '../../types';

interface DashboardViewProps {
  levelInfo: any;
  xp: number;
  habits: any[];
  events: CalendarEvent[];
  subjects: any[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: () => void;
  onViewCalendar: () => void;
  onOpenMaterial: () => void;
  onOpenAddSubject: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  levelInfo,
  xp,
  habits,
  events,
  subjects,
  tasks,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onOpenAddSubject,
  onOpenMaterial,
  onViewCalendar,
}) => {
  const [timerTime, setTimerTime] = React.useState(1500);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);

  React.useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerTime > 0) {
      interval = setInterval(() => setTimerTime(t => t - 1), 1000);
    } else if (timerTime === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-10 space-y-10 max-w-[1600px]"
    >
      <GamificationHeader levelInfo={levelInfo} xp={xp} habits={habits} />

      <section className="grid grid-cols-12 gap-6">
        <GlassCard hover={false} className="col-span-12 lg:col-span-8 p-8 flex items-center justify-between overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Systems Analysis <span className="text-primary">Exam</span></h2>
            <p className="text-on-surface-variant font-body mb-6 max-w-md">You've reached 68% of your weekly study goal. Keep pushing to clear your engineering foundations modules.</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={onOpenMaterial}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-black text-sm hover:scale-[1.05] transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Material Architect
              </button>
              <button 
                onClick={onOpenAddSubject}
                className="bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-full font-bold text-sm border border-outline-variant/20 hover:bg-surface-container transition-all"
              >
                Manual Syllabus
              </button>
            </div>
          </div>

          <div className="relative w-48 h-48 flex items-center justify-center lg:mr-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
              <motion.circle 
                initial={{ strokeDashoffset: 502 }}
                animate={{ strokeDashoffset: 160 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="96" cy="96" fill="transparent" r="80" stroke="url(#gradient)" strokeDasharray="502" strokeLinecap="round" strokeWidth="12"
              ></motion.circle>
              <defs>
                <linearGradient id="gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#22c55e' }}></stop>
                  <stop offset="100%" style={{ stopColor: '#16a34a' }}></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-headline font-extrabold text-secondary">68%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Focus Progress</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-4 p-8 flex flex-col justify-between">
          <SmartSuggestions 
            studyContext={{
              xp,
              level: levelInfo.level,
              habitsCount: habits.length,
              eventsCount: events.length,
              tasksCount: tasks.length
            }} 
          />
        </GlassCard>
      </section>

      <div className="grid grid-cols-12 gap-6">
        <GlassCard className="col-span-12 lg:col-span-4 p-6 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline text-xl font-bold text-on-surface">Today's Tasks</h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{tasks.filter(t => !t.completed).length} Pending</span>
          </div>
          <div className="space-y-4 flex-1">
            {tasks.map((task) => (
              <motion.div 
                key={task.id}
                layout
                className={`p-4 rounded-xl flex items-center gap-4 group cursor-pointer transition-all duration-300 relative ${
                  task.completed ? 'bg-surface/50 opacity-50' : task.active ? 'bg-surface-container border-l-4 border-primary shadow-sm' : 'bg-surface hover:bg-surface-container-highest'
                }`}
              >
                <div 
                  onClick={() => onToggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed ? 'bg-secondary/20 border-secondary' : task.active ? 'border-primary bg-primary/20' : 'border-outline-variant group-hover:border-primary'
                  }`}
                >
                  {task.completed ? <Check className="w-3 h-3 text-secondary" /> : task.active ? <Play className="w-3 h-3 text-primary fill-primary" /> : null}
                </div>
                <div className="flex-1" onClick={() => onToggleTask(task.id)}>
                  <p className={`text-sm font-semibold text-on-surface ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                  <p className="text-[10px] text-on-surface-variant">{task.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold ${task.completed ? 'text-on-surface-variant' : task.active ? 'text-primary' : 'text-tertiary'}`}>
                    {task.time}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <button 
            onClick={onAddTask}
            className="mt-8 w-full py-3 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant text-xs font-bold hover:border-primary hover:text-primary transition-all"
          >
            + Add Task
          </button>
        </GlassCard>

        <div className="col-span-12 lg:col-span-5 space-y-6">
          <GlassCard className="p-8 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">Pomodoro Timer</h3>
                <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Deep Focus Mode</p>
              </div>
              <button className="p-2 bg-surface rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            <div className="my-6 flex items-center justify-center gap-12 relative z-10">
              <div className="text-center">
                <p className="text-6xl font-headline font-extrabold text-primary tracking-tighter">{formatTime(timerTime)}</p>
                <p className="text-[10px] font-bold text-secondary mt-1">Focus Session #3</p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
                >
                  {isTimerRunning ? <Pause className="w-5 h-5 text-white fill-white" /> : <Play className="w-5 h-5 text-white fill-white ml-1" />}
                </button>
                <button 
                  onClick={() => { setTimerTime(1500); setIsTimerRunning(false); }}
                  className="w-12 h-12 bg-surface-container-highest rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <RotateCcw className="w-5 h-5 text-on-surface-variant" />
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20 mt-2">
                  <Flame className="w-3 h-3 animate-pulse" />
                  <span className="text-[10px] font-black uppercase">5 Day Streak</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-container-highest">
              <motion.div 
                className="h-full bg-primary" 
                initial={{ width: "0%" }}
                animate={{ width: `${(1500 - timerTime) / 1500 * 100}%` }}
              ></motion.div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-lg font-bold text-on-surface">Productivity Summary</h3>
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Last 7 Days</div>
            </div>
            <div className="mt-4">
              <StudyChart 
                data={[45, 62, 38, 85, 54, 72, (xp % 100)]} 
                labels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']} 
              />
            </div>
          </GlassCard>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-6">
          <GlassCard className="p-6 border-tertiary/20">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-tertiary" />
              Upcoming
              <button 
                onClick={onViewCalendar}
                className="ml-auto text-primary text-[10px] font-bold hover:underline"
              >
                Calendar
              </button>
            </h3>
            <div className="space-y-4">
              {events.slice(0, 3).length > 0 ? events.slice(0, 3).map((event, i) => (
                <div key={event.id} className="flex gap-4">
                  <div className={`w-1 ${i === 0 ? 'bg-tertiary' : 'bg-primary'} rounded-full`}></div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{event.title}</p>
                    <p className={`text-[10px] ${i === 0 ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                      {new Date(event.start).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-4 text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">No upcoming events</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex-1 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
                <Medal className="w-5 h-5 text-primary" />
                Elite Architects
              </h3>
              <div className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Global</div>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Alex Rivera', xp: '12,450', role: 'Architect', avatar: 'AR' },
                { name: 'Sarah Chen', xp: '10,200', role: 'Senior', avatar: 'SC' },
                { name: 'You', xp: `${xp.toLocaleString()}`, role: 'Junior', avatar: 'YU', current: true },
                { name: 'Marcus Day', xp: '8,900', role: 'Junior', avatar: 'MD' },
              ].map((user, i) => (
                <div key={i} className={`flex items-center gap-3 p-2 rounded-2xl transition-all ${user.current ? 'bg-primary/20 ring-1 ring-primary/50' : 'hover:bg-white/5'}`}>
                  <div className="text-[10px] font-black text-on-surface-variant w-4">{i + 1}</div>
                  <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center text-[10px] font-bold border border-outline-variant/10">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[11px] font-bold ${user.current ? 'text-primary' : 'text-on-surface'}`}>{user.name}</p>
                    <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-widest">{user.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-on-surface">{user.xp}</p>
                    <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-tighter">XP</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-white/5 text-on-surface-variant rounded-xl font-bold text-[10px] hover:bg-white/10 transition-all border border-outline-variant/10">
              View Global Ranking
            </button>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};
