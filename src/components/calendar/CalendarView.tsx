import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Trash2, 
  Calendar, 
  Timer, 
  Bell, 
  Zap,
  RefreshCw
} from 'lucide-react';
import { CalendarEvent, EventType, Subject } from '../../types';

export const Countdown = ({ date }: { date: string }) => {
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

export const CalendarDay: React.FC<{ 
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
      className={`h-32 p-2 border-r border-b border-outline-variant/15 transition-colors group ${isToday ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-surface hover:bg-surface-container'} cursor-default`}
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
            className={`p-1 rounded-md border-l-2 text-[9px] font-bold truncate cursor-pointer hover:brightness-110 transition-all ${getTypeColor(event.type)}`}
          >
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarView = ({ events, onAddEvent, onDropTask, onDeleteEvent }: { events: CalendarEvent[], onAddEvent: () => void, onDropTask: (date: string) => void, onDeleteEvent: (id: string) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = (firstDayOfMonth(year, month) + 6) % 7; 

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
      <section className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tighter">{monthName} {year}</h2>
            <p className="font-label text-sm text-on-surface-variant">{events.filter(e => e.date.startsWith(`${year}-${(month + 1).toString().padStart(2, '0')}`)).length} events this month</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all border border-outline-variant/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all border border-outline-variant/10">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onAddEvent}
              className="ml-2 px-6 py-2 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-l border-outline-variant/10 rounded-tl-2xl overflow-hidden shadow-2xl">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
            <div key={day} className="py-4 text-center font-label text-[10px] font-bold text-outline border-r border-b border-outline-variant/10 bg-surface-container-low">{day}</div>
          ))}
          
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-32 bg-surface-dim/20 border-r border-b border-outline-variant/10"></div>
          ))}
          
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

      <AnimatePresence>
        {selectedEvent && (
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-96 bg-surface-container-low/95 backdrop-blur-xl p-8 border-l border-outline-variant/15 flex flex-col gap-8 absolute right-0 top-0 h-full z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                selectedEvent.type === 'Exam' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                selectedEvent.type === 'Assignment' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                selectedEvent.type === 'Project' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                'bg-green-500/20 text-green-500 border border-green-500/30'
              }`}>
                {selectedEvent.type}
              </span>
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-1">{selectedEvent.title}</h3>
                <p className="text-sm text-primary font-bold">{selectedEvent.subject}</p>
              </div>
              <button 
                onClick={() => {
                  onDeleteEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="p-3 bg-tertiary/10 hover:bg-tertiary/20 text-tertiary rounded-2xl transition-all"
                title="Delete Event"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 bg-surface-container/30 p-6 rounded-3xl border border-outline-variant/10">
              <div className="flex items-center gap-4 text-on-surface-variant">
                <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{new Date(selectedEvent.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
              <div className="flex items-center gap-4 text-on-surface-variant">
                <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center">
                  <Timer className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{selectedEvent.time}</span>
              </div>
              {selectedEvent.reminders.length > 0 && (
                <div className="flex items-center gap-4 text-on-surface-variant">
                  <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.reminders.map(r => (
                      <span key={r} className="px-3 py-1 bg-surface-container-highest text-primary border border-primary/20 rounded-lg text-[10px] font-bold">{r} before</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <div className="bg-surface-container/20 p-6 rounded-3xl border border-outline-variant/10">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Notes</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{selectedEvent.description}</p>
              </div>
            )}

            {selectedEvent.type === 'Exam' && (
              <div className="mt-auto p-6 bg-red-500/10 border border-red-500/20 rounded-3xl shadow-lg shadow-red-500/5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Countdown to Mastery</span>
                </div>
                <Countdown date={`${selectedEvent.date}T${selectedEvent.time}`} />
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
