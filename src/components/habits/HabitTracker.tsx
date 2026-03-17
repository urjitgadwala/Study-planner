import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Plus, 
  Target, 
  Award, 
  Brain,
  Check,
  Code,
  GraduationCap,
  Star,
  Trash2,
  Flame,
  Trophy,
  Calendar
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Habit } from '../../types';
import { EmptyState } from '../common/EmptyState';

const categoryIcons: any = {
  coding: Code,
  math: GraduationCap,
  theory: Brain,
  general: Star
};

const HabitCard = ({ habit, onToggle, onDelete }: any) => {
  const Icon = categoryIcons[habit.category] || Star;
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completedDays?.includes(today);

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
        isCompleted 
          ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10' 
          : 'bg-surface-container/40 border-outline-variant/10 hover:border-primary/50'
      }`}
    >
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(habit.id);
          }}
          className="p-1.5 bg-surface-container-high hover:bg-tertiary/10 text-on-surface-variant hover:text-tertiary rounded-lg shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div onClick={onToggle}>
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className={`p-2 rounded-xl ${isCompleted ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant group-hover:text-primary'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            isCompleted ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary'
          }`}>
            {isCompleted && <Check className="w-4 h-4 text-on-primary" />}
          </div>
        </div>
        <h4 className={`font-bold text-sm mb-1 relative z-10 ${isCompleted ? 'text-primary' : 'text-on-surface'}`}>{habit.title}</h4>
        <p className="text-xs text-on-surface-variant line-clamp-1 relative z-10">{habit.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{habit.frequency}</span>
        <div className="flex items-center gap-1">
          <Zap className={`w-3 h-3 ${isCompleted ? 'text-primary' : 'text-on-surface-variant'}`} />
          <span className={`text-[10px] font-bold ${isCompleted ? 'text-primary' : 'text-on-surface-variant'}`}>+{habit.xp} XP</span>
        </div>
      </div>
    </motion.div>
  );
};

const HabitStats = ({ habits }: { habits: Habit[] }) => {
  const totalXP = habits.reduce((acc, h) => acc + h.xp, 0);
  const activeHabits = habits.length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Total XP Potential</p>
        <p className="text-2xl font-headline font-black text-on-surface">{totalXP}</p>
      </div>
      <div className="p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10">
        <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-1">Active Routines</p>
        <p className="text-2xl font-headline font-black text-on-surface">{activeHabits}</p>
      </div>
      <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Daily Streak</p>
        <p className="text-2xl font-headline font-black text-on-surface">5 Days</p>
      </div>
    </div>
  );
};

const ChallengeCard = ({ challenge }: any) => {
  const progress = (challenge.current / challenge.target) * 100;
  return (
    <div className="p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold text-on-surface">{challenge.title}</h4>
          <p className="text-[10px] text-on-surface-variant">{challenge.description}</p>
        </div>
        <span className="text-[10px] font-bold text-tertiary">+{challenge.rewardXp} XP</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-on-surface-variant">{challenge.current} / {challenge.target}</span>
          <span className="text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-accent-purple" 
          />
        </div>
      </div>
    </div>
  );
};

const BadgeCard = ({ badge }: any) => (
  <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
    badge.unlocked 
      ? 'bg-secondary/10 border-secondary/20' 
      : 'bg-surface-container-highest/30 border-outline-variant/10 grayscale opacity-50'
  }`}>
    <span className="text-3xl mb-2">{badge.icon}</span>
    <h4 className="text-[10px] font-bold text-on-surface leading-tight mb-1">{badge.title}</h4>
    {badge.unlocked && (
      <span className="text-[8px] font-bold text-secondary uppercase tracking-tighter">Unlocked</span>
    )}
  </div>
);

export const HabitTracker = ({ 
  habits, 
  onToggleHabit, 
  onDeleteHabit, 
  badges, 
  challenges, 
  consistencyScore = 100, 
  onAddHabit, 
  onOpenAchievements 
}: any) => {
  return (
    <motion.div 
      key="habits"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-10 space-y-10 max-w-[1600px]"
    >
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-2 text-on-surface">Habit Forge</h2>
          <p className="font-body text-on-surface-variant">Level up your engineering skills through daily consistency.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-surface-container/50 backdrop-blur-md rounded-xl flex items-center gap-2 border border-outline-variant/15">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-sm font-bold text-on-surface">Consistency Score: {consistencyScore}%</span>
          </div>
          <button 
            onClick={onAddHabit}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary rounded-xl text-on-primary text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <HabitStats habits={habits} />

          {habits.length === 0 ? (
            <EmptyState 
              icon={Zap}
              title="No Habits Yet"
              description="Build consistent studying routines. Add your first habit like 'Morning LeetCode' or 'Evening Systems Review'."
              actionLabel="Add Habit"
              onAction={onAddHabit}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {habits.map((habit: Habit) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onToggle={() => onToggleHabit(habit.id)}
                  onDelete={() => onDeleteHabit(habit.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <GlassCard className="p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-tertiary" />
              Active Challenges
            </h3>
            <div className="space-y-4">
              {challenges.map((challenge: any) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary" />
                Achievements
              </h3>
              <button 
                onClick={onOpenAchievements}
                className="text-primary text-xs font-bold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {badges.slice(0, 4).map((badge: any) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </GlassCard>

          <div className="bg-gradient-to-br from-primary/20 to-accent-purple/20 rounded-3xl p-6 border border-primary/30 shadow-lg shadow-primary/10">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Smart Suggestion
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 font-medium">Based on your current curriculum:</p>
            <div className="p-4 bg-surface/50 backdrop-blur-sm rounded-2xl border border-white/5">
              <h4 className="text-sm font-bold text-on-surface mb-1">Solve 1 DSA problem daily</h4>
              <p className="text-[10px] text-on-surface-variant mb-3">Focus on Linked Lists this week.</p>
              <button 
                onClick={onAddHabit}
                className="w-full py-2 bg-primary text-on-primary rounded-lg text-[10px] font-bold hover:bg-primary-container transition-all"
              >
                Add to Habits (+30 XP)
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
