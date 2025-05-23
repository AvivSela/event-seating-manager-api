import { Request, Response } from "express";
import { Guest, CreateGuestDto, UpdateGuestDto, GuestStatus } from "../types/guest";
import { events } from "./eventController";
import { tableAssignments } from "./tableAssignmentController";
import { generateUUID, isValidUUID } from "../utils/uuid";

// In-memory storage for guests (replace with database in production)
export let guests: Guest[] = [];

// Validate guest data
export function validateGuest(data: CreateGuestDto | UpdateGuestDto): void {
  if ('partySize' in data && typeof data.partySize === 'number' && data.partySize < 1) {
    throw new Error("Party size must be at least 1");
  }
  
  if ('status' in data && data.status && !Object.values(GuestStatus).includes(data.status)) {
    throw new Error("Invalid guest status");
  }
}

// Create a new guest
export const createGuest = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { name, email, phone, partySize, status = GuestStatus.PENDING } = req.body;

    // Validate event ID format
    if (!isValidUUID(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    // Check if event exists
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Validate party size
    if (partySize !== undefined && partySize < 1) {
      return res.status(400).json({ message: 'Party size must be at least 1' });
    }

    // Validate required fields
    if (!name || !email || !phone || !partySize) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate phone format
    if (!/^\+?[\d\s-]+$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone format' });
    }

    // Validate guest status
    if (!Object.values(GuestStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid guest status' });
    }

    // Create guest
    const guest: Guest = {
      id: generateUUID(),
      eventId,
      name,
      email,
      phone,
      partySize,
      status,
      createdAt: new Date()
    };

    guests.push(guest);
    res.status(201).json(guest);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to create guest' });
  }
};

// Get all guests for an event with optional filtering
export const getEventGuests = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    if (!isValidUUID(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    // Check if event exists
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const assigned = req.query.assigned;
    let eventGuests = guests.filter(g => g.eventId === eventId);

    // Filter by assignment status if specified
    if (assigned !== undefined) {
      const isAssigned = assigned === 'true';
      const assignedGuestIds = new Set(tableAssignments.map(a => a.guestId));
      
      eventGuests = eventGuests.filter(guest => 
        isAssigned ? assignedGuestIds.has(guest.id) : !assignedGuestIds.has(guest.id)
      );
    }

    // Add assignment information to the response
    const guestsWithAssignments = eventGuests.map(guest => {
      const assignment = tableAssignments.find(a => a.guestId === guest.id);
      return {
        ...guest,
        tableAssignment: assignment ? {
          tableId: assignment.tableId,
          seatNumbers: assignment.seatNumbers,
          assignedAt: assignment.assignedAt
        } : undefined
      };
    });

    res.json(guestsWithAssignments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve guests" });
  }
};

// Get a specific guest
export const getGuest = async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.params;
    if (!isValidUUID(eventId) || !isValidUUID(guestId)) {
      return res.status(400).json({ message: "Invalid guest ID format" });
    }

    const guest = guests.find(g => g.id === guestId && g.eventId === eventId);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Add assignment information to the response
    const assignment = tableAssignments.find(a => a.guestId === guest.id);
    const guestWithAssignment = {
      ...guest,
      tableAssignment: assignment ? {
        tableId: assignment.tableId,
        seatNumbers: assignment.seatNumbers,
        assignedAt: assignment.assignedAt
      } : undefined
    };

    res.json(guestWithAssignment);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve guest" });
  }
};

// Update a guest
export const updateGuest = async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.params;
    if (!isValidUUID(eventId) || !isValidUUID(guestId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const guestIndex = guests.findIndex(g => g.id === guestId && g.eventId === eventId);
    if (guestIndex === -1) {
      return res.status(404).json({ message: "Guest not found" });
    }

    const updateData: UpdateGuestDto = req.body;
    validateGuest(updateData);

    const updatedGuest: Guest = {
      ...guests[guestIndex],
      ...updateData,
      updatedAt: new Date()
    };

    guests[guestIndex] = updatedGuest;
    res.json(updatedGuest);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update guest" });
  }
};

// Delete a guest
export const deleteGuest = async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.params;
    if (!isValidUUID(eventId) || !isValidUUID(guestId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const guestIndex = guests.findIndex(g => g.id === guestId && g.eventId === eventId);
    if (guestIndex === -1) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Delete any associated table assignments
    const assignmentIndex = tableAssignments.findIndex(a => a.guestId === guestId);
    if (assignmentIndex !== -1) {
      tableAssignments.splice(assignmentIndex, 1);
    }

    guests.splice(guestIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete guest" });
  }
}; 