import React, { useState, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Mail, 
  Mic, 
  FileText, 
  Calendar as CalendarIcon, 
  Clock, 
  Tag as TagIcon,
  Plus,
  Repeat
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { CreateEventInput, EventCategory, RecurrencePattern, Event } from '../types';

interface EventFormProps {
  initialDate?: Date;
  editingEvent?: Event | null;
  onSubmit: (data: CreateEventInput) => Promise<void>;
  onClose: () => void;
}

const categories: { id: EventCategory; label: string; icon: any; color: string }[] = [
  { id: 'note', label: 'Note', icon: FileText, color: 'indigo' },
  { id: 'photo', label: 'Photo', icon: Camera, color: 'emerald' },
  { id: 'audio', label: 'Voice', icon: Mic, color: 'rose' },
  { id: 'email', label: 'Email', icon: Mail, color: 'amber' },
];

export default function EventForm({ initialDate, editingEvent, onSubmit, onClose }: EventFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(initialDate || new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [category, setCategory] = useState<EventCategory>('note');
  const [recurring, setRecurring] = useState<RecurrencePattern>('none');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setDate(format(editingEvent.date.toDate(), "yyyy-MM-dd'T'HH:mm"));
      setCategory(editingEvent.category);
      setRecurring(editingEvent.recurring);
      setTags(editingEvent.tags);
    }
  }, [editingEvent]);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        date: new Date(date),
        category,
        recurring,
        tags,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl">
      <div className="glass w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 rounded-[32px] border border-white/30">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white">
            {editingEvent ? 'Edit Event' : 'Record New Event'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Quick Category Selection */}
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                  category === cat.id 
                    ? `border-accent bg-accent/20 text-accent ring-1 ring-accent`
                    : "border-white/10 hover:border-white/30 text-white/40"
                )}
              >
                <cat.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-1.5">Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is happening?"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-white placeholder-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/60 mb-1.5">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none text-white placeholder-white/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/60 mb-1.5 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-white/30" />
                  Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/60 mb-1.5 flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-white/30" />
                  Recurrence
                </label>
                <select
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value as RecurrencePattern)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none text-white"
                >
                  <option value="none" className="bg-slate-900">None</option>
                  <option value="daily" className="bg-slate-900">Daily</option>
                  <option value="weekly" className="bg-slate-900">Weekly</option>
                  <option value="monthly" className="bg-slate-900">Monthly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/60 mb-1.5 flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-white/30" />
                Tags (Max 10)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="e.g. fitness, work"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-white placeholder-white/20"
                />
                <button 
                  type="button"
                  onClick={handleAddTag}
                  disabled={tags.length >= 10 || !tagInput.trim()}
                  className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-30"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
                      {tag}
                      <button onClick={() => removeTag(tag)} type="button" className="p-0.5 hover:bg-white/10 rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title}
              className="flex-1 px-6 py-3 bg-accent text-slate-900 font-bold rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20 transition-all transition-colors active:scale-95"
            >
              {isSubmitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
