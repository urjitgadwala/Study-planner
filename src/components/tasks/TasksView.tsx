import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Bell, 
  BarChart3, 
  Timer,
  CheckSquare,
  Clock
} from 'lucide-react';
import { Task } from '../../types';
import { EmptyState } from '../common/EmptyState';

export const TaskCard = ({ tag, title, desc, date, completed, onToggle, onDelete, isLowPriority }: any) => (
  <motion.div
    layout
    className={`p-5 rounded-2xl border transition-all group relative ${
      completed
        ? 'bg-surface/50 border-transparent opacity-60'
        : 'bg-surface-container/40 border-outline-variant/10 hover:border-primary/30 hover:shadow-lg'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
        isLowPriority ? 'bg-surface-container-highest text-on-surface-variant' : 'bg-primary/10 text-primary'
      }`}>
        {tag}
      </span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-tertiary/10 text-on-surface-variant hover:text-tertiary rounded-lg transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="flex items-center gap-4">
      <div
        onClick={onToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
          completed ? 'bg-secondary border-secondary' : 'border-outline-variant group-hover:border-primary'
        }`}
      >
        {completed && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
      <div className="flex-1">
        <h4 className={`text-sm font-bold text-on-surface ${completed ? 'line-through' : ''}`}>{title}</h4>
        <p className="text-[10px] text-on-surface-variant line-clamp-1">{desc}</p>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-outline-variant/5 flex justify-between items-center">
      <span className="text-[10px] font-bold text-on-surface-variant">{date}</span>
      {!completed && !isLowPriority && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
    </div>
  </motion.div>
);

export const StatCard = ({ icon: Icon, value, label, color, bgColor }: any) => (
  <div className="bg-surface-container-low/50 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/10 flex items-center gap-6">
    <div className={`w-12 h-12 ${bgColor} ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-headline font-black text-on-surface leading-tight">{value}</p>
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">{label}</p>
    </div>
  </div>
);

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, onToggleTask, onDeleteTask, onAddTask }) => {
  return (
    <motion.div 
      key="tasks"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-10 space-y-10 max-w-[1600px]"
    >
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-2 text-on-surface">Engineering Roadmap</h2>
          <p className="font-body text-on-surface-variant">Manage your high-stakes deliverables and daily sprint items.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onAddTask}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary rounded-xl text-on-primary text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState 
          icon={CheckSquare}
          title="No Tasks Today"
          description="Your schedule is clear! Add a task to start tracking your daily engineering milestones."
          actionLabel="Add First Task"
          onAction={onAddTask}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-tertiary px-2">Pending Tasks</h3>
              <div className="space-y-4">
                {tasks.filter(t => !t.completed).map(task => (
                  <TaskCard 
                    key={task.id}
                    tag="Engineering" 
                    title={task.title} 
                    desc={task.subtitle} 
                    date={task.time}
                    completed={task.completed}
                    onToggle={() => onToggleTask(task.id)}
                    onDelete={() => onDeleteTask(task.id)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-primary px-2">Completed</h3>
              <div className="space-y-4">
                {tasks.filter(t => t.completed).map(task => (
                  <TaskCard 
                    key={task.id}
                    tag="Done" 
                    title={task.title} 
                    desc={task.subtitle} 
                    date={task.time}
                    completed={task.completed}
                    onToggle={() => onToggleTask(task.id)}
                    onDelete={() => onDeleteTask(task.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard icon={CheckCircle} value={tasks.filter(t => t.completed).length.toString()} label="Tasks Done" color="text-primary" bgColor="bg-primary/10" />
            <StatCard icon={Bell} value={tasks.filter(t => !t.completed).length.toString()} label="Urgent Items" color="text-tertiary" bgColor="bg-tertiary/10" />
            <StatCard icon={BarChart3} value="82%" label="Efficiency" color="text-secondary" bgColor="bg-secondary/10" />
            <StatCard icon={Timer} value="06" label="In Backlog" color="text-on-surface-variant" bgColor="bg-on-surface-variant/10" />
          </div>
        </>
      )}
    </motion.div>
  );
};
