import { Request, Response } from 'express';
import { Event, CreateEventDto, UpdateEventDto } from '../types/event';
import { venues } from './venueController';

export let events: Event[] = [];
let nextId = 1;

// For testing purposes
export const clearEvents = () => {
  events = [];
};

// Get all events
export const getAllEvents = (_req: Request, res: Response): void => {
  res.json(events);
};

// Get events by user ID
export const getEventsByUserId = (req: Request, res: Response): void => {
  const userId = parseInt(req.params.userId);
  const userEvents = events.filter(event => event.userId === userId);
  res.json(userEvents);
};

// Get event by ID
export const getEventById = (req: Request, res: Response): void => {
  const eventId = parseInt(req.params.id);
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }
  
  res.json(event);
};

// Create new event
export const createEvent = (
  req: Request<{}, {}, CreateEventDto & { userId: number }>,
  res: Response
): void => {
  const { type, title, description, date, userId, venueId } = req.body;

  if (!type || !title || !date || !userId || venueId === undefined) {
    res.status(400).json({ 
      message: 'Type, title, date, userId, and venueId are required' 
    });
    return;
  }

  // Validate venue exists
  const venue = venues.find(v => v.id === venueId);
  if (!venue) {
    res.status(400).json({ message: 'Venue not found' });
    return;
  }

  const newEvent: Event = {
    id: nextId++,
    userId,
    venueId,
    type,
    title,
    description: description || '',
    date: new Date(date),
    createdAt: new Date()
  };

  events.push(newEvent);
  res.status(201).json(newEvent);
};

// Update event
export const updateEvent = (
  req: Request<{ id: string }, {}, UpdateEventDto>,
  res: Response
): void => {
  const eventId = parseInt(req.params.id);
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }

  const { type, title, description, date, venueId } = req.body;

  // Validate venue exists if venueId is being updated
  if (venueId !== undefined) {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) {
      res.status(400).json({ message: 'Venue not found' });
      return;
    }
  }

  const updatedEvent: Event = {
    ...events[eventIndex],
    type: type || events[eventIndex].type,
    title: title || events[eventIndex].title,
    description: description || events[eventIndex].description,
    date: date ? new Date(date) : events[eventIndex].date,
    venueId: venueId !== undefined ? venueId : events[eventIndex].venueId,
    updatedAt: new Date()
  };

  events[eventIndex] = updatedEvent;
  res.json(updatedEvent);
};

// Delete event
export const deleteEvent = (req: Request, res: Response): void => {
  const eventId = parseInt(req.params.id);
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }

  events = events.filter(e => e.id !== eventId);
  res.status(204).send();
}; 