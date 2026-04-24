export type EventCategory = 'photo' | 'email' | 'audio' | 'note';
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  category: EventCategory;
  mediaUrl?: string;
  tags: string[];
  recurring: RecurrencePattern;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: Date;
  category: EventCategory;
  mediaUrl?: string;
  tags: string[];
  recurring: RecurrencePattern;
}
