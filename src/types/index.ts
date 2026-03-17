export type View = 'dashboard' | 'tasks' | 'calendar' | 'habits' | 'subjects' | 'analytics' | 'weekly';

export interface Topic {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

export interface Section {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  title: string;
  sections: Section[];
  estimatedTimeRemaining: number; // in hours
  color: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  completedDays: string[]; // ISO dates
  xp: number;
  category: 'coding' | 'math' | 'theory' | 'general';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardXp: number;
  expiresAt: string;
  type?: string;
  completed?: boolean;
}

export type EventType = 'Exam' | 'Assignment' | 'Project' | 'Reminder' | 'Lab' | 'Presentation' | 'Study Session' | 'Habit Goal';

export interface CalendarEvent {
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

export interface Task {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  completed: boolean;
  active?: boolean;
}

export interface Note {
  id: string;
  title: string;
  time: string;
  color: string;
}

export interface Deadline {
  id: string;
  title: string;
  timeLeft: string;
  color: string;
}
