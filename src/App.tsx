import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Star 
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
  onSnapshot,
  updateDoc,
  deleteDoc,
  handleFirestoreError,
  OperationType,
  addDoc
} from './firebase';

// Types
import { 
  View, 
  Subject, 
  Task, 
  Habit, 
  CalendarEvent, 
  Badge, 
  Challenge,
  Topic 
} from './types';

// Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ErrorBoundary as AuthScreens, LoadingScreen, LoginScreen } from './components/auth/AuthScreens';
import { DashboardView } from './components/dashboard/DashboardView';
import { HabitTracker } from './components/habits/HabitTracker';
import { SubjectTracker } from './components/subjects/SubjectTracker';
import { TasksView } from './components/tasks/TasksView';
import { CalendarView } from './components/calendar/CalendarView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { WeeklyPlanner } from './components/calendar/WeeklyPlanner';
import { 
  AddHabitModal, 
  AddSubjectModal, 
  AddEventModal, 
  AchievementsModal,
  QuizModal,
  ProfileModal,
  StudyMaterialModal 
} from './components/modals/Modals';
import { AIAssistant } from './components/ai/AIAssistant';
import { AchievementPopup } from './components/common/AchievementPopup';

export default function App() {
  return (
    <AuthScreens>
      <AppContent />
    </AuthScreens>
  );
}

function AppContent() {
  const [user, setUser] = useState<any>(null); // Use firebase User type if available
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Modal States
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<{ subjectTitle: string, topic: Topic } | null>(null);
  
  // Data States
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  const [motivationMessage, setMotivationMessage] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [notification, setNotification] = useState<{ title: string, subtitle: string, type: 'achievement' | 'level-up' | 'streak' } | null>(null);

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
      (snapshot) => setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent))),
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/events`)
    );

    const unsubSubjects = onSnapshot(collection(db, `users/${user.uid}/subjects`), 
      (snapshot) => setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject))),
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/subjects`)
    );

    const unsubTasks = onSnapshot(collection(db, `users/${user.uid}/tasks`), 
      (snapshot) => setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task))),
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/tasks`)
    );

    const unsubHabits = onSnapshot(collection(db, `users/${user.uid}/habits`), 
      (snapshot) => setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit))),
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/habits`)
    );

    const unsubProfile = onSnapshot(doc(db, `users/${user.uid}/data/profile`), 
      (docSnap) => {
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setUser(prev => ({ ...prev, ...profileData }));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/data/profile`)
    );

    const unsubStats = onSnapshot(doc(db, `users/${user.uid}/data/stats`), 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setXp(data.xp || 0);
        } else {
          setDoc(doc(db, `users/${user.uid}/data/stats`), { xp: 0, level: 1 })
            .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/data/stats`));
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}/data/stats`)
    );

    const unsubBadges = onSnapshot(collection(db, `users/${user.uid}/badges`), 
      (snapshot) => setBadges(snapshot.docs.map(doc => doc.data() as Badge)),
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/badges`)
    );

    const unsubChallenges = onSnapshot(collection(db, `users/${user.uid}/challenges`), 
      (snapshot) => setChallenges(snapshot.docs.map(doc => doc.data() as Challenge)),
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

  // --- Helpers ---
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

  const updateXp = async (amount: number) => {
    if (!user) return;
    const newXp = xp + amount;
    const oldLevel = getLevelInfo(xp).level;
    const newLevel = getLevelInfo(newXp).level;
    
    try {
      await updateDoc(doc(db, `users/${user.uid}/data/stats`), { xp: newXp });
      if (newLevel > oldLevel) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/data/stats`);
    }
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
          await updateXp(challenge.rewardXp);
          setMotivationMessage(`🏆 Challenge Completed: ${challenge.title}! +${challenge.rewardXp} XP`);
          setTimeout(() => setMotivationMessage(null), 4000);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/challenges/${challenge.id}`);
      }
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const isCompleted = habit.completedDays.includes(today);
    const newDays = isCompleted ? habit.completedDays.filter(d => d !== today) : [...habit.completedDays, today];
    try {
      await updateDoc(doc(db, `users/${user.uid}/habits`, habitId), { completedDays: newDays });
      if (!isCompleted) {
        await updateXp(habit.xp);
        await updateChallengeProgress('habit');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  const addHabit = async (newHabit: Omit<Habit, 'id' | 'completedDays' | 'xp'>) => {
    if (!user) return;
    const id = `h${Date.now()}`;
    const habit: Habit = { ...newHabit, id, completedDays: [], xp: 15 };
    try {
      await setDoc(doc(db, `users/${user.uid}/habits`, id), habit);
      setIsAddHabitOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/habits/${id}`);
    }
  };

  const toggleTask = async (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      const isNowCompleted = !task.completed;
      await updateDoc(doc(db, `users/${user.uid}/tasks`, id), { completed: isNowCompleted });
      if (isNowCompleted) {
        await updateXp(20);
        await updateChallengeProgress('task');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/tasks`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/tasks/${id}`);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/events`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/events/${id}`);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/habits`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/habits/${id}`);
    }
  };

  const addSubject = async (newSubject: Omit<Subject, 'id'>) => {
    if (!user) return;
    const id = `s${Date.now()}`;
    try {
      await setDoc(doc(db, `users/${user.uid}/subjects`, id), { ...newSubject, id });
      setIsAddSubjectOpen(false);
      setMotivationMessage(`📚 New subject added: ${newSubject.title}`);
      setTimeout(() => setMotivationMessage(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/subjects`);
    }
  };

  const addSubjectFromMaterial = async (syllabus: any) => {
    if (!user) return;
    try {
      const { subject: title, sections } = syllabus;
      const newSubject: Omit<Subject, 'id'> = {
        title,
        estimatedTimeRemaining: sections.length * 2, // 2h per section estimate
        color: 'secondary',
        sections: sections.map((s: any, i: number) => ({
          id: String(i + 1),
          title: s.title,
          topics: s.topics.map((t: string, j: number) => ({
            id: `${i + 1}-${j + 1}`,
            title: t,
            completed: false,
            notes: ''
          }))
        }))
      };
      await addDoc(collection(db, `users/${user.uid}/subjects`), newSubject);
      setNotification({
        title: "Architecture Extracted",
        subtitle: `${title} roadmap generated from material`,
        type: 'achievement'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/subjects`);
    }
  };

  const addEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
    if (!user) return;
    const id = `e${Date.now()}`;
    try {
      await setDoc(doc(db, `users/${user.uid}/events`, id), { ...newEvent, id });
      setIsAddEventOpen(false);
      setMotivationMessage(`📅 Event added: ${newEvent.title}`);
      setTimeout(() => setMotivationMessage(null), 3000);
      await updateChallengeProgress('study');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/events/${id}`);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/subjects`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/subjects/${id}`);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (!user || !activeQuiz) return;
    // Reward XP for completing quiz
    const bonusXp = score * 50;
    try {
      await updateDoc(doc(db, `users/${user.uid}/data/stats`), {
        xp: xp + bonusXp
      });
      setMotivationMessage(`Quiz Master! You earned ${bonusXp} XP!`);
      setNotification({
        title: "Quiz Completed!",
        subtitle: `You earned ${bonusXp} XP Architect Credits`,
        type: 'achievement'
      });
      setTimeout(() => setMotivationMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/data/profile`), profileData, { merge: true });
      setNotification({
        title: "Profile Updated",
        subtitle: "Architect Identity Sync Complete",
        type: 'achievement'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/data/profile`);
    }
  };

  const toggleTopic = async (subjectId: string, topicId: string) => {
    if (!user) return;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const newSections = subject.sections.map(section => ({
      ...section,
      topics: section.topics.map(topic => 
        topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
      )
    }));

    try {
      await updateDoc(doc(db, `users/${user.uid}/subjects`, subjectId), { sections: newSections });
      const isNowCompleted = newSections.some(s => s.topics.some(t => t.id === topicId && t.completed));
      if (isNowCompleted) {
        await updateXp(10);
        await updateChallengeProgress('study');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/subjects/${subjectId}`);
    }
  };

  const saveNotes = async (subjectId: string, topicId: string, notes: string) => {
    if (!user) return;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const newSections = subject.sections.map(section => ({
      ...section,
      topics: section.topics.map(topic => 
        topic.id === topicId ? { ...topic, notes } : topic
      )
    }));

    try {
      await updateDoc(doc(db, `users/${user.uid}/subjects`, subjectId), { sections: newSections });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/subjects/${subjectId}`);
    }
  };

  if (!isAuthReady) return <LoadingScreen />;
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-surface selection:bg-primary/30 text-on-surface">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user} 
        onLogout={handleLogout} 
      />

      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <Header user={user} onOpenProfile={() => setIsProfileOpen(true)} />

        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <DashboardView 
              key="dashboard"
              levelInfo={levelInfo}
              xp={xp}
              habits={habits}
              events={events}
              subjects={subjects}
              tasks={tasks}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onAddTask={() => setIsAddTaskOpen(true)}
              onManageSubjects={() => setCurrentView('subjects')}
              onRegisterEvent={() => setIsAddEventOpen(true)}
              onViewCalendar={() => setCurrentView('calendar')}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView 
              key="tasks"
              tasks={tasks}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onAddTask={() => setIsAddTaskOpen(true)}
            />
          )}

          {currentView === 'habits' && (
            <HabitTracker 
              key="habits"
              habits={habits}
              badges={badges}
              challenges={challenges}
              onToggleHabit={toggleHabit}
              onDeleteHabit={deleteHabit}
              onAddHabit={() => setIsAddHabitOpen(true)}
              onOpenAchievements={() => setIsAchievementsOpen(true)}
            />
          )}

          {currentView === 'subjects' && (
            <SubjectTracker 
              key="subjects"
              subjects={subjects}
              onToggleTopic={toggleTopic}
              onSaveNotes={saveNotes}
              onDeleteSubject={deleteSubject}
              onOpenAddSubject={() => setIsAddSubjectOpen(true)}
              onOpenMaterial={() => setIsMaterialOpen(true)}
              onOpenQuiz={(subjectTitle, topic) => setActiveQuiz({ subjectTitle, topic })}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView 
              events={events}
              onDeleteEvent={deleteEvent}
              onAddEvent={() => setIsAddEventOpen(true)}
              onDropTask={(date) => console.log('Dropped on:', date)} 
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsDashboard 
              key="analytics"
              subjects={subjects}
              tasks={tasks}
              habits={habits}
            />
          )}

          {currentView === 'weekly' && (
            <WeeklyPlanner 
              key="weekly"
              subjects={subjects}
              onComplete={handleQuizComplete}
            />
          )}

          {isProfileOpen && (
            <ProfileModal 
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              user={user}
              onUpdate={updateProfile}
            />
          )}

          {isMaterialOpen && (
            <StudyMaterialModal 
              isOpen={isMaterialOpen}
              onClose={() => setIsMaterialOpen(false)}
              onGenerate={addSubjectFromMaterial}
            />
          )}

          <AchievementPopup 
            show={!!notification}
            onClose={() => setNotification(null)}
            title={notification?.title || ''}
            subtitle={notification?.subtitle || ''}
            type={notification?.type || 'achievement'}
          />
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AddHabitModal 
        isOpen={isAddHabitOpen} 
        onClose={() => setIsAddHabitOpen(false)} 
        onAdd={addHabit} 
      />
      <AddSubjectModal 
        isOpen={isAddSubjectOpen} 
        onClose={() => setIsAddSubjectOpen(false)} 
        onAdd={addSubject} 
      />
      <AddEventModal 
        isOpen={isAddEventOpen} 
        onClose={() => setIsAddEventOpen(false)} 
        subjects={subjects}
        onAdd={addEvent} 
      />
      <AchievementsModal 
        isOpen={isAchievementsOpen} 
        onClose={() => setIsAchievementsOpen(false)} 
        badges={badges} 
      />

      {/* Level Up Notification */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-primary to-secondary p-1 rounded-2xl shadow-2xl shadow-primary/40"
          >
            <div className="bg-surface-container-high px-10 py-6 rounded-[calc(1rem-2px)] text-center">
              <motion.div 
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl mb-2"
              >
                🎊
              </motion.div>
              <h3 className="text-2xl font-headline font-black text-on-surface">LEVEL UP!</h3>
              <p className="text-on-surface-variant font-bold">You've reached Level {levelInfo.level}</p>
              <div className="mt-4 flex items-center gap-2 justify-center">
                <Star className="w-4 h-4 text-tertiary fill-tertiary" />
                <span className="text-xs font-black text-tertiary uppercase tracking-widest">{levelInfo.title}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivation/Toast System */}
      <AnimatePresence>
        {motivationMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 right-10 z-[100] bg-surface-container-highest border border-outline-variant/20 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <div className="p-2 bg-primary/10 rounded-xl">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-on-surface leading-tight">{motivationMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant */}
      <AIAssistant 
        studyContext={{
          xp,
          level: levelInfo.level,
          subjectsCount: subjects.length,
          tasksCount: tasks.length,
          habitsCount: habits.length,
          pendingTasks: tasks.filter(t => !t.completed).length,
          currentView
        }} 
      />
    </div>
  );
}
