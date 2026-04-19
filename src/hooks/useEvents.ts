import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Event, CreateEventInput } from '../types';
import { onAuthStateChanged, User } from 'firebase/auth';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(eventData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addEvent = async (input: CreateEventInput) => {
    if (!user) return;

    await addDoc(collection(db, 'events'), {
      ...input,
      date: Timestamp.fromDate(input.date),
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateEvent = async (id: string, updates: Partial<CreateEventInput>) => {
    if (!user) return;

    const docRef = doc(db, 'events', id);
    const updatePayload: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.date) {
      updatePayload.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(docRef, updatePayload);
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'events', id));
  };

  return { events, loading, user, addEvent, updateEvent, deleteEvent };
}
