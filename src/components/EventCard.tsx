import React from 'react';
import { 
  Camera, 
  Mail, 
  Mic, 
  FileText, 
  Clock, 
  Tag as TagIcon, 
  Trash2, 
  Edit3,
  Repeat
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '../lib/utils';
import { Event, EventCategory } from '../types';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void | Promise<void>;
  key?: string | number;
}

const CategoryIcon = ({ category, className }: { category: EventCategory, className?: string }) => {
  switch (category) {
    case 'photo': return <Camera className={className} />;
    case 'email': return <Mail className={className} />;
    case 'audio': return <Mic className={className} />;
    case 'note': return <FileText className={className} />;
  }
};

const categoryColors = {
  photo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  email: 'bg-amber-100 text-amber-700 border-amber-200',
  audio: 'bg-rose-100 text-rose-700 border-rose-200',
  note: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const eventDate = event.date;
  const isEventPast = isPast(eventDate) && !isToday(eventDate);

  return (
    <div className={cn(
      "group relative glass-card rounded-2xl p-5 border transition-all hover:bg-white/10 hover:shadow-xl",
      isEventPast ? "border-past/30 bg-past/5" : "border-white/20",
      event.recurring !== 'none' && "border-l-4 border-l-accent"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-xl border",
            isEventPast ? "bg-past/20 text-past border-past/30" : "bg-white/10 text-white border-white/10"
          )}>
            <CategoryIcon category={event.category} className="w-5 h-5" />
          </div>
          <div>
            <h3 className={cn(
              "text-lg font-bold line-clamp-1",
              isEventPast ? "text-past" : "text-white"
            )}>
              {event.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/50">
                <Clock className="w-3.5 h-3.5" />
                {format(eventDate, 'MMM d, h:mm a')}
              </span>
              {event.recurring !== 'none' && (
                <span className="flex items-center gap-1 text-[10px] text-accent font-bold uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-md">
                  <Repeat className="w-3 h-3" />
                  {event.recurring}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(event)}
            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(event.id)}
            className="p-2 hover:bg-past/20 rounded-lg text-white/40 hover:text-past"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {event.description && (
        <p className={cn(
          "mt-4 text-sm leading-relaxed line-clamp-2",
          isEventPast ? "text-white/40" : "text-white/70"
        )}>
          {event.description}
        </p>
      )}

      {event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {event.tags.map(tag => (
            <span 
              key={tag}
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                isEventPast 
                  ? "bg-past/10 text-past border-past/20" 
                  : "bg-white/5 text-white/40 border-white/10"
              )}
            >
              <TagIcon className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {isEventPast && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-past/20 text-past text-[10px] font-black uppercase tracking-widest">
          Passed
        </div>
      )}
    </div>
  );
}
