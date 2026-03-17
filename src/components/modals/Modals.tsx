import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Calendar, Type, Clock, CheckCircle, Trophy, Sparkles, Loader2, Brain, Check, UserCircle, GraduationCap, Target, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import { generateSyllabusBreakdown, generateQuizFromNotes, generateTopicsFromMaterial, QuizQuestion } from '../../lib/ai';
import { processStudyMaterial } from '../../lib/materialProcessor';
import { Badge, Subject, Habit, EventType, CalendarEvent } from '../../types';

export const AddHabitModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (habit: any) => void }) => {
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
    onClose();
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

export const AddSubjectModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (subject: any) => void }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#4edea3');
  const [estimatedTime, setEstimatedTime] = useState('10');
  const [sectionsText, setSectionsText] = useState('Unit 1: Introduction\nUnit 2: Advanced Topics');

  const colors = ['#4edea3', '#00a572', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
      const breakdown = await generateSyllabusBreakdown(title);
      if (breakdown && breakdown.length > 0) {
        const text = breakdown.map((s: any) => 
          `${s.title}: ${s.topics.map((t: any) => t.title).join(', ')}`
        ).join('\n');
        setSectionsText(text);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sections = sectionsText.split('\n').filter(s => s.trim()).map(line => {
      const [title, topicsStr] = line.split(':');
      return {
        id: crypto.randomUUID(),
        title: title.trim(),
        topics: (topicsStr || '').split(',').filter(t => t.trim()).map(t => ({
          id: crypto.randomUUID(),
          title: t.trim(),
          completed: false
        }))
      };
    });

    onAdd({
      title,
      color,
      estimatedTime: parseInt(estimatedTime),
      sections
    });
    
    setTitle('');
    setSectionsText('Unit 1: Introduction\nUnit 2: Advanced Topics');
    onClose();
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
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Syllabus Sections (One per line)</label>
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={!title || isGenerating}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:text-accent-purple transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Generate with AI
                    </button>
                  </div>
                  <textarea
                    required
                    value={sectionsText}
                    onChange={(e) => setSectionsText(e.target.value)}
                    rows={4}
                    placeholder="Unit 1: Intro&#10;Unit 2: Advanced Topics"
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

export const AchievementsModal = ({ isOpen, onClose, badges }: { isOpen: boolean, onClose: () => void, badges: Badge[] }) => (
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

export const AddEventModal = ({ isOpen, onClose, onAdd, subjects }: { isOpen: boolean, onClose: () => void, onAdd: (event: Omit<CalendarEvent, 'id'>) => void, subjects: Subject[] }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Exam');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [subject, setSubject] = useState(subjects[0]?.title || 'General');
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
      recurrence: isRecurring ? recurrence : undefined,
      completed: false
    });
    setTitle('');
    setType('Exam');
    setDescription('');
    setReminders(['1d']);
    onClose();
  };

  const toggleReminder = (value: string) => {
    setReminders(prev => 
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
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
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
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
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-secondary">#</div>
                    <h4 className="text-sm font-bold text-on-surface">Quiz Challenge</h4>
                  </div>
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
                      className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${recurrence === r ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity mt-6"
              >
                Save Event (+10 XP)
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export const QuizModal = ({ 
  isOpen, 
  onClose, 
  subjectTitle, 
  topicTitle, 
  notes, 
  onComplete 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  subjectTitle: string, 
  topicTitle: string, 
  notes: string,
  onComplete: (score: number) => void
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<'loading' | 'quiz' | 'result'>('loading');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (isOpen && notes) {
      loadQuiz();
    }
  }, [isOpen, notes]);

  const loadQuiz = async () => {
    setCurrentStep('loading');
    const data = await generateQuizFromNotes(subjectTitle, topicTitle, notes);
    setQuestions(data);
    setCurrentStep(data.length > 0 ? 'quiz' : 'result');
    setCurrentIndex(0);
    setScore(0);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCurrentStep('result');
      onComplete(score);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-surface-container-low rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10 min-h-[500px] flex flex-col"
          >
            {currentStep === 'loading' && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-12">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                  <Brain className="w-10 h-10 animate-pulse" />
                </div>
                <div className="text-center">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Architecting Your Quiz</h3>
                  <p className="text-on-surface-variant mt-2">Groq is analyzing your notes to generate targeted challenges...</p>
                </div>
              </div>
            )}

            {currentStep === 'quiz' && (
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Question {currentIndex + 1} of {questions.length}</span>
                    <h3 className="font-headline text-lg font-bold text-on-surface mt-1">{topicTitle} Mastery</h3>
                  </div>
                  <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center font-black text-primary">
                    {Math.round((currentIndex / questions.length) * 100)}%
                  </div>
                </div>

                <div className="flex-1 space-y-8">
                  <p className="text-xl font-medium text-on-surface leading-relaxed">
                    {questions[currentIndex].question}
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {questions[currentIndex].options.map((opt, i) => {
                      const isCorrect = opt === questions[currentIndex].correctAnswer;
                      const isSelected = opt === selectedAnswer;
                      return (
                        <button
                          key={i}
                          disabled={!!selectedAnswer}
                          onClick={() => handleAnswer(opt)}
                          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                            isSelected 
                              ? (isCorrect ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-red-500/20 border-red-500/50 text-red-500')
                              : (selectedAnswer && isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-500/70' : 'bg-surface border-outline-variant/10 hover:border-primary/50 text-on-surface-variant')
                          }`}
                        >
                          <span className="font-medium">{opt}</span>
                          {isSelected && (isCorrect ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />)}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Explanation</p>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{questions[currentIndex].explanation}</p>
                    </motion.div>
                  )}
                </div>

                <div className="mt-8">
                  <button
                    disabled={!selectedAnswer}
                    onClick={nextQuestion}
                    className="w-full bg-primary text-on-primary font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'result' && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-8">
                <div className="w-24 h-24 bg-tertiary/10 rounded-[2rem] flex items-center justify-center text-tertiary">
                  <Trophy className="w-12 h-12" />
                </div>
                <div className="text-center">
                  <h3 className="font-headline text-3xl font-black text-on-surface">Quiz Complete!</h3>
                  <p className="text-on-surface-variant mt-2 leading-relaxed">
                    You scored <span className="text-primary font-bold">{score} / {questions.length}</span>. 
                    {score === questions.length ? " Perfect mastery!" : " Great effort, keep studying!"}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="px-10 py-4 bg-surface-container-high text-on-surface font-bold rounded-2xl hover:bg-surface-container-highest transition-all"
                >
                  Return to Syllabus
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ProfileModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onUpdate 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  user: any, 
  onUpdate: (data: any) => void 
}) => {
  const [name, setName] = useState(user?.displayName || '');
  const [major, setMajor] = useState(user?.major || '');
  const [goals, setGoals] = useState(user?.goals || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate({ displayName: name, major, goals });
    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-surface-container-low border border-outline-variant/10 rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                    <UserCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-on-surface">Your Profile</h2>
                    <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Architect Identity</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Type className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary/50 text-on-surface"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest ml-1 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" /> Major / Field
                  </label>
                  <input
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary/50 text-on-surface"
                    placeholder="e.g. Mechanical Engineering"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Study Goals
                  </label>
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary/50 text-on-surface min-h-[100px] resize-none"
                    placeholder="What are you trying to achieve this semester?"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 bg-surface-container-high text-on-surface font-bold rounded-2xl hover:bg-surface-container-highest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-3 py-4 bg-primary text-on-primary font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 min-w-[200px]"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Save Profile
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const StudyMaterialModal = ({ 
  isOpen, 
  onClose, 
  onGenerate 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onGenerate: (data: any) => void 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'analyzing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) setFile(uploadedFile);
  };

  const handleStart = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(30);

    try {
      const text = await processStudyMaterial(file);
      setProgress(60);
      setStatus('analyzing');
      
      const syllabus = await generateTopicsFromMaterial(text);
      setProgress(100);
      setStatus('done');
      
      onGenerate(syllabus);
      onClose();
    } catch (error) {
      console.error(error);
      setStatus('idle');
      alert("Failed to process material. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-surface/80 backdrop-blur-xl" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-surface-container-low border border-outline-variant/10 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary border border-secondary/20 shadow-inner">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-headline font-bold text-on-surface">Material Architect</h2>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">PDF & Image to Roadmap</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              {status === 'idle' ? (
                <div className="space-y-6">
                  <label className="group relative h-48 border-2 border-dashed border-outline-variant/20 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleUpload} />
                    {file ? (
                      <div className="text-center p-4">
                        <p className="text-sm font-bold text-primary truncate max-w-[250px]">{file.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase font-black mt-1">Tap to change</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-on-surface">Drop Study Material</p>
                          <p className="text-[10px] text-on-surface-variant uppercase font-black mt-1">PDF or Photos of Notes</p>
                        </div>
                      </>
                    )}
                  </label>
                  
                  <button
                    disabled={!file}
                    onClick={handleStart}
                    className="w-full py-5 bg-primary text-on-primary rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/30 disabled:opacity-50"
                  >
                    <Sparkles className="w-6 h-6" />
                    Extract Architecture
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-8">
                  <div className="relative w-24 h-24">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                      className="absolute inset-0 border-4 border-primary/10 border-t-primary rounded-full shadow-inner"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-on-surface">
                      {status === 'processing' ? 'Extracting Knowledge...' : 'Groq is Reasoning...'}
                    </h3>
                    <div className="w-48 h-1.5 bg-surface-container-high rounded-full overflow-hidden mx-auto mt-4">
                      <motion.div 
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-4">This takes ~15-30 seconds</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
