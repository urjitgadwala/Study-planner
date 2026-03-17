import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Check, 
  ChevronRight, 
  Trash2, 
  Zap, 
  ClipboardList, 
  Save,
  Sparkles,
  Mic,
  MicOff 
} from 'lucide-react';
import { useVoiceToText } from '../../hooks/useVoiceToText';
import { Subject, Topic } from '../../types';

export const TopicItem = ({ 
  topic, 
  color, 
  onToggle, 
  onSaveNotes,
  onOpenQuiz
}: { 
  topic: Topic, 
  color: string, 
  onToggle: () => void, 
  onSaveNotes: (notes: string) => void,
  onOpenQuiz: () => void,
  key?: string | number
}) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [tempNotes, setTempNotes] = useState(topic.notes || '');
  const { isListening, startListening, stopListening } = useVoiceToText();

  const handleVoiceNote = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        setTempNotes(prev => (prev ? prev + ' ' + text : text));
      });
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
          topic.completed 
            ? 'bg-surface-container/50 border-transparent opacity-60' 
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
            className="overflow-hidden bg-surface-container-low/50 rounded-xl p-4 border border-outline-variant/10"
          >
            <div className="relative">
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Add your study notes here..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-body text-on-surface placeholder:text-on-surface-variant/30 min-h-[120px] resize-none pb-10"
              />
              <button
                onClick={handleVoiceNote}
                className={`absolute bottom-2 right-2 p-2 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' 
                    : 'bg-surface-container-highest text-on-surface-variant hover:text-primary'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-2 gap-2">
              {topic.notes && (
                <button
                  onClick={() => onOpenQuiz()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-tertiary/10 text-tertiary rounded-lg text-xs font-bold hover:bg-tertiary/20 transition-all"
                >
                  <Sparkles className="w-3 h-3" />
                  Take AI Quiz
                </button>
              )}
              <button
                onClick={() => {
                  onSaveNotes(tempNotes);
                  setIsNotesOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
              >
                <Save className="w-3 h-3" />
                Save Notes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SubjectCard = ({ 
  subject, 
  onToggleTopic, 
  onSaveNotes, 
  onDelete,
  onOpenQuiz 
}: { 
  subject: Subject, 
  onToggleTopic: (sId: string, tId: string) => void, 
  onSaveNotes: (sId: string, tId: string, notes: string) => void, 
  onDelete: (id: string) => void,
  onOpenQuiz: (topic: Topic) => void,
  key?: string | number
}) => {
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
      className="bg-surface-container-low/40 backdrop-blur-md rounded-3xl border border-outline-variant/10 overflow-hidden relative group shadow-lg"
    >
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(subject.id);
          }}
          className="p-2 bg-surface-container-high hover:bg-tertiary/10 text-on-surface-variant hover:text-tertiary rounded-xl shadow-sm transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div 
        className="p-6 cursor-pointer hover:bg-surface-container/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
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
              animate={{ rotate: isExpanded ? 90 : 0 }}
              className="text-on-surface-variant"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </div>
        </div>

        <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full"
            style={{ backgroundColor: subject.color, boxShadow: `0 0 10px ${subject.color}40` }}
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
            className="border-t border-outline-variant/10 bg-surface/30"
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
                        onOpenQuiz={() => onOpenQuiz(topic)}
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
