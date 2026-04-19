/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LogIn, 
  Plus, 
  Calendar as CalendarIcon, 
  List as ListIcon, 
  Search, 
  Filter,
  LogOut,
  Sparkles,
  Tag as TagIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useEvents } from './hooks/useEvents';
import Calendar from './components/Calendar';
import EventCard from './components/EventCard';
import EventForm from './components/EventForm';
import { Event, CreateEventInput } from './types';
import { cn } from './lib/utils';

export default function App() {
  const { events, loading, user, addEvent, updateEvent, deleteEvent } = useEvents();
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    events.forEach(e => e.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           e.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || e.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [events, searchQuery, selectedTag]);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  const handleSubmitForm = async (data: CreateEventInput) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, data);
    } else {
      await addEvent(data);
    }
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-accent rounded-full animate-spin" />
          <p className="text-white/60 font-medium animate-pulse">Synchronizing your events...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex p-4 glass rounded-3xl shadow-2xl rotate-3">
            <Sparkles className="w-10 h-10 text-accent" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-white tracking-tight">Chronicle</h1>
            <p className="text-lg text-white/70 leading-relaxed font-medium">
              Your personal event log. Record photos, audio, emails, and notes in one seamless calendar.
            </p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full group relative flex items-center justify-center gap-4 py-4 px-6 glass text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all active:scale-[0.98] shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <LogIn className="w-6 h-6 text-accent" />
            Continue with Google
          </button>
          <p className="text-xs text-white/40 font-medium tracking-wide uppercase">Securely stored with Firebase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl h-full min-h-[85vh] glass rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/30">
        {/* Sidebar */}
        <aside className="w-full md:w-72 md:h-full bg-white/5 border-r border-white/10 p-6 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/20 rounded-xl">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Chronicle</h1>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => { setEditingEvent(null); setIsFormOpen(true); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent text-slate-900 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-accent/20 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            New Event
          </button>

          <nav className="space-y-6">
            <div className="space-y-1">
              <h2 className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">View Mode</h2>
              {[
                { id: 'list', label: 'Dashboard', icon: ListIcon },
                { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm",
                    view === item.id 
                      ? "bg-white/10 text-accent" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 mb-3">
                <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tags</h2>
                {selectedTag && (
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className="text-[10px] text-accent font-bold hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 px-3">
                {allTags.length > 0 ? (
                  allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                        tag === selectedTag 
                          ? "bg-white border-white text-slate-900 shadow-md"
                          : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                      )}
                    >
                      <TagIcon className="w-3 h-3" />
                      {tag}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-white/30 italic">No tags yet</p>
                )}
              </div>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-3">
            <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-white/20" referrerPolicy="no-referrer" />
            <div className="overflow-hidden text-white">
              <p className="text-sm font-bold truncate">{user.displayName}</p>
              <p className="text-[11px] text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <p className="text-sm font-bold text-accent uppercase tracking-widest mb-1">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
              <h2 className="text-3xl font-black tracking-tight text-white">
                {view === 'calendar' ? 'Events Calendar' : 'Active Events'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent w-full md:w-64 transition-all text-white placeholder-white/30"
                />
              </div>
            </div>
          </header>

          {view === 'calendar' ? (
            <div className="animate-in fade-in duration-500">
              <Calendar 
                events={filteredEvents} 
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setView('list');
                }}
                selectedDate={selectedDate}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <EventCard 
                    key={event.id}
                    event={event}
                    onEdit={(e) => { setEditingEvent(e); setIsFormOpen(true); }}
                    onDelete={deleteEvent}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="inline-flex p-5 bg-white/5 rounded-3xl mb-6">
                    <Sparkles className="w-12 h-12 text-white/20" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
                  <p className="text-white/50 max-w-xs mx-auto mb-8 font-medium">Record your first event or adjust your filters to see results.</p>
                  <button 
                    onClick={() => setIsFormOpen(true)}
                    className="px-6 py-3 bg-accent text-slate-900 font-bold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-accent/10"
                  >
                    Create Your First Event
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {(isFormOpen || editingEvent) && (
        <EventForm 
          initialDate={selectedDate || new Date()}
          editingEvent={editingEvent}
          onSubmit={handleSubmitForm}
          onClose={() => { setIsFormOpen(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
}
