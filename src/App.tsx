/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Book, 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Repeat, 
  BarChart3, 
  Search, 
  Bell, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Check, 
  Plus, 
  CalendarClock, 
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  Trophy,
  Zap,
  Target,
  Award,
  Trash2,
  LogIn,
  LogOut,
  TrendingUp,
  Brain,
  Code,
  GraduationCap,
  Smile,
  Meh,
  Frown,
  Star,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Save,
  Sparkles,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc, 
  updateDoc,
  getDocFromServer,
  writeBatch,
  handleFirestoreError,
  OperationType,
  User
} from './firebase';

// --- Types ---
type View = 'dashboard' | 'tasks' | 'calendar' | 'habits' | 'subjects' | 'analytics' | 'weekly';

interface Topic {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

interface Section {
  id: string;
  title: string;
  topics: Topic[];
}

interface Subject {
  id: string;
  title: string;
  sections: Section[];
  estimatedTimeRemaining: number; // in hours
  color: string;
}

interface Habit {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  completedDays: string[]; // ISO dates
  xp: number;
  category: 'coding' | 'math' | 'theory' | 'general';
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardXp: number;
  expiresAt: string;
}

type EventType = 'Exam' | 'Assignment' | 'Project' | 'Reminder' | 'Lab' | 'Presentation' | 'Study Session' | 'Habit Goal';

interface CalendarEvent {
  id: string;
  title: string;
  subject: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description?: string;
  reminders: string[]; // ['1h', '1d', '3d', '1w']
  isRecurring?: boolean;
  recurrence?: 'daily' | 'weekly';
  topic?: string;
  duration?: string;
  completed?: boolean;
}

interface Task {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  completed: boolean;
  active?: boolean;
}

interface Note {
  id: string;
  title: string;
  time: string;
  color: string;
}

interface Deadline {
  id: string;
  title: string;
  timeLeft: string;
  color: string;
}

// --- Components ---

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        errorMessage = `Firestore Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}`;
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-red-500/20 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
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

    return this.props.children;
  }
}

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 font-medium border-l-2 transition-all group ${
      active 
        ? 'text-on-surface border-primary bg-primary/5' 
        : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-white/5'
    }`}
  >
    <Icon className={`w-5 h-5 group-hover:text-primary transition-colors ${active ? 'text-primary' : ''}`} />
    <span className="text-sm font-body">{label}</span>
  </button>
);

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen bg-surface flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(78,222,163,0.05),transparent_50%)]">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full bg-surface-container-low p-10 rounded-[2.5rem] border border-outline-variant/10 shadow-2xl text-center space-y-8"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
        <Book className="w-10 h-10 text-on-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-headline font-black text-on-surface tracking-tighter">Study Planner</h1>
        <p className="text-on-surface-variant font-medium">Your engineering roadmap starts here.</p>
      </div>
      <div className="py-4 space-y-4">
        <div className="flex items-center gap-4 text-left p-4 bg-surface rounded-2xl border border-outline-variant/5">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Track Mastery</p>
            <p className="text-[10px] text-on-surface-variant">Visualize your syllabus progress</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-left p-4 bg-surface rounded-2xl border border-outline-variant/5">
          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Gamified Habits</p>
            <p className="text-[10px] text-on-surface-variant">Earn XP and level up your consistency</p>
          </div>
        </div>
      </div>
      <button 
        onClick={onLogin}
        className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
      >
        <LogIn className="w-5 h-5" />
        Sign in with Google
      </button>
      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Secure Academic Portal</p>
    </motion.div>
  </div>
);

const LoadingScreen = () => (
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [timerTime, setTimerTime] = useState(1499); // 24:59 in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [badges, setBadges] = useState<Badge[]>([
    { id: 'b1', title: '7 Day Study Streak', description: 'Complete habits for 7 consecutive days', icon: '🔥', unlocked: true, unlockedAt: '2024-03-10' },
    { id: 'b2', title: '50 Coding Problems', description: 'Solve 50 programming problems', icon: '💻', unlocked: false },
    { id: 'b3', title: '30 Days Consistent', description: 'Maintain consistency for a full month', icon: '📚', unlocked: false },
    { id: 'b4', title: 'Productivity Champion', description: 'Complete all daily habits for 5 days', icon: '⚡', unlocked: true, unlockedAt: '2024-03-12' },
    { id: 'b5', title: 'Data Structures Master', description: 'Complete 100% of Data Structures syllabus', icon: '🌳', unlocked: false },
    { id: 'b6', title: 'C Programming Pro', description: 'Master all C programming topics', icon: '⚙️', unlocked: false },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: 'c1', title: '7 Day Coding Challenge', description: 'Code every day for a week', target: 7, current: 3, rewardXp: 200, expiresAt: '2024-03-20' },
    { id: 'c2', title: 'Study 10 Hours', description: 'Log 10 hours of focused study', target: 10, current: 4.5, rewardXp: 150, expiresAt: '2024-03-20' },
  ]);

  // --- Auth Logic ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --- Data Sync ---
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setSubjects([]);
      setTasks([]);
      setHabits([]);
      setXp(0);
      return;
    }

    const unsubEvents = onSnapshot(collection(db, `users/${user.uid}/events`), 
      (snapshot) => setEvents(snapshot.docs.map(doc => doc.data() as CalendarEvent)),
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/events`)
    );

    const unsubSubjects = onSnapshot(collection(db, `users/${user.uid}/subjects`), 
      (snapshot) => setSubjects(snapshot.docs.map(doc => doc.data() as Subject)),
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/subjects`)
    );

    const unsubTasks = onSnapshot(collection(db, `users/${user.uid}/tasks`), 
      (snapshot) => setTasks(snapshot.docs.map(doc => doc.data() as Task)),
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/tasks`)
    );

    const unsubHabits = onSnapshot(collection(db, `users/${user.uid}/habits`), 
      (snapshot) => setHabits(snapshot.docs.map(doc => doc.data() as Habit)),
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/habits`)
    );

    const unsubStats = onSnapshot(doc(db, `users/${user.uid}/data/stats`), 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setXp(data.xp || 0);
          setLevel(data.level || 1);
        } else {
          // Initialize stats
          setDoc(doc(db, `users/${user.uid}/data/stats`), { xp: 0, level: 1 })
            .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/data/stats`));
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}/data/stats`)
    );

    const unsubBadges = onSnapshot(collection(db, `users/${user.uid}/badges`), 
      (snapshot) => {
        if (snapshot.empty) {
          // Initialize default badges if none exist
          const defaultBadges: Badge[] = [
            { id: 'b1', title: '7 Day Study Streak', description: 'Complete habits for 7 consecutive days', icon: '🔥', unlocked: false },
            { id: 'b2', title: '50 Coding Problems', description: 'Solve 50 programming problems', icon: '💻', unlocked: false },
            { id: 'b3', title: '30 Days Consistent', description: 'Maintain consistency for a full month', icon: '📚', unlocked: false },
            { id: 'b4', title: 'Productivity Champion', description: 'Complete all daily habits for 5 days', icon: '⚡', unlocked: false },
            { id: 'b5', title: 'Data Structures Master', description: 'Complete 100% of Data Structures syllabus', icon: '🌳', unlocked: false },
            { id: 'b6', title: 'C Programming Pro', description: 'Master all C programming topics', icon: '⚙️', unlocked: false },
          ];
          defaultBadges.forEach(b => {
            setDoc(doc(db, `users/${user.uid}/badges`, b.id), b)
              .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/badges/${b.id}`));
          });
        } else {
          setBadges(snapshot.docs.map(doc => doc.data() as Badge));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/badges`)
    );

    const unsubChallenges = onSnapshot(collection(db, `users/${user.uid}/challenges`), 
      (snapshot) => {
        if (snapshot.empty) {
          const defaultChallenges: Challenge[] = [
            { id: 'c1', title: '7 Day Coding Challenge', description: 'Code every day for a week', target: 7, current: 0, rewardXp: 200, expiresAt: '2024-03-20' },
            { id: 'c2', title: 'Study 10 Hours', description: 'Log 10 hours of focused study', target: 10, current: 0, rewardXp: 150, expiresAt: '2024-03-20' },
          ];
          defaultChallenges.forEach(c => {
            setDoc(doc(db, `users/${user.uid}/challenges`, c.id), c)
              .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/challenges/${c.id}`));
          });
        } else {
          setChallenges(snapshot.docs.map(doc => doc.data() as Challenge));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/challenges`)
    );

    return () => {
      unsubEvents();
      unsubSubjects();
      unsubTasks();
      unsubHabits();
      unsubStats();
      unsubBadges();
      unsubChallenges();
    };
  }, [user]);

  const updateXp = async (newXp: number) => {
    if (!user) return;
    const oldLevel = getLevelInfo(xp).level;
    const newLevel = getLevelInfo(newXp).level;
    
    try {
      await updateDoc(doc(db, `users/${user.uid}/data/stats`), { 
        xp: newXp,
        level: newLevel
      });
      
      if (newLevel > oldLevel) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/data/stats`);
    }
  };

  const getLevelInfo = (xp: number) => {
    const level = Math.floor(xp / 1000) + 1;
    const progress = (xp % 1000) / 10;
    let title = "Beginner Engineer";
    if (level >= 20) title = "Engineering Master";
    else if (level >= 10) title = "Problem Solver";
    else if (level >= 5) title = "Coding Apprentice";
    
    return { level, progress, title };
  };

  const levelInfo = getLevelInfo(xp);

  // Notification System
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      events.forEach(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        event.reminders.forEach(reminder => {
          let reminderTime: Date;
          if (reminder === '1h') reminderTime = new Date(eventDate.getTime() - 60 * 60 * 1000);
          else if (reminder === '1d') reminderTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
          else if (reminder === '3d') reminderTime = new Date(eventDate.getTime() - 3 * 24 * 60 * 60 * 1000);
          else if (reminder === '1w') reminderTime = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          else return;

          // If reminder time is within the last minute and hasn't been shown
          const diff = now.getTime() - reminderTime.getTime();
          if (diff > 0 && diff < 60000) {
            setMotivationMessage(`🔔 Reminder: ${event.title} is in ${reminder === '1h' ? '1 hour' : reminder === '1d' ? '1 day' : reminder === '3d' ? '3 days' : '1 week'}!`);
            setTimeout(() => setMotivationMessage(null), 5000);
          }
        });
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events]);

  const consistencyScore = Math.round((habits.reduce((acc, h) => acc + h.completedDays.length, 0) / (habits.length * 7 || 1)) * 100);

  const [showLevelUp, setShowLevelUp] = useState(false);

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDays.includes(today);
    const newCompletedDays = isCompleted 
      ? habit.completedDays.filter(d => d !== today)
      : [...habit.completedDays, today];
    
    try {
      await updateDoc(doc(db, `users/${user.uid}/habits`, habitId), {
        completedDays: newCompletedDays
      });

      if (isCompleted) {
        updateXp(Math.max(0, xp - habit.xp));
      } else {
        const otherHabitsCompleted = habits.filter(h => h.id !== habitId).every(h => h.completedDays.includes(today));
        const bonusXp = otherHabitsCompleted ? 50 : 0;
        updateXp(xp + habit.xp + bonusXp);
        await updateChallengeProgress('habit');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  const addHabit = async (newHabit: Omit<Habit, 'id' | 'completedDays' | 'xp'>) => {
    if (!user) return;
    const id = `h${Date.now()}`;
    const habit: Habit = {
      ...newHabit,
      id,
      completedDays: [],
      xp: 15,
    };
    try {
      await setDoc(doc(db, `users/${user.uid}/habits`, id), habit);
      setIsAddHabitOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/habits/${id}`);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime((prev) => prev - 1);
      }, 1000);
    } else if (timerTime === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateChallengeProgress = async (type: string, amount: number = 1) => {
    if (!user || challenges.length === 0) return;

    const relevantChallenges = challenges.filter(c => c.type === type && !c.completed);
    
    for (const challenge of relevantChallenges) {
      const newCurrent = Math.min(challenge.current + amount, challenge.target);
      const isNowCompleted = newCurrent >= challenge.target;
      
      try {
        await updateDoc(doc(db, `users/${user.uid}/challenges`, challenge.id), {
          current: newCurrent,
          completed: isNowCompleted
        });
        
        if (isNowCompleted) {
          await updateXp(challenge.xpReward);
          setMotivationMessage(`🏆 Challenge Completed: ${challenge.title}! +${challenge.xpReward} XP`);
          setTimeout(() => setMotivationMessage(null), 4000);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/challenges/${challenge.id}`);
      }
    }
  };

  const toggleTask = async (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const newCompleted = !task.completed;
      await updateDoc(doc(db, `users/${user.uid}/tasks`, id), { completed: newCompleted });
      if (newCompleted) {
        await updateXp(20);
        await updateChallengeProgress('task');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/tasks/${id}`);
    }
  };

  const addTask = async (title: string, subtitle: string, time: string) => {
    if (!user) return;
    const id = `t${Date.now()}`;
    const newTask: Task = { id, title, subtitle, time, completed: false };
    try {
      await setDoc(doc(db, `users/${user.uid}/tasks`, id), newTask);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/tasks`, id));
      setMotivationMessage("🗑️ Task deleted.");
      setTimeout(() => setMotivationMessage(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/tasks/${id}`);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/events`, id));
      setMotivationMessage("🗑️ Event removed from calendar.");
      setTimeout(() => setMotivationMessage(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/events/${id}`);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/habits`, id));
      setMotivationMessage("🗑️ Habit deleted.");
      setTimeout(() => setMotivationMessage(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/habits/${id}`);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/subjects`, id));
      setMotivationMessage("🗑️ Subject and all its progress deleted.");
      setTimeout(() => setMotivationMessage(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/subjects/${id}`);
    }
  };

  if (!isAuthReady) return <LoadingScreen />;
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-surface selection:bg-primary/30 text-on-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant/15 flex flex-col fixed h-full z-50">
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Book className="w-6 h-6 text-on-primary" />
            </div>
            <div>
              <h1 className="font-headline font-extrabold text-lg text-on-surface leading-tight">Study Planner</h1>
              <p className="font-label text-xs text-on-surface-variant font-medium">Engineering Portal</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={currentView === 'dashboard'} 
              onClick={() => setCurrentView('dashboard')}
            />
            <SidebarItem 
              icon={ClipboardList} 
              label="Tasks" 
              active={currentView === 'tasks'} 
              onClick={() => setCurrentView('tasks')}
            />
            <SidebarItem 
              icon={Calendar} 
              label="Calendar" 
              active={currentView === 'calendar'}
              onClick={() => setCurrentView('calendar')}
            />
            <SidebarItem 
              icon={Repeat} 
              label="Habits" 
              active={currentView === 'habits'}
              onClick={() => setCurrentView('habits')}
            />
            <SidebarItem 
              icon={Book} 
              label="Subjects" 
              active={currentView === 'subjects'}
              onClick={() => setCurrentView('subjects')}
            />
            <SidebarItem 
              icon={BarChart3} 
              label="Analytics" 
              active={currentView === 'analytics'}
              onClick={() => setCurrentView('analytics')}
            />
            <SidebarItem 
              icon={Sparkles} 
              label="Weekly Planner" 
              active={currentView === 'weekly'}
              onClick={() => setCurrentView('weekly')}
            />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3">
            <img 
              src={user.photoURL || "https://picsum.photos/seed/student/100/100"} 
              alt={user.displayName || "Student"} 
              className="w-10 h-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-on-surface truncate">{user.displayName || "Student"}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-surface-container-highest rounded-xl text-on-surface-variant hover:text-red-500 transition-colors text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15 px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex-1 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search resources, tasks, or notes..." 
                className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-10">
            <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary-container rounded-full ring-2 ring-surface"></span>
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <Timer className="w-5 h-5" />
            </button>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-on-surface">{user.displayName || "Student"}</span>
              <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-primary/20">
                <img 
                  src={user.photoURL || "https://picsum.photos/seed/avatar/100/100"} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 space-y-10 max-w-[1600px]"
            >
              {/* Gamification Header */}
              <GamificationHeader levelInfo={levelInfo} xp={xp} habits={habits} />

              {/* Hero Section */}
              <section className="grid grid-cols-12 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-12 lg:col-span-8 bg-gradient-to-br from-surface-container to-surface-container-low rounded-xl p-8 flex items-center justify-between overflow-hidden relative"
                >
                  <div className="relative z-10">
                    <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Systems Analysis <span className="text-primary">Exam</span></h2>
                    <p className="text-on-surface-variant font-body mb-6 max-w-md">You've reached 68% of your weekly study goal. Keep pushing to clear your engineering foundations modules.</p>
                    <div className="flex items-center gap-4">
                      <button className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold text-sm hover:scale-[1.02] transition-transform">Resume Session</button>
                      <button className="bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-full font-bold text-sm border border-outline-variant/20">View Notes</button>
                    </div>
                  </div>

                  {/* Progress Gauge */}
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
                          <stop offset="0%" style={{ stopColor: '#4edea3' }}></stop>
                          <stop offset="100%" style={{ stopColor: '#00a572' }}></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-headline font-extrabold text-secondary">68%</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Focus Progress</span>
                    </div>
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]"></div>
                </motion.div>

                {/* Streak Widget */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="col-span-12 lg:col-span-4 glass-card rounded-xl p-8 border border-outline-variant/10 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Daily Streak</span>
                      <h3 className="font-headline text-3xl font-extrabold text-on-surface mt-1">14 Days</h3>
                    </div>
                    <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center">
                      <div className="text-tertiary">🔥</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <div key={i} className={`flex-1 h-12 rounded-lg flex flex-col items-center justify-center ${i < 3 ? 'bg-secondary/20' : i === 3 ? 'bg-surface-container-highest' : 'bg-surface-container-highest opacity-40'}`}>
                        <span className={`text-[10px] font-bold ${i < 3 ? 'text-secondary' : 'text-on-surface-variant'}`}>{day}</span>
                        {i < 3 ? <CheckCircle className="w-3 h-3 text-secondary mt-1" /> : i === 3 ? <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1"></div> : null}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Upcoming Deadlines Banner */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight">Upcoming Deadlines</h2>
                  <button onClick={() => setCurrentView('calendar')} className="text-xs font-bold text-primary hover:underline">View Calendar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {events
                    .filter(e => new Date(e.date) >= new Date())
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 3)
                    .map(event => {
                      const daysLeft = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={event.id} className="bg-surface-container-high p-5 rounded-2xl border border-outline-variant/10 relative overflow-hidden group hover:border-primary/30 transition-all">
                          <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full blur-2xl opacity-20 ${
                            event.type === 'Exam' ? 'bg-red-500' :
                            event.type === 'Assignment' ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div className="flex items-center justify-between mb-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                              event.type === 'Exam' ? 'bg-red-500/10 text-red-500' :
                              event.type === 'Assignment' ? 'bg-orange-500/10 text-orange-500' :
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              {event.type}
                            </span>
                            <div className="flex items-center gap-1 text-tertiary">
                              <Timer className="w-3 h-3" />
                              <span className="text-[10px] font-bold">{daysLeft} days left</span>
                            </div>
                          </div>
                          <h4 className="font-headline font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">{event.title}</h4>
                          <p className="text-xs text-on-surface-variant mb-4">{event.subject}</p>
                          
                          {event.type === 'Exam' && (
                            <div className="pt-4 border-t border-outline-variant/10">
                              <Countdown date={`${event.date}T${event.time}`} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Main Bento Grid */}
              <div className="grid grid-cols-12 gap-6">
                {/* Tasks List */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-6 flex flex-col min-h-[500px]"
                >
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
                          onClick={() => toggleTask(task.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.completed ? 'bg-secondary/20 border-secondary' : task.active ? 'border-primary bg-primary/20' : 'border-outline-variant group-hover:border-primary'
                          }`}
                        >
                          {task.completed ? <Check className="w-3 h-3 text-secondary" /> : task.active ? <Play className="w-3 h-3 text-primary fill-primary" /> : null}
                        </div>
                        <div className="flex-1" onClick={() => toggleTask(task.id)}>
                          <p className={`text-sm font-semibold text-on-surface ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                          <p className="text-[10px] text-on-surface-variant">{task.subtitle || task.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold ${task.completed ? 'text-on-surface-variant' : task.active ? 'text-primary' : 'text-tertiary'}`}>
                            {task.time || task.dueDate}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <button className="mt-8 w-full py-3 rounded-xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant text-xs font-bold hover:border-primary/50 hover:text-on-surface transition-all">
                    + Add Task
                  </button>
                </motion.div>

                {/* Center: Timer & Analytics */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                  {/* Pomodoro Timer */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-surface-container rounded-xl p-8 relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <h3 className="font-headline text-lg font-bold text-on-surface">Pomodoro Timer</h3>
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Deep Focus Mode</p>
                      </div>
                      <button className="p-2 bg-surface rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="my-6 flex items-center justify-center gap-12">
                      <div className="text-center">
                        <p className="text-6xl font-headline font-extrabold text-primary tracking-tighter">{formatTime(timerTime)}</p>
                        <p className="text-[10px] font-bold text-secondary mt-1">Focus Session #3</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
                        >
                          {isTimerRunning ? <Pause className="w-5 h-5 text-on-primary-container fill-on-primary-container" /> : <Play className="w-5 h-5 text-on-primary-container fill-on-primary-container" />}
                        </button>
                        <button 
                          onClick={() => { setTimerTime(1500); setIsTimerRunning(false); }}
                          className="w-12 h-12 bg-surface-container-highest rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <RotateCcw className="w-5 h-5 text-on-surface-variant" />
                        </button>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-container-highest">
                      <motion.div 
                        className="h-full bg-primary" 
                        initial={{ width: "0%" }}
                        animate={{ width: `${(1500 - timerTime) / 1500 * 100}%` }}
                      ></motion.div>
                    </div>
                  </motion.div>

                  {/* Productivity Summary */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-surface-container rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-headline text-lg font-bold text-on-surface">Productivity Summary</h3>
                      <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Last 7 Days</div>
                    </div>
                    <div className="flex items-end justify-between h-32 gap-3 px-2">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        const dateStr = date.toISOString().split('T')[0];
                        const count = events.filter(e => e.date === dateStr && e.type === 'Study Session' && e.completed).length;
                        const height = Math.min(count * 30 + 10, 100);
                        
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <div 
                              className={`w-full rounded-t-md relative flex items-end overflow-hidden transition-all duration-500 ${i === 6 ? 'bg-primary/30 ring-1 ring-primary/50 shadow-lg shadow-primary/10' : 'bg-surface-container-highest group-hover:bg-primary/20'}`} 
                              style={{ height: `${height}%` }}
                            >
                              <div className={`w-full h-1/2 ${i === 6 ? 'bg-primary' : 'bg-primary/40'}`}></div>
                            </div>
                            <span className={`text-[8px] font-bold ${i === 6 ? 'text-primary' : 'text-on-surface-variant'}`}>
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Study Activity Heatmap */}
                  <div className="mt-6">
                    <ConsistencyHeatmap habits={habits} events={events} />
                  </div>
                </div>

                {/* Right Column: Deadlines & Notes */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="col-span-12 lg:col-span-3 space-y-6"
                >
                  {/* Deadlines */}
                  <div className="bg-surface-container-low rounded-xl p-6 border border-tertiary-container/10">
                    <h3 className="font-headline text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                      <CalendarClock className="w-5 h-5 text-tertiary" />
                      Upcoming
                    </h3>
                    <div className="space-y-4">
                      {[
                        { title: 'Final Thesis Draft', time: 'In 2 days', color: 'bg-tertiary-container' },
                        { title: 'Fluid Dynamics Exam', time: 'In 5 days', color: 'bg-primary/40' },
                        { title: 'Physics Lab #8', time: 'Next Tuesday', color: 'bg-primary/40' },
                      ].map((d, i) => (
                        <div key={i} className="flex gap-4">
                          <div className={`w-1 ${d.color} rounded-full`}></div>
                          <div>
                            <p className="text-xs font-bold text-on-surface">{d.title}</p>
                            <p className={`text-[10px] ${i === 0 ? 'text-tertiary' : 'text-on-surface-variant'}`}>{d.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Notes */}
                  <div className="bg-surface-container-low rounded-xl p-6 flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-headline text-lg font-bold text-on-surface">Recent Notes</h3>
                      <button className="text-primary text-[10px] font-bold hover:underline">See All</button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { title: 'Control Systems Basics', time: 'Edited 2h ago', color: 'border-secondary' },
                        { title: 'Calculus III: Vector Fields', time: 'Edited yesterday', color: 'border-primary' },
                        { title: 'Materials Sci - Polymers', time: 'Edited 3d ago', color: 'border-outline' },
                      ].map((n, i) => (
                        <div key={i} className={`p-3 bg-surface-container-highest rounded-lg border-l-2 ${n.color} cursor-pointer hover:bg-surface-bright transition-colors`}>
                          <p className="text-[11px] font-bold text-on-surface">{n.title}</p>
                          <p className="text-[9px] text-on-surface-variant mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                    <button className="mt-6 w-full flex items-center justify-center gap-2 py-2 bg-primary/10 rounded-lg text-primary font-bold text-[10px] hover:bg-primary/20 transition-colors">
                      <Plus className="w-3 h-3" />
                      New Quick Note
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : currentView === 'tasks' ? (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 space-y-10 max-w-[1600px]"
            >
              {/* Hero Header Section */}
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-2">Engineering Roadmap</h2>
                  <p className="font-body text-on-surface-variant">Manage your high-stakes deliverables and daily sprint items.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-surface-container rounded-xl text-sm font-medium hover:bg-surface-container-high transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Subjects</span>
                  </button>
                  <button className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-br from-primary-container to-primary rounded-xl text-on-primary text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              {/* Subject Filters */}
              <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                <button className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold whitespace-nowrap">All Tasks</button>
                {['Data Structures', 'Programming', 'Fluid Mechanics', 'Electronics', 'Mathematics IV'].map((sub) => (
                  <button key={sub} className="px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold whitespace-nowrap border border-outline-variant/10 hover:border-primary/50 transition-colors">
                    {sub}
                  </button>
                ))}
              </div>

              {/* Task Board */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUMN 1: VERY IMPORTANT */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(255,179,173,0.6)]"></span>
                      <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-tertiary">Very Important</h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary">
                      {tasks.filter(t => t.priority === 'high').length.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {tasks.filter(t => t.priority === 'high').map(task => (
                      <TaskCard 
                        key={task.id}
                        tag={task.tag} 
                        title={task.title} 
                        desc={task.description} 
                        date={task.dueDate}
                        completed={task.completed}
                        onToggle={() => toggleTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                        onDragStart={setDraggedTask}
                      />
                    ))}
                    {tasks.filter(t => t.priority === 'high').length === 0 && (
                      <div className="p-8 border-2 border-dashed border-outline-variant/10 rounded-2xl text-center">
                        <p className="text-xs text-on-surface-variant">No high priority tasks</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 2: IMPORTANT */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(173,198,255,0.6)]"></span>
                      <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-primary">Important</h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {tasks.filter(t => t.priority === 'medium').length.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {tasks.filter(t => t.priority === 'medium').map(task => (
                      <TaskCard 
                        key={task.id}
                        tag={task.tag} 
                        title={task.title} 
                        desc={task.description} 
                        date={task.dueDate}
                        completed={task.completed}
                        onToggle={() => toggleTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                        onDragStart={setDraggedTask}
                      />
                    ))}
                    {tasks.filter(t => t.priority === 'medium').length === 0 && (
                      <div className="p-8 border-2 border-dashed border-outline-variant/10 rounded-2xl text-center">
                        <p className="text-xs text-on-surface-variant">No medium priority tasks</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 3: LEAST PRIORITY */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                      <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-outline">Least Priority</h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-container-highest text-outline">
                      {tasks.filter(t => t.priority === 'low').length.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {tasks.filter(t => t.priority === 'low').map(task => (
                      <TaskCard 
                        key={task.id}
                        tag={task.tag} 
                        title={task.title} 
                        desc={task.description} 
                        date={task.dueDate}
                        completed={task.completed}
                        isLowPriority
                        onToggle={() => toggleTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                        onDragStart={setDraggedTask}
                      />
                    ))}
                    <div 
                      onClick={() => setIsAddTaskOpen(true)}
                      className="border-2 border-dashed border-outline-variant/20 rounded-xl p-8 flex flex-col items-center justify-center space-y-2 group cursor-pointer hover:bg-surface-container-low transition-colors"
                    >
                      <Plus className="w-6 h-6 text-outline-variant group-hover:text-primary transition-colors" />
                      <span className="text-xs font-bold text-outline-variant group-hover:text-on-surface-variant transition-colors">Create New Task</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={CheckCircle} value="14" label="Tasks Done" color="text-primary" bgColor="bg-primary/10" />
                <StatCard icon={Bell} value="03" label="Urgent Items" color="text-tertiary" bgColor="bg-tertiary/10" />
                <StatCard icon={BarChart3} value="82%" label="Efficiency" color="text-secondary" bgColor="bg-secondary/10" />
                <StatCard icon={Timer} value="06" label="In Backlog" color="text-on-surface-variant" bgColor="bg-on-surface-variant/10" />
              </div>
            </motion.div>
          ) : currentView === 'calendar' ? (
            <CalendarView 
              events={events} 
              onAddEvent={() => setIsAddEventOpen(true)} 
              onDeleteEvent={deleteEvent}
              onDropTask={async (date) => {
                if (draggedTask && user) {
                  const id = `e${Date.now()}`;
                  const newEvent: CalendarEvent = {
                    id,
                    title: `Study: ${draggedTask.title}`,
                    subject: draggedTask.tag,
                    type: 'Study Session',
                    date: date,
                    time: '14:00',
                    reminders: ['1h'],
                    completed: false
                  };
                  try {
                    await setDoc(doc(db, `users/${user.uid}/events`, id), newEvent);
                    setMotivationMessage(`🚀 Task "${draggedTask.title}" scheduled for ${date}!`);
                    setTimeout(() => setMotivationMessage(null), 3000);
                    setDraggedTask(null);
                    await updateChallengeProgress('study');
                  } catch (err) {
                    handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/events/${id}`);
                  }
                }
              }}
            />
          ) : currentView === 'habits' ? (
            <HabitTracker 
              habits={habits} 
              toggleHabit={toggleHabit} 
              deleteHabit={deleteHabit}
              badges={badges} 
              challenges={challenges}
              levelInfo={levelInfo}
              consistencyScore={consistencyScore}
              onAddHabit={() => setIsAddHabitOpen(true)}
              onViewAllAchievements={() => setIsAchievementsOpen(true)}
              events={events}
            />
          ) : currentView === 'subjects' ? (
            <SubjectTracker 
              subjects={subjects} 
              setSubjects={setSubjects} 
              setMotivationMessage={setMotivationMessage}
              setBadges={setBadges}
              onAddSubject={() => setIsAddSubjectOpen(true)}
              onDeleteSubject={deleteSubject}
              user={user}
              updateChallengeProgress={updateChallengeProgress}
            />
          ) : currentView === 'weekly' ? (
            <WeeklyPlanner 
              subjects={subjects} 
              onPlanGenerated={async (newEvents) => {
                if (!user) return;
                try {
                  const batch = writeBatch(db);
                  newEvents.forEach(event => {
                    const id = `e${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const eventWithId = { ...event, id };
                    batch.set(doc(db, `users/${user.uid}/events`, id), eventWithId);
                  });
                  await batch.commit();
                  setCurrentView('calendar');
                  setMotivationMessage(`✨ Weekly study plan generated with ${newEvents.length} sessions!`);
                  setTimeout(() => setMotivationMessage(null), 5000);
                } catch (err) {
                  handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/events`);
                }
              }} 
            />
          ) : (
            <AnalyticsDashboard subjects={subjects} tasks={tasks} habits={habits} events={events} />
          )}
        </AnimatePresence>

        {/* Motivation Toast */}
        <AnimatePresence>
          {motivationMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className="fixed bottom-10 left-1/2 z-[100] bg-surface-container-highest border border-primary/30 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-primary fill-primary" />
              </div>
              <span className="text-sm font-bold text-on-surface">{motivationMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Event Modal */}
      <AddEventModal 
        isOpen={isAddEventOpen} 
        onClose={() => setIsAddEventOpen(false)} 
        onAdd={async (newEvent) => {
          if (!user) return;
          const id = `e${Date.now()}`;
          try {
            await setDoc(doc(db, `users/${user.uid}/events`, id), { ...newEvent, id });
            setIsAddEventOpen(false);
            setMotivationMessage(`📅 Event "${newEvent.title}" scheduled!`);
            setTimeout(() => setMotivationMessage(null), 3000);
            if (newEvent.type === 'Study Session') {
              await updateChallengeProgress('study');
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/events/${id}`);
          }
        }}
        subjects={subjects}
      />

      {/* Add Habit Modal */}
      <AddHabitModal 
        isOpen={isAddHabitOpen} 
        onClose={() => setIsAddHabitOpen(false)} 
        onAdd={addHabit} 
      />

      {/* Achievements Modal */}
      <AchievementsModal 
        isOpen={isAchievementsOpen} 
        onClose={() => setIsAchievementsOpen(false)} 
        badges={badges} 
      />

      {/* Add Subject Modal */}
      <AddSubjectModal 
        isOpen={isAddSubjectOpen} 
        onClose={() => setIsAddSubjectOpen(false)} 
        onAdd={async (newSubject) => {
          if (!user) return;
          const id = `s${Date.now()}`;
          try {
            await setDoc(doc(db, `users/${user.uid}/subjects`, id), { ...newSubject, id });
            setIsAddSubjectOpen(false);
            setMotivationMessage(`📚 New subject "${newSubject.title}" added!`);
            setTimeout(() => setMotivationMessage(null), 3000);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/subjects/${id}`);
          }
        }} 
      />

      {/* Level Up Notification */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-br from-primary to-secondary p-1 rounded-2xl shadow-2xl shadow-primary/40"
          >
            <div className="bg-surface-container-highest px-8 py-6 rounded-[14px] flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary animate-bounce" />
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold text-on-surface">Level Up!</h3>
                <p className="text-on-surface-variant">You've reached <span className="text-primary font-bold">Level {levelInfo.level}</span></p>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest">{levelInfo.title}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowLevelUp(false)}
                className="ml-4 p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const GamificationHeader = ({ levelInfo, xp, habits }: any) => {
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter((h: any) => h.completedDays.includes(today)).length;
  const totalHabits = habits.length;
  const progressToday = (completedToday / totalHabits) * 100;

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 flex flex-col md:flex-row items-center gap-8">
      <div className="flex items-center gap-6">
        <Mascot progress={progressToday} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-headline text-2xl font-bold text-on-surface">{levelInfo.title}</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Level {levelInfo.level}</span>
          </div>
          <p className="text-sm text-on-surface-variant">Keep completing habits to reach Level {levelInfo.level + 1}</p>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">XP Progress</span>
          <span className="text-sm font-bold text-primary">{xp % 1000} / 1000 XP</span>
        </div>
        <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progress}%` }}
            className="h-full bg-gradient-to-r from-primary to-secondary"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col items-center p-3 bg-surface-container rounded-xl border border-outline-variant/5 min-w-[80px]">
          <Flame className={`w-5 h-5 mb-1 ${completedToday > 0 ? 'text-tertiary animate-pulse' : 'text-outline-variant'}`} />
          <span className="text-lg font-bold text-on-surface">{completedToday}</span>
          <span className="text-[10px] font-bold text-outline uppercase">Streak</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-surface-container rounded-xl border border-outline-variant/5 min-w-[80px]">
          <Trophy className="w-5 h-5 mb-1 text-secondary" />
          <span className="text-lg font-bold text-on-surface">12</span>
          <span className="text-[10px] font-bold text-outline uppercase">Badges</span>
        </div>
      </div>
    </div>
  );
};

const Mascot = ({ progress }: { progress: number }) => {
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

interface TopicItemProps {
  topic: Topic;
  color: string;
  onToggle: () => void;
  onSaveNotes: (notes: string) => void;
}

const TopicItem: React.FC<TopicItemProps> = ({ topic, color, onToggle, onSaveNotes }) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [tempNotes, setTempNotes] = useState(topic.notes || '');

  return (
    <div className="space-y-2">
      <div 
        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
          topic.completed 
            ? 'bg-surface-container border-transparent opacity-60' 
            : 'bg-surface border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-low'
        }`}
      >
        <div className="flex items-center gap-3 flex-1" onClick={onToggle}>
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            topic.completed ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary/50'
          }`}>
            {topic.completed && <Check className="w-3 h-3 text-on-primary" />}
          </div>
          <span className={`text-sm font-medium ${topic.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
            {topic.title}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsNotesOpen(!isNotesOpen); }}
          className={`p-1.5 rounded-md transition-all ${isNotesOpen ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
        >
          <ClipboardList className="w-4 h-4" />
        </button>
      </div>
      
      <AnimatePresence>
        {isNotesOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-surface-container-highest/50 rounded-xl border border-outline-variant/10 space-y-3">
              <textarea 
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Add study notes for this topic..."
                className="w-full bg-transparent border-none text-xs text-on-surface focus:ring-0 resize-none min-h-[80px] placeholder:text-on-surface-variant/30"
              />
              <div className="flex justify-end">
                <button 
                  onClick={() => onSaveNotes(tempNotes)}
                  className="text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-80"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SubjectCardProps {
  subject: Subject;
  onToggleTopic: (sId: string, tId: string) => void;
  onSaveNotes: (sId: string, tId: string, notes: string) => void;
}

const SubjectCard: React.FC<SubjectCardProps & { onDelete: (id: string) => void }> = ({ subject, onToggleTopic, onSaveNotes, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalTopics = subject.sections.reduce((acc, sec) => acc + sec.topics.length, 0);
  const completedTopics = subject.sections.reduce((acc, sec) => acc + sec.topics.filter(t => t.completed).length, 0);
  const progress = Math.round((completedTopics / totalTopics) * 100) || 0;
  
  const milestones = [25, 50, 75, 100];
  const nextMilestone = milestones.find(m => m > progress) || 100;
  const topicsToNextMilestone = Math.ceil((nextMilestone / 100) * totalTopics) - completedTopics;

  return (
    <motion.div 
      layout
      className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden relative group"
    >
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(subject.id);
          }}
          className="p-2 bg-surface-container-high hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 rounded-xl shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div 
        className="p-6 cursor-pointer hover:bg-surface-container transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
            >
              <Book className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">{subject.title}</h3>
              <p className="text-xs text-on-surface-variant font-medium">
                {completedTopics} / {totalTopics} Topics Completed • {subject.estimatedTimeRemaining}h remaining
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-headline font-black" style={{ color: subject.color }}>{progress}%</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Mastery</p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-on-surface-variant"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </div>
        </div>

        <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full"
            style={{ backgroundColor: subject.color }}
          />
        </div>

        {progress < 100 && (
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <Zap className="w-3 h-3 text-secondary" />
            <span>
              {progress === 0 ? "Start your journey!" : 
               topicsToNextMilestone <= 0 ? "Milestone reached!" :
               `${topicsToNextMilestone} more topics to reach ${nextMilestone}% milestone`}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-outline-variant/10"
          >
            <div className="p-6 space-y-8">
              {subject.sections.map((section) => (
                <div key={section.id}>
                  <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.topics.map((topic) => (
                      <TopicItem 
                        key={topic.id}
                        topic={topic}
                        color={subject.color}
                        onToggle={() => onToggleTopic(subject.id, topic.id)}
                        onSaveNotes={(notes) => onSaveNotes(subject.id, topic.id, notes)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SubjectTracker = ({ subjects, setSubjects, setMotivationMessage, setBadges, onAddSubject, onDeleteSubject, user, updateChallengeProgress }: { subjects: Subject[], setSubjects: any, setMotivationMessage: any, setBadges: any, onAddSubject: () => void, onDeleteSubject: (id: string) => void, user: User | null, updateChallengeProgress: (type: 'task' | 'habit' | 'study') => Promise<void> }) => {
  const toggleTopic = async (subjectId: string, topicId: string) => {
    if (!user) return;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const newSections = subject.sections.map(sec => ({
      ...sec,
      topics: sec.topics.map(t => {
        if (t.id === topicId) {
          const newCompleted = !t.completed;
          if (newCompleted) {
            // Calculate progress for motivation
            const totalTopics = subject.sections.reduce((acc, curr) => acc + curr.topics.length, 0);
            const completedTopics = subject.sections.reduce((acc, curr) => acc + curr.topics.filter(tp => tp.completed).length, 0) + 1;
            const remaining = totalTopics - completedTopics;
            
            if (remaining === 0) {
              setMotivationMessage(`🎉 Congratulations! You've finished ${subject.title}!`);
              // Unlock badge if exists
              const badgeId = subject.id === 's1' ? 'b5' : subject.id === 's2' ? 'b6' : null;
              if (badgeId) {
                updateDoc(doc(db, `users/${user.uid}/badges`, badgeId), {
                  unlocked: true,
                  unlockedAt: new Date().toISOString().split('T')[0]
                }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/badges/${badgeId}`));
              }
            } else if (remaining <= 3) {
              setMotivationMessage(`🔥 Only ${remaining} topics left to finish ${subject.title}!`);
            } else if (completedTopics === Math.floor(totalTopics / 2)) {
              setMotivationMessage(`🙌 You are halfway through ${subject.title}!`);
            } else {
              setMotivationMessage(`✨ Great job! Topic "${t.title}" completed.`);
            }
            
            setTimeout(() => setMotivationMessage(null), 3000);
            updateChallengeProgress('study');
          }
          return { ...t, completed: newCompleted };
        }
        return t;
      })
    }));

    try {
      await updateDoc(doc(db, `users/${user.uid}/subjects`, subjectId), {
        sections: newSections
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/subjects/${subjectId}`);
    }
  };

  const saveNotes = async (subjectId: string, topicId: string, notes: string) => {
    if (!user) return;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const newSections = subject.sections.map(sec => ({
      ...sec,
      topics: sec.topics.map(t => t.id === topicId ? { ...t, notes } : t)
    }));

    try {
      await updateDoc(doc(db, `users/${user.uid}/subjects`, subjectId), {
        sections: newSections
      });
      setMotivationMessage("📝 Notes saved successfully!");
      setTimeout(() => setMotivationMessage(null), 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/subjects/${subjectId}`);
    }
  };

  const totalTopics = subjects.reduce((acc, s) => acc + s.sections.reduce((a, sec) => a + sec.topics.length, 0), 0);
  const completedTopics = subjects.reduce((acc, s) => acc + s.sections.reduce((a, sec) => a + sec.topics.filter(t => t.completed).length, 0), 0);
  const overallProgress = Math.round((completedTopics / totalTopics) * 100) || 0;

  return (
    <motion.div 
      key="subjects"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-10 space-y-10 max-w-[1600px]"
    >
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-2">Academic Syllabus</h2>
          <p className="font-body text-on-surface-variant">Track your mastery across engineering core subjects.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Overall Completion</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-headline font-black text-primary">{overallProgress}%</span>
              <div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </div>
          <button 
            onClick={onAddSubject}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary rounded-xl text-on-primary text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {subjects.map(subject => (
          <SubjectCard key={subject.id} subject={subject} onToggleTopic={toggleTopic} onSaveNotes={saveNotes} />
        ))}
      </div>
    </motion.div>
  );
};

const AnalyticsDashboard = ({ subjects, tasks, habits, events }: { subjects: Subject[], tasks: Task[], habits: Habit[], events: CalendarEvent[] }) => {
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

  const maxHours = Math.max(...weeklyStudyTime.map(d => d.hours));

  return (
    <motion.div 
      key="analytics"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-10 space-y-10 max-w-[1600px]"
    >
      <div className="mb-10">
        <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-2">Performance Analytics</h2>
        <p className="font-body text-on-surface-variant">Visual breakdown of your academic and habit progress.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Subject Progress Overview */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
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
                <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    className="h-full"
                    style={{ backgroundColor: stat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Circular Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10 flex flex-col items-center text-center">
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

          <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10 flex flex-col items-center text-center">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-6">Syllabus Coverage</h3>
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-highest" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                <motion.circle 
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * (completedTopics / totalTopics * 100)) / 100 }}
                  cx="80" cy="80" fill="transparent" r="70" stroke="url(#syllabusGradient)" strokeDasharray="440" strokeLinecap="round" strokeWidth="12"
                ></motion.circle>
                <defs>
                  <linearGradient id="syllabusGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#4edea3' }}></stop>
                    <stop offset="100%" style={{ stopColor: '#00a572' }}></stop>
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-3xl font-headline font-black text-on-surface">{Math.round((completedTopics / totalTopics) * 100)}%</span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">{completedTopics} topics mastered across all subjects.</p>
          </div>
        </div>

        {/* Weekly Study Time Chart */}
        <div className="col-span-12 lg:col-span-12 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
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
                    className="w-full max-w-[40px] bg-secondary/20 rounded-t-lg group-hover:bg-secondary/40 transition-colors relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.hours} hrs
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity Heatmap */}
        <div className="col-span-12">
          <ConsistencyHeatmap habits={habits} events={events} />
        </div>
      </div>
    </motion.div>
  );
};

const ConsistencyHeatmap = ({ habits, events }: { habits: Habit[], events: CalendarEvent[] }) => {
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
    <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
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
          {heatmapData.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.002 }}
              className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors duration-500`}
              title={`${day.date}: ${day.count} habits completed`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const HabitTracker = ({ habits, toggleHabit, badges, challenges, levelInfo, consistencyScore, onAddHabit, onViewAllAchievements, events }: any) => {
  const today = new Date().toISOString().split('T')[0];
  
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
          <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-2">Habit Forge</h2>
          <p className="font-body text-on-surface-variant">Level up your engineering skills through daily consistency.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-surface-container rounded-xl flex items-center gap-2 border border-outline-variant/10">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-sm font-bold text-on-surface">Consistency Score: {consistencyScore}%</span>
          </div>
          <button 
            onClick={onAddHabit}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary rounded-xl text-on-primary text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Daily Habits */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit: any) => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                isCompleted={habit.completedDays.includes(today)}
                onToggle={() => toggleHabit(habit.id)}
              />
            ))}
          </div>

          {/* Progress Visualization */}
          <ConsistencyHeatmap habits={habits} events={events} />
        </div>

        {/* Sidebar: Badges & Challenges */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Active Challenges */}
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-tertiary" />
              Active Challenges
            </h3>
            <div className="space-y-4">
              {challenges.map((challenge: any) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary" />
                Achievements
              </h3>
              <button 
                onClick={onViewAllAchievements}
                className="text-primary text-xs font-bold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge: any) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>

          {/* Habit Suggestions */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Smart Suggestion
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Based on your current curriculum:</p>
            <div className="p-4 bg-surface/50 rounded-xl border border-primary/20">
              <h4 className="text-sm font-bold text-on-surface mb-1">Solve 1 DSA problem daily</h4>
              <p className="text-[10px] text-on-surface-variant mb-3">Focus on Linked Lists this week.</p>
              <button 
                onClick={() => onAddHabit({ 
                  title: 'Solve 1 DSA problem daily', 
                  description: 'Focus on Linked Lists this week.', 
                  category: 'coding', 
                  frequency: 'daily' 
                })}
                className="w-full py-2 bg-primary text-on-primary rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity"
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

const HabitCard = ({ habit, isCompleted, onToggle, onDelete }: any) => {
  const categoryIcons: any = {
    coding: Code,
    math: GraduationCap,
    theory: Brain,
    general: Star
  };
  const Icon = categoryIcons[habit.category] || Star;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
        isCompleted 
          ? 'bg-primary/5 border-primary/30 shadow-lg shadow-primary/5' 
          : 'bg-surface-container-low border-outline-variant/10 hover:border-primary/50'
      }`}
    >
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(habit.id);
          }}
          className="p-1.5 bg-surface-container-high hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 rounded-lg shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div onClick={onToggle}>
        {isCompleted && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl"
          />
        )}
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
        <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{habit.frequency}</span>
        <div className="flex items-center gap-1">
          <Zap className={`w-3 h-3 ${isCompleted ? 'text-primary' : 'text-outline-variant'}`} />
          <span className={`text-[10px] font-bold ${isCompleted ? 'text-primary' : 'text-on-surface-variant'}`}>+{habit.xp} XP</span>
        </div>
      </div>
    </motion.div>
  );
};

const ChallengeCard = ({ challenge }: any) => {
  const progress = (challenge.current / challenge.target) * 100;
  return (
    <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/5">
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
          <div className="h-full bg-tertiary" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

const BadgeCard = ({ badge }: any) => (
  <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
    badge.unlocked 
      ? 'bg-secondary/5 border-secondary/20' 
      : 'bg-surface-container-highest/30 border-outline-variant/10 grayscale opacity-50'
  }`}>
    <span className="text-3xl mb-2">{badge.icon}</span>
    <h4 className="text-[10px] font-bold text-on-surface leading-tight mb-1">{badge.title}</h4>
    {badge.unlocked && (
      <span className="text-[8px] font-bold text-secondary uppercase tracking-tighter">Unlocked</span>
    )}
  </div>
);

const AddHabitModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (habit: any) => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Habit['category']>('general');
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAdd({ title, description, category, frequency });
    setTitle('');
    setDescription('');
    setCategory('general');
    setFrequency('daily');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-headline text-2xl font-bold text-on-surface">Forge New Habit</h3>
                <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest">Habit Title</label>
                  <input 
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Practice Coding"
                    className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's the goal?"
                    className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-widest">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface"
                    >
                      <option value="coding">Coding</option>
                      <option value="math">Math</option>
                      <option value="theory">Theory</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-widest">Frequency</label>
                    <select 
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary/50 text-on-surface"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity mt-4"
                >
                  Create Habit (+15 XP)
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AddSubjectModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (subject: any) => void }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#4edea3');
  const [estimatedTime, setEstimatedTime] = useState('10');
  const [sectionsText, setSectionsText] = useState('Unit 1: Introduction\nUnit 2: Advanced Topics');

  const colors = ['#4edea3', '#00a572', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sections = sectionsText.split('\n').filter(s => s.trim()).map((s, i) => {
      const parts = s.split(':');
      const sectionTitle = parts[1] ? parts[1].trim() : parts[0].trim();
      return {
        id: `sec-${Date.now()}-${i}`,
        title: sectionTitle,
        topics: [
          { id: `t-${Date.now()}-${i}-1`, title: 'Introduction', completed: false },
          { id: `t-${Date.now()}-${i}-2`, title: 'Core Concepts', completed: false },
        ]
      };
    });

    onAdd({
      title,
      color,
      estimatedTimeRemaining: parseInt(estimatedTime),
      sections
    });
    
    setTitle('');
    setSectionsText('Unit 1: Introduction\nUnit 2: Advanced Topics');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-surface-container-low rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/10"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline text-2xl font-bold text-on-surface">Add New Subject</h2>
                <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject Title</label>
                  <input
                    autoFocus
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Engineering Physics"
                    className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Est. Hours</label>
                    <input
                      type="number"
                      required
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Theme Color</label>
                    <div className="flex gap-2 py-2">
                      {colors.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-surface-container-low ring-primary' : 'hover:scale-110'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Syllabus Sections (One per line)</label>
                  <textarea
                    required
                    value={sectionsText}
                    onChange={(e) => setSectionsText(e.target.value)}
                    rows={4}
                    className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/50 transition-all resize-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Subject
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AchievementsModal = ({ isOpen, onClose, badges }: { isOpen: boolean, onClose: () => void, badges: Badge[] }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-surface/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline text-2xl font-bold text-on-surface">Hall of Fame</h3>
              <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {badges.map((badge) => (
                <div key={badge.id} className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  badge.unlocked 
                    ? 'bg-secondary/5 border-secondary/20 shadow-sm' 
                    : 'bg-surface-container-highest/30 border-outline-variant/10 grayscale opacity-40'
                }`}>
                  <span className="text-5xl mb-4">{badge.icon}</span>
                  <h4 className="text-sm font-bold text-on-surface mb-2">{badge.title}</h4>
                  <p className="text-[10px] text-on-surface-variant mb-3">{badge.description}</p>
                  {badge.unlocked ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[8px] font-bold uppercase tracking-tighter">Unlocked</span>
                      <span className="text-[8px] text-outline font-medium">{badge.unlockedAt}</span>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-outline text-[8px] font-bold uppercase tracking-tighter">Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const WeeklyPlanner = ({ subjects, onPlanGenerated }: { subjects: Subject[], onPlanGenerated: (events: CalendarEvent[]) => void }) => {
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
            completed: false
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
      className="p-10 space-y-8 max-w-4xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="font-headline text-4xl font-extrabold tracking-tighter">Weekly Study Architect</h2>
        <p className="text-on-surface-variant">Allocate your study hours for the upcoming week.</p>
      </div>

      <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 space-y-6">
        {subjects.map(subject => (
          <div key={subject.id} className="flex items-center justify-between gap-6 p-4 rounded-2xl bg-surface-container-highest/30">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></div>
              <span className="font-bold text-on-surface">{subject.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                min="0"
                max="40"
                value={allocations[subject.id] || 0}
                onChange={(e) => setAllocations({ ...allocations, [subject.id]: parseInt(e.target.value) || 0 })}
                className="w-20 bg-surface-container-highest border-none rounded-xl px-3 py-2 text-center font-bold text-primary focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest w-12">Hours</span>
            </div>
          </div>
        ))}

        <button 
          onClick={generatePlan}
          className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Weekly Study Plan
        </button>
      </div>
    </motion.div>
  );
};

const CalendarView = ({ events, onAddEvent, onDropTask, onDeleteEvent }: { events: CalendarEvent[], onAddEvent: () => void, onDropTask: (date: string) => void, onDeleteEvent: (id: string) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2)); // March 2026
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = (firstDayOfMonth(year, month) + 6) % 7; // Adjust to start from Monday

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1));

  return (
    <motion.div 
      key="calendar"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex overflow-hidden h-full relative"
    >
      {/* Left: Calendar View */}
      <section className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tighter">{monthName} {year}</h2>
            <p className="font-label text-sm text-on-surface-variant">{events.filter(e => e.date.startsWith(`${year}-${(month + 1).toString().padStart(2, '0')}`)).length} events this month</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onAddEvent}
              className="ml-2 px-4 py-2 bg-primary text-on-primary font-label font-bold rounded-full flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-t border-l border-outline-variant/15">
          {/* Weekdays */}
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
            <div key={day} className="py-4 text-center font-label text-xs font-bold text-outline border-r border-b border-outline-variant/15">{day}</div>
          ))}
          
          {/* Empty cells for start of month */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-32 bg-surface-dim/30 border-r border-b border-outline-variant/15"></div>
          ))}
          
          {/* Days */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = getEventsForDay(dayNum);
            const isToday = new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;
            
            return (
              <CalendarDay 
                key={dayNum} 
                number={dayNum.toString().padStart(2, '0')} 
                events={dayEvents} 
                isToday={isToday}
                onSelectEvent={setSelectedEvent}
                onDropTask={onDropTask}
                date={`${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`}
              />
            );
          })}
        </div>
      </section>

      {/* Event Detail Sidebar */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-80 bg-surface-container-low p-8 border-l border-outline-variant/15 flex flex-col gap-8 absolute right-0 top-0 h-full z-20 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                selectedEvent.type === 'Exam' ? 'bg-red-500/10 text-red-500' :
                selectedEvent.type === 'Assignment' ? 'bg-orange-500/10 text-orange-500' :
                selectedEvent.type === 'Project' ? 'bg-blue-500/10 text-blue-500' :
                'bg-green-500/10 text-green-500'
              }`}>
                {selectedEvent.type}
              </span>
              <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-surface-container rounded-full">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-1">{selectedEvent.title}</h3>
                <p className="text-sm text-primary font-medium">{selectedEvent.subject}</p>
              </div>
              <button 
                onClick={() => {
                  onDeleteEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="p-2 hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 rounded-xl transition-colors"
                title="Delete Event"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{new Date(selectedEvent.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Timer className="w-4 h-4" />
                <span className="text-sm">{selectedEvent.time}</span>
              </div>
              {selectedEvent.reminders.length > 0 && (
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Bell className="w-4 h-4" />
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.reminders.map(r => (
                      <span key={r} className="px-2 py-0.5 bg-surface-container-highest rounded text-[10px] font-bold">{r} before</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <div className="bg-surface-container p-4 rounded-xl">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Notes</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{selectedEvent.description}</p>
              </div>
            )}

            {selectedEvent.type === 'Exam' && (
              <div className="mt-auto p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Countdown</span>
                </div>
                <Countdown date={`${selectedEvent.date}T${selectedEvent.time}`} />
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Right Panel: Upcoming Assignments (Default) */}
      {!selectedEvent && (
        <aside className="w-96 bg-surface-container-low p-8 border-l border-outline-variant/15 flex flex-col gap-8 hidden xl:flex">
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {events
                .filter(e => !e.isRecurring && new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 4)
                .map(event => (
                  <div key={event.id} className="bg-surface-container-highest/50 p-4 rounded-xl border border-outline-variant/10 group hover:border-primary/30 transition-all cursor-pointer" onClick={() => setSelectedEvent(event)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        event.type === 'Exam' ? 'bg-red-500/10 text-red-500' :
                        event.type === 'Assignment' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {event.type}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-bold">
                        {Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    </div>
                    <h4 className="font-headline text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{event.title}</h4>
                    <p className="text-[10px] text-on-surface-variant mt-1">{event.subject}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Recurring Reminders */}
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Recurring Reminders</h3>
            <div className="space-y-3">
              {events.filter(e => e.isRecurring).map(event => (
                <div key={event.id} className="flex items-center gap-4 p-3 bg-surface-container rounded-xl border border-outline-variant/5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    event.recurrence === 'daily' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                  }`}>
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-on-surface">{event.title}</h4>
                    <p className="text-[10px] text-on-surface-variant capitalize">{event.recurrence} at {event.time}</p>
                  </div>
                  <Bell className="w-4 h-4 text-outline" />
                </div>
              ))}
              {events.filter(e => e.isRecurring).length === 0 && (
                <p className="text-xs text-on-surface-variant italic">No recurring reminders set.</p>
              )}
            </div>
          </div>
        </aside>
      )}
    </motion.div>
  );
};

const Countdown = ({ date }: { date: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(date).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        { label: 'D', value: timeLeft.days },
        { label: 'H', value: timeLeft.hours },
        { label: 'M', value: timeLeft.mins },
        { label: 'S', value: timeLeft.secs }
      ].map(unit => (
        <div key={unit.label} className="flex flex-col items-center">
          <span className="text-lg font-headline font-black text-on-surface">{unit.value.toString().padStart(2, '0')}</span>
          <span className="text-[8px] font-bold text-outline uppercase">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};

const CalendarDay: React.FC<{ 
  number: string, 
  events: CalendarEvent[], 
  isToday: boolean, 
  onSelectEvent: (e: CalendarEvent) => void,
  onDropTask: (date: string) => void,
  date: string
}> = ({ number, events, isToday, onSelectEvent, onDropTask, date }) => {
  const getTypeColor = (type: EventType) => {
    switch (type) {
      case 'Exam': return 'bg-red-500 border-red-500 text-white';
      case 'Assignment': return 'bg-orange-500 border-orange-500 text-white';
      case 'Project': return 'bg-blue-500 border-blue-500 text-white';
      case 'Study Session': return 'bg-green-500 border-green-500 text-white';
      default: return 'bg-primary border-primary text-white';
    }
  };

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDropTask(date)}
      className={`h-32 p-2 border-r border-b border-outline-variant/15 transition-colors group ${isToday ? 'bg-surface-container-lowest ring-1 ring-primary/20' : 'bg-surface hover:bg-surface-container'} cursor-default`}
    >
      <div className="flex justify-between items-start">
        <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}`}>{number}</span>
        {isToday && <span className="text-[8px] font-bold uppercase text-primary">Today</span>}
      </div>
      <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar pr-1">
        {events.map(event => (
          <div 
            key={event.id} 
            onClick={() => onSelectEvent(event)}
            className={`p-1 rounded-sm border-l-2 text-[9px] font-bold truncate cursor-pointer hover:brightness-110 transition-all ${getTypeColor(event.type)}`}
          >
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
};

const AssignmentCard = ({ tag, title, desc, date, progress, color, opacity = '' }: any) => {
  const colorMap: any = {
    primary: { text: 'text-primary', bg: 'bg-primary', container: 'bg-primary/20', border: 'hover:border-primary/30' },
    secondary: { text: 'text-secondary', bg: 'bg-secondary', container: 'bg-secondary-container/20', border: 'hover:border-secondary/30' },
    tertiary: { text: 'text-tertiary', bg: 'bg-tertiary', container: 'bg-tertiary-container/20', border: 'hover:border-tertiary/30' },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <div className={`bg-surface-container p-4 rounded-xl border border-transparent ${colors.border} transition-all cursor-pointer ${opacity}`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-0.5 rounded-full ${colors.container} ${colors.text} text-[10px] font-bold uppercase tracking-wider`}>{tag}</span>
        <span className="text-[10px] text-outline font-label">{date}</span>
      </div>
      <h4 className="font-headline text-sm font-bold text-on-surface">{title}</h4>
      <p className="text-xs text-on-surface-variant mt-1 mb-4">{desc}</p>
      {progress !== undefined && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className={`h-full ${colors.bg} w-3/4`}></div>
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant">{progress}%</span>
        </div>
      )}
    </div>
  );
};

const SubjectFocusItem = ({ color, label, time }: any) => (
  <div className="flex items-center gap-3">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-xs text-on-surface flex-1">{label}</span>
    <span className="text-xs text-outline font-label">{time}</span>
  </div>
);

const AddEventModal = ({ isOpen, onClose, onAdd, subjects }: { isOpen: boolean, onClose: () => void, onAdd: (event: Omit<CalendarEvent, 'id'>) => void, subjects: Subject[] }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Exam');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [subject, setSubject] = useState(subjects[0]?.title || '');
  const [description, setDescription] = useState('');
  const [reminders, setReminders] = useState<string[]>(['1d']);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly'>('daily');

  const eventTypes: EventType[] = ['Exam', 'Assignment', 'Project', 'Reminder', 'Lab', 'Presentation', 'Study Session'];
  const reminderOptions = [
    { label: '1 hour before', value: '1h' },
    { label: '1 day before', value: '1d' },
    { label: '3 days before', value: '3d' },
    { label: '1 week before', value: '1w' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      type,
      date,
      time,
      subject,
      description,
      reminders,
      isRecurring,
      recurrence: isRecurring ? recurrence : undefined
    });
    // Reset form
    setTitle('');
    setType('Exam');
    setDescription('');
    setReminders(['1d']);
  };

  const toggleReminder = (value: string) => {
    setReminders(prev => 
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md h-screen bg-surface-container-high/70 backdrop-blur-xl p-8 flex flex-col border-l border-outline-variant/20 shadow-2xl relative z-10"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-headline text-2xl font-extrabold text-on-surface">Add Event</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container transition-colors">
                <X className="w-6 h-6 text-on-surface-variant" />
              </button>
            </div>
            <form className="space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-10" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label text-xs font-bold text-outline uppercase tracking-wider mb-2">Event Title</label>
                <input 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container border-none rounded-xl p-4 text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50" 
                  placeholder="e.g. Design Lab Submission" 
                  type="text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs font-bold text-outline uppercase tracking-wider mb-2">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full bg-surface-container border-none rounded-xl p-4 text-on-surface text-sm focus:ring-1 focus:ring-primary/50"
                  >
                    {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-label text-xs font-bold text-outline uppercase tracking-wider mb-2">Subject</label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-surface-container border-none rounded-xl p-4 text-on-surface text-sm focus:ring-1 focus:ring-primary/50"
                  >
                    {subjects.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs font-bold text-outline uppercase tracking-wider mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-surface-container border-none rounded-xl p-4 pl-10 text-on-surface text-sm" 
                      type="date"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-label text-xs font-bold text-outline uppercase tracking-wider mb-2">Time</label>
                  <div className="relative">
                    <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input 
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-surface-container border-none rounded-xl p-4 pl-10 text-on-surface text-sm" 
                      type="time"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-label text-xs font-bold text-outline uppercase tracking-wider mb-2">Reminders</label>
                <div className="flex flex-wrap gap-2">
                  {reminderOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleReminder(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                        reminders.includes(opt.value) 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-surface-container border-outline-variant/30 text-outline hover:border-primary/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-surface-container rounded-xl">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-on-surface">Recurring Event</h4>
                  <p className="text-[10px] text-on-surface-variant">Set this as a daily or weekly reminder</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${isRecurring ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <motion.div 
                    animate={{ x: isRecurring ? 18 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {isRecurring && (
                <div className="flex gap-2">
                  {['daily', 'weekly'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRecurrence(r as any)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                        recurrence === r ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-label text-xs font-bold text-outline uppercase tracking-wider mb-2">Notes</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-container border-none rounded-xl p-4 text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50" 
                  placeholder="Mention specific requirements..." 
                  rows={3}
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-primary-container to-primary text-on-primary font-headline font-extrabold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  Schedule Milestone
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const TaskCard = ({ id, tag, title, desc, date, time, status, initials, progress, hasAttachment, isLowPriority, onDragStart, onDelete }: any) => (
  <motion.div 
    draggable
    onDragStart={() => onDragStart && onDragStart({ title, subtitle: tag })}
    className={`${isLowPriority ? 'bg-surface-container-low opacity-80' : 'bg-surface-container'} rounded-xl p-5 group hover:bg-surface-container-high transition-all border border-transparent hover:border-outline-variant/20 cursor-grab active:cursor-grabbing relative`}
  >
    <div className="flex justify-between items-start mb-4">
      <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded ${isLowPriority ? 'text-outline bg-surface-container-highest' : 'text-primary bg-primary/10'}`}>{tag}</span>
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="p-1 hover:bg-red-500/10 text-outline hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <MoreVertical className="w-4 h-4 text-outline cursor-pointer hover:text-on-surface" />
      </div>
    </div>
    <h4 className={`font-headline font-bold mb-2 leading-tight ${isLowPriority ? 'text-on-surface-variant' : 'text-on-surface'}`}>{title}</h4>
    <p className={`text-xs mb-6 line-clamp-2 leading-relaxed font-light ${isLowPriority ? 'text-outline' : 'text-on-surface-variant'}`}>{desc}</p>
    <div className="flex items-center justify-between mt-auto">
      <div className={`flex items-center space-x-2 ${isLowPriority ? 'text-outline' : date === 'OCT 14, 2023' || date === 'OCT 18, 2023' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
        <Calendar className="w-3 h-3" />
        <span className="text-[11px] font-bold">{date || time}</span>
      </div>
      {initials && (
        <div className="w-6 h-6 rounded-full bg-surface-container-highest border border-surface flex items-center justify-center text-[10px] font-bold">{initials}</div>
      )}
      {progress !== undefined && (
        <div className="w-24 bg-surface-container-highest h-1 rounded-full ml-4 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-secondary to-secondary-container" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {status && (
        <div className={`flex items-center space-x-1 ${status === 'IN PROGRESS' ? 'text-secondary' : 'text-outline'}`}>
          {status === 'IN PROGRESS' && <CheckCircle className="w-3 h-3 fill-secondary/20" />}
          <span className="text-[10px] font-bold uppercase">{status}</span>
        </div>
      )}
      {hasAttachment && <Settings className="w-3 h-3 text-outline" />}
    </div>
  </motion.div>
);

const StatCard = ({ icon: Icon, value, label, color, bgColor }: any) => (
  <div className="glass-card p-6 rounded-xl flex items-center space-x-4 border border-outline-variant/10">
    <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[10px] font-bold text-outline uppercase tracking-wider">{label}</p>
    </div>
  </div>
);
