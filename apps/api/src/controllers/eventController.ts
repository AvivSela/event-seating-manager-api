import { Request, Response } from "express";
import { Event, CreateEventDto, UpdateEventDto } from "../types/event";
import { venues } from "./venueController";
import { generateUUID, isValidUUID } from "../utils/uuid";

export let events: Event[] = [];

// Get all events
export const getAllEvents = (_req: Request, res: Response): void => {
  try {
    const allEvents = events.slice(); // This will throw if events is mocked to throw
    res.json(allEvents);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve events" });
  }
};

// Get events by user ID
export const getEventsByUserId = (req: Request, res: Response): void => {
  const userId = req.params.userId;

  if (!isValidUUID(userId)) {
    res.status(400).json({ message: "Invalid user ID format" });
    return;
  }

  const userEvents = events.filter((e) => e.userId === userId);
  res.json(userEvents);
};

// Get event by ID
export const getEventById = (req: Request, res: Response): void => {
  try {
    const eventId = req.params.id;

    if (!isValidUUID(eventId)) {
      res.status(400).json({ message: "Invalid event ID format" });
      return;
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve event" });
  }
};

// Create new event
export const createEvent = (
  req: Request<{}, {}, CreateEventDto>,
  res: Response,
): void => {
  try {
    const { type, title, description, date, userId, venueId, expectedGuests } = req.body;

    if (!type || !title || !date || !userId || venueId === undefined) {
      res.status(400).json({
        message: "Type, title, date, userId, and venueId are required",
      });
      return;
    }

    if (!isValidUUID(userId)) {
      res.status(400).json({ message: "Invalid user ID format" });
      return;
    }

    if (!isValidUUID(venueId)) {
      res.status(400).json({ message: "Invalid venue ID format" });
      return;
    }

    // Validate venue exists
    const venue = venues.find((v) => v.id === venueId);
    if (!venue) {
      res.status(400).json({ message: "Venue not found" });
      return;
    }

    // Validate event date is in the future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      res.status(400).json({ message: "Event date must be in the future" });
      return;
    }

    // Validate venue capacity if expected guests is provided
    if (expectedGuests && expectedGuests > venue.capacity) {
      res.status(400).json({ message: "Expected guests exceed venue capacity" });
      return;
    }

    // Check for venue schedule conflicts
    const existingEvent = events.find(
      (e) => e.venueId === venueId && 
      new Date(e.date).toDateString() === eventDate.toDateString()
    );
    if (existingEvent) {
      res.status(400).json({ message: "Venue is already booked for this date" });
      return;
    }

    const newEvent: Event = {
      id: generateUUID(),
      userId,
      venueId,
      type,
      title,
      description: description || "",
      date: eventDate,
      createdAt: new Date(),
    };

    events.push(newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to create event" });
  }
};

// Update event
export const updateEvent = (
  req: Request<{ id: string }, {}, UpdateEventDto>,
  res: Response,
): void => {
  try {
    const eventId = req.params.id;

    if (!isValidUUID(eventId)) {
      res.status(400).json({ message: "Invalid event ID format" });
      return;
    }

    const eventIndex = events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const { type, title, description, date, venueId } = req.body;

    if (venueId !== undefined) {
      if (!isValidUUID(venueId)) {
        res.status(400).json({ message: "Invalid venue ID format" });
        return;
      }

      // Validate venue exists
      const venue = venues.find((v) => v.id === venueId);
      if (!venue) {
        res.status(400).json({ message: "Venue not found" });
        return;
      }

      // Validate venue capacity with existing guests
      const existingGuests = (global as any).guests?.filter((g: any) => g.eventId === eventId) || [];
      const totalPartySize = existingGuests.reduce((sum: number, guest: any) => sum + guest.partySize, 0);
      if (totalPartySize > venue.capacity) {
        res.status(400).json({ message: "New venue capacity cannot accommodate existing guests" });
        return;
      }
    }

    // Validate updated date if provided
    if (date) {
      const eventDate = new Date(date);
      if (eventDate <= new Date()) {
        res.status(400).json({ message: "Event date must be in the future" });
        return;
      }

      // Check for venue schedule conflicts
      const targetVenueId = venueId || events[eventIndex].venueId;
      const existingEvent = events.find(
        (e) => e.id !== eventId && 
        e.venueId === targetVenueId && 
        new Date(e.date).toDateString() === eventDate.toDateString()
      );
      if (existingEvent) {
        res.status(400).json({ message: "Venue is already booked for this date" });
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
      updatedAt: new Date(),
    };

    events[eventIndex] = updatedEvent;
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event" });
  }
};

// Delete event
export const deleteEvent = (req: Request, res: Response): void => {
  try {
    const eventId = req.params.id;

    if (!isValidUUID(eventId)) {
      res.status(400).json({ message: "Invalid event ID format" });
      return;
    }

    const eventIndex = events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    events = events.filter((e) => e.id !== eventId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
};
