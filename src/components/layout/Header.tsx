import React from 'react';
import { Search, Bell, Timer } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: any;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenProfile }) => {
  return (
    <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15 px-10 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search resources, tasks, or notes..." 
            className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/50 text-on-surface placeholder:text-on-surface-variant/50 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 ml-10">
        <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full ring-2 ring-surface"></span>
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
          <Timer className="w-5 h-5" />
        </button>
        <div className="h-8 w-[1px] bg-outline-variant/30"></div>
        <div className="h-8 w-[1px] bg-outline-variant/30"></div>
        <button 
          onClick={onOpenProfile}
          className="flex items-center gap-3 p-1.5 pr-3 hover:bg-surface-container rounded-2xl transition-all group"
        >
          <div className="text-right">
            <span className="block text-xs font-black text-on-surface leading-none">{user.displayName || "Student Architect"}</span>
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Level {user.level || 1}</span>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all shadow-lg">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </button>
      </div>
    </header>
  );
};
