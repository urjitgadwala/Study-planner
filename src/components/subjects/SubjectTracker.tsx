import React from 'react';
import { motion } from 'motion/react';
import { Plus, BookOpen, LayoutGrid, List as ListIcon } from 'lucide-react';
import { SubjectCard } from './SubjectComponents';
import { Subject } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface SubjectTrackerProps {
  subjects: Subject[];
  onToggleTopic: (sId: string, tId: string) => void;
  onSaveNotes: (sId: string, tId: string, notes: string) => void;
  onAddSubject: () => void;
  onDeleteSubject: (id: string) => void;
  onOpenQuiz: (subjectTitle: string, topic: any) => void;
  onOpenMaterial: () => void;
  viewMode?: 'grid' | 'list';
}

export const SubjectTracker: React.FC<SubjectTrackerProps> = ({ 
  subjects, 
  onToggleTopic, 
  onSaveNotes, 
  onAddSubject, 
  onDeleteSubject,
  onOpenQuiz,
  onOpenMaterial,
  viewMode = 'grid'
}) => {
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
          <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-2 text-on-surface">Academic Syllabus</h2>
          <p className="font-body text-on-surface-variant">Track your mastery across engineering core subjects.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Overall Completion</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-headline font-black text-primary">{overallProgress}%</span>
              <div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          </div>
          <button 
            onClick={onAddSubject}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary rounded-xl text-on-primary text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="mt-8">
          <EmptyState 
            icon={BookOpen}
            title="No Subjects Yet"
            description="Start by manually adding a subject or let the Material Architect build a roadmap from your notes."
            actionLabel="Material Architect"
            onAction={onOpenMaterial}
          />
        </div>
      ) : (
        <div className={`mt-8 grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {subjects.map((subject) => (
            <SubjectCard 
              key={subject.id} 
              subject={subject} 
              onToggleTopic={onToggleTopic}
              onSaveNotes={onSaveNotes}
              onDelete={() => onDeleteSubject(subject.id)}
              onOpenQuiz={(topic) => onOpenQuiz(subject.title, topic)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
