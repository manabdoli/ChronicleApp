import { useState, useEffect } from 'react';
import { Event, CreateEventInput } from '../types';

const LOCAL_STORAGE_KEY = 'chronicle_events';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        // Convert ISO strings back to Date objects
        const formatted = parsed.map((e: any) => ({
          ...e,
          date: new Date(e.date),
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt)
        }));
        setEvents(formatted.sort((a: Event, b: Event) => a.date.getTime() - b.date.getTime()));
      } catch (error) {
        console.error('Failed to parse events from local storage', error);
      }
    }
    setLoading(false);
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
    }
  }, [events, loading]);

  const addEvent = async (input: CreateEventInput) => {
    const newEvent: Event = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEvents(prev => [...prev, newEvent].sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  const updateEvent = async (id: string, updates: Partial<CreateEventInput>) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          ...updates,
          updatedAt: new Date()
        };
      }
      return e;
    }).sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return { events, loading, user: { dummy: true }, addEvent, updateEvent, deleteEvent };
}
