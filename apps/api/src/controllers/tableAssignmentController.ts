import { Request, Response } from "express";
import { TableAssignment, CreateTableAssignmentDto, TableAssignmentError, TableAssignmentErrorCodes } from "../types/tableAssignment";
import { guests } from "./guestController";
import { venues } from "./venueController";
import { events } from "./eventController";
import { generateUUID, isValidUUID } from "../utils/uuid";
import { VenueFeature, TableFeature } from "../types/venue";

// In-memory storage for table assignments
export let tableAssignments: TableAssignment[] = [];

// Validate seat numbers against table capacity
export function validateSeatNumbers(tableFeature: VenueFeature & { type: "table" }, seatNumbers: number[]): void {
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
export function checkSeatAvailability(tableId: string, seatNumbers: number[], excludeGuestId?: string): void {
  const existingAssignments = tableAssignments.filter(
    assignment => assignment.tableId === tableId && 
    (!excludeGuestId || assignment.guestId !== excludeGuestId)
  );

  const occupiedSeats = new Set(existingAssignments.flatMap(a => a.seatNumbers));
  const conflictingSeats = seatNumbers.filter(seatNum => occupiedSeats.has(seatNum));

  if (conflictingSeats.length > 0) {
    throw new TableAssignmentError(
      `Seats ${conflictingSeats.join(", ")} are already assigned`,
      TableAssignmentErrorCodes.SEAT_ALREADY_ASSIGNED
    );
  }
}

// Get all table assignments for a table
export const getTableAssignments = (req: Request, res: Response): void => {
  try {
    const { eventId, tableId } = req.params;

    if (!isValidUUID(eventId)) {
      res.status(400).json({
        message: 'Invalid event ID format',
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      });
      return;
    }

    if (!isValidUUID(tableId)) {
      res.status(400).json({
        message: 'Invalid table ID format',
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      });
      return;
    }

    // Check if event exists
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      res.status(404).json({
        message: 'Event not found',
        code: TableAssignmentErrorCodes.EVENT_NOT_FOUND
      });
      return;
    }

    // Check if venue exists and has a map
    const venue = venues.find((v) => v.id === event.venueId);
    if (!venue || !venue.map) {
      res.status(404).json({
        message: 'Venue or venue map not found',
        code: TableAssignmentErrorCodes.VENUE_NOT_FOUND
      });
      return;
    }

    // Check if table exists in venue
    const table = venue.map.features.find((f): f is TableFeature => 
      f.type === 'table' && f.tableNumber === tableId
    );
    if (!table) {
      res.status(400).json({
        message: 'Table not found in venue',
        code: TableAssignmentErrorCodes.TABLE_NOT_FOUND
      });
      return;
    }

    const assignments = tableAssignments.filter(
      (a) => a.eventId === eventId && a.tableId === tableId
    );

    res.json(assignments);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve table assignments',
      code: TableAssignmentErrorCodes.INTERNAL_ERROR
    });
  }
};

// Create a table assignment
export const createTableAssignment = (req: Request, res: Response): void => {
  try {
    const { eventId, tableId } = req.params;
    const { guestId, seatNumbers } = req.body;

    // Validate UUIDs
    if (!isValidUUID(eventId)) {
      res.status(400).json({
        message: 'Invalid event ID format',
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      });
      return;
    }

    if (!isValidUUID(tableId)) {
      res.status(400).json({
        message: 'Invalid table ID format',
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      });
      return;
    }

    if (!isValidUUID(guestId)) {
      res.status(400).json({
        message: 'Invalid guest ID format',
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      });
      return;
    }

    // Check if event exists
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      res.status(404).json({
        message: 'Event not found',
        code: TableAssignmentErrorCodes.EVENT_NOT_FOUND
      });
      return;
    }

    // Check if venue exists and has a map
    const venue = venues.find((v) => v.id === event.venueId);
    if (!venue || !venue.map) {
      res.status(404).json({
        message: 'Venue or venue map not found',
        code: TableAssignmentErrorCodes.VENUE_NOT_FOUND
      });
      return;
    }

    // Check if table exists in venue
    const table = venue.map.features.find((f): f is TableFeature => 
      f.type === 'table' && f.tableNumber === tableId
    );
    if (!table) {
      res.status(400).json({
        message: 'Table not found in venue',
        code: TableAssignmentErrorCodes.TABLE_NOT_FOUND
      });
      return;
    }

    // Check if guest exists and belongs to the event
    const guest = guests.find((g) => g.id === guestId && g.eventId === eventId);
    if (!guest) {
      res.status(400).json({
        message: 'Guest not found or does not belong to this event',
        code: TableAssignmentErrorCodes.GUEST_NOT_FOUND
      });
      return;
    }

    // Validate seat numbers
    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      res.status(400).json({
        message: 'Seat numbers are required',
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      });
      return;
    }

    // Check if all seat numbers are valid numbers
    const hasInvalidNumbers = seatNumbers.some(seat => 
      typeof seat !== 'number' || 
      isNaN(seat) || 
      !Number.isInteger(seat)
    );
    if (hasInvalidNumbers) {
      res.status(400).json({
        message: 'Invalid seat numbers',
        code: TableAssignmentErrorCodes.INVALID_SEAT_NUMBERS
      });
      return;
    }

    // Check if seat numbers match party size
    if (seatNumbers.length !== guest.partySize) {
      res.status(400).json({
        message: 'Number of seats must match party size',
        code: TableAssignmentErrorCodes.INVALID_PARTY_SIZE
      });
      return;
    }

    // Validate seat numbers against table capacity
    validateSeatNumbers(table, seatNumbers);

    // Check if seats are already taken
    checkSeatAvailability(tableId, seatNumbers);

    // Check if guest is already assigned
    const existingAssignment = tableAssignments.find(
      (a) => a.guestId === guestId && a.eventId === eventId
    );
    if (existingAssignment) {
      res.status(400).json({
        message: 'Guest is already assigned to a table',
        code: TableAssignmentErrorCodes.GUEST_ALREADY_ASSIGNED
      });
      return;
    }

    // Create table assignment
    const assignment: TableAssignment = {
      id: generateUUID(),
      eventId,
      tableId,
      guestId,
      seatNumbers,
      createdAt: new Date(),
      assignedAt: new Date()
    };

    tableAssignments.push(assignment);
    res.status(201).json(assignment);
  } catch (error) {
    if (error instanceof TableAssignmentError) {
      res.status(400).json({
        message: error.message,
        code: error.code
      });
      return;
    }
    res.status(500).json({
      message: 'Failed to create table assignment',
      code: TableAssignmentErrorCodes.INTERNAL_ERROR
    });
  }
};

// Delete a table assignment
export const deleteTableAssignment = (req: Request, res: Response): void => {
  try {
    const { eventId, tableId, guestId } = req.params;

    // Validate UUIDs
    if (!isValidUUID(eventId)) {
      res.status(400).json({
        message: 'Invalid event ID format',
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      });
      return;
    }

    if (!isValidUUID(tableId)) {
      res.status(400).json({
        message: 'Invalid table ID format',
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      });
      return;
    }

    if (!isValidUUID(guestId)) {
      res.status(400).json({
        message: 'Invalid ID format',
        code: TableAssignmentErrorCodes.INVALID_ID_FORMAT
      });
      return;
    }

    // Check if event exists
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      res.status(404).json({
        message: 'Event not found',
        code: TableAssignmentErrorCodes.EVENT_NOT_FOUND
      });
      return;
    }

    // Check if venue exists and has a map
    const venue = venues.find((v) => v.id === event.venueId);
    if (!venue || !venue.map) {
      res.status(404).json({
        message: 'Venue or venue map not found',
        code: TableAssignmentErrorCodes.VENUE_NOT_FOUND
      });
      return;
    }

    // Check if table exists in venue
    const table = venue.map.features.find((f): f is TableFeature => 
      f.type === 'table' && f.tableNumber === tableId
    );
    if (!table) {
      res.status(400).json({
        message: 'Table not found in venue',
        code: TableAssignmentErrorCodes.TABLE_NOT_FOUND
      });
      return;
    }

    // Find the assignment
    const assignmentIndex = tableAssignments.findIndex(
      (a) =>
        a.eventId === eventId &&
        a.tableId === tableId &&
        a.guestId === guestId
    );

    if (assignmentIndex === -1) {
      res.status(404).json({
        message: 'Table assignment not found',
        code: TableAssignmentErrorCodes.ASSIGNMENT_NOT_FOUND
      });
      return;
    }

    // Remove the assignment
    tableAssignments.splice(assignmentIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete table assignment',
      code: TableAssignmentErrorCodes.INTERNAL_ERROR
    });
  }
}; 