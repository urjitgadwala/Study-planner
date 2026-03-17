import React from 'react';
import { 
  Book, 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Repeat, 
  BarChart3, 
  Sparkles,
  LogOut 
} from 'lucide-react';
import { View } from '../../types';
import { User } from 'firebase/auth';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  user: User;
  onLogout: () => void;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick?: () => void 
}) => (
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

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, user, onLogout }) => {
  return (
    <aside className="w-64 bg-surface-container-low border-r border-outline-variant/15 flex flex-col fixed h-full z-50">
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-lg shadow-primary/20">
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
        <div className="bg-surface-container rounded-2xl p-4 flex items-center gap-3 border border-outline-variant">
          <img 
            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} 
            alt={user.displayName || "Student"} 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-on-surface truncate">{user.displayName || "Student"}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-surface-container-highest/50 rounded-xl text-on-surface-variant hover:text-tertiary transition-colors text-xs font-bold border border-outline-variant"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
