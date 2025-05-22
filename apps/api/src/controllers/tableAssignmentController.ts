import { Request, Response } from "express";
import { TableAssignment, CreateTableAssignmentDto, TableAssignmentError, TableAssignmentErrorCodes } from "../types/tableAssignment";
import { guests } from "./guestController";
import { venues } from "./venueController";
import { events } from "./eventController";
import { generateUUID, isValidUUID } from "../utils/uuid";
import { VenueFeature } from "../types/venue";

// In-memory storage for table assignments
export let tableAssignments: TableAssignment[] = [];

// Validate seat numbers against table capacity
function validateSeatNumbers(tableFeature: VenueFeature & { type: "table" }, seatNumbers: number[]): void {
  // Check if all seat numbers are within table capacity
  const invalidSeats = seatNumbers.filter(seatNum => seatNum < 1 || seatNum > tableFeature.numberOfSeats);
  if (invalidSeats.length > 0) {
    throw new TableAssignmentError(
      `Invalid seat numbers: ${invalidSeats.join(", ")}. Must be between 1 and ${tableFeature.numberOfSeats}`,
      TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
    );
  }

  // Check for duplicate seat numbers
  const uniqueSeats = new Set(seatNumbers);
  if (uniqueSeats.size !== seatNumbers.length) {
    throw new TableAssignmentError(
      "Duplicate seat numbers are not allowed",
      TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
    );
  }
}

// Check if seats are already assigned
function checkSeatAvailability(tableId: string, seatNumbers: number[], excludeGuestId?: string): void {
  const existingAssignments = tableAssignments.filter(
    assignment => assignment.tableId === tableId && 
    (!excludeGuestId || assignment.guestId !== excludeGuestId)
  );

  const occupiedSeats = new Set(existingAssignments.flatMap(a => a.seatNumbers));
  const conflictingSeats = seatNumbers.filter(seatNum => occupiedSeats.has(seatNum));

  if (conflictingSeats.length > 0) {
    throw new TableAssignmentError(
      `Seats ${conflictingSeats.join(", ")} are already assigned`,
      TableAssignmentErrorCodes.SEATS_ALREADY_ASSIGNED
    );
  }
}

// Create a new table assignment
export const createTableAssignment = async (req: Request, res: Response) => {
  try {
    const { eventId, tableId } = req.params;
    if (!isValidUUID(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const assignmentData: CreateTableAssignmentDto = {
      ...req.body,
      eventId,
      tableId
    };

    // Validate event exists
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Validate venue and table
    const venue = venues.find(v => v.id === event.venueId);
    if (!venue?.map) {
      return res.status(404).json({ message: "Venue or venue map not found" });
    }

    const tableFeature = venue.map.features.find(
      (f): f is VenueFeature & { type: "table" } => 
      f.type === "table" && f.tableNumber === tableId
    );

    if (!tableFeature) {
      throw new TableAssignmentError(
        "Table not found in venue",
        TableAssignmentErrorCodes.TABLE_NOT_FOUND
      );
    }

    // Validate guest exists and belongs to event
    const guest = guests.find(g => g.id === assignmentData.guestId && g.eventId === eventId);
    if (!guest) {
      throw new TableAssignmentError(
        "Guest not found or does not belong to this event",
        TableAssignmentErrorCodes.GUEST_NOT_FOUND
      );
    }

    // Check if guest is already assigned
    const existingAssignment = tableAssignments.find(
      a => a.guestId === assignmentData.guestId
    );
    if (existingAssignment) {
      throw new TableAssignmentError(
        "Guest is already assigned to a table",
        TableAssignmentErrorCodes.GUEST_ALREADY_ASSIGNED
      );
    }

    // Validate seat numbers
    validateSeatNumbers(tableFeature, assignmentData.seatNumbers);

    // Check seat availability
    checkSeatAvailability(tableId, assignmentData.seatNumbers);

    // Validate party size matches seat numbers
    if (assignmentData.seatNumbers.length !== guest.partySize) {
      throw new TableAssignmentError(
        `Number of seats (${assignmentData.seatNumbers.length}) must match party size (${guest.partySize})`,
        TableAssignmentErrorCodes.INVALID_PARTY_SIZE
      );
    }

    const assignment: TableAssignment = {
      id: generateUUID(),
      ...assignmentData,
      assignedAt: new Date(),
      createdAt: new Date()
    };

    tableAssignments.push(assignment);
    res.status(201).json(assignment);
  } catch (error) {
    if (error instanceof TableAssignmentError) {
      res.status(400).json({ 
        message: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create table assignment"
      });
    }
  }
};

// Get all assignments for a table
export const getTableAssignments = async (req: Request, res: Response) => {
  try {
    const { eventId, tableId } = req.params;
    if (!isValidUUID(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    // Validate event and table exist
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const venue = venues.find(v => v.id === event.venueId);
    if (!venue?.map) {
      return res.status(404).json({ message: "Venue or venue map not found" });
    }

    const tableFeature = venue.map.features.find(
      (f): f is VenueFeature & { type: "table" } => 
      f.type === "table" && f.tableNumber === tableId
    );

    if (!tableFeature) {
      throw new TableAssignmentError(
        "Table not found in venue",
        TableAssignmentErrorCodes.TABLE_NOT_FOUND
      );
    }

    const assignments = tableAssignments.filter(
      a => a.eventId === eventId && a.tableId === tableId
    );

    res.json(assignments);
  } catch (error) {
    if (error instanceof TableAssignmentError) {
      res.status(400).json({ 
        message: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({ message: "Failed to retrieve table assignments" });
    }
  }
};

// Delete a table assignment
export const deleteTableAssignment = async (req: Request, res: Response) => {
  try {
    const { eventId, tableId, guestId } = req.params;
    if (!isValidUUID(eventId) || !isValidUUID(guestId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Validate event and table exist
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const venue = venues.find(v => v.id === event.venueId);
    if (!venue?.map) {
      return res.status(404).json({ message: "Venue or venue map not found" });
    }

    const tableFeature = venue.map.features.find(
      (f): f is VenueFeature & { type: "table" } => 
      f.type === "table" && f.tableNumber === tableId
    );

    if (!tableFeature) {
      throw new TableAssignmentError(
        "Table not found in venue",
        TableAssignmentErrorCodes.TABLE_NOT_FOUND
      );
    }

    const assignmentIndex = tableAssignments.findIndex(
      a => a.eventId === eventId && a.tableId === tableId && a.guestId === guestId
    );

    if (assignmentIndex === -1) {
      return res.status(404).json({ message: "Table assignment not found" });
    }

    tableAssignments.splice(assignmentIndex, 1);
    res.status(204).send();
  } catch (error) {
    if (error instanceof TableAssignmentError) {
      res.status(400).json({ 
        message: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({ message: "Failed to delete table assignment" });
    }
  }
}; 