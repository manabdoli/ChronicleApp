import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isPast,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Event } from '../types';

interface CalendarProps {
  events: Event[];
  onSelectDate: (date: Date) => void | Promise<void>;
  selectedDate: Date | null;
}

export default function Calendar({ events, onSelectDate, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  return (
    <div className="glass-card rounded-[32px] overflow-hidden border border-white/20">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-accent" />
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
        {days.map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayIsPast = isPast(day) && !isToday(day);

          return (
            <div 
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "min-h-[110px] p-3 border-r border-b border-white/5 cursor-pointer transition-all relative group",
                !isCurrentMonth ? "opacity-20" : "hover:bg-white/5",
                isSelected && "bg-white/10 ring-2 ring-inset ring-accent/50 z-10",
                index % 7 === 6 && "border-r-0"
              )}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-transform",
                  isToday(day) ? "bg-accent text-slate-900 shadow-lg shadow-accent/20 scale-110" : 
                  (isSelected ? "text-accent" : (dayIsPast ? "text-white/30" : "text-white/80")),
                  "group-hover:scale-110"
                )}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-bold">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              
              <div className="mt-3 space-y-1.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <div 
                    key={event.id}
                    className={cn(
                      "text-[10px] truncate px-2 py-1 rounded-md border",
                      dayIsPast ? "bg-white/5 text-white/30 border-white/5" : "bg-accent/10 text-accent font-bold border-accent/20"
                    )}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[9px] text-white/30 font-bold text-center mt-1">
                    + {dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
