import request from "supertest";
import express from "express";
import tableAssignmentRoutes from "../tableAssignmentRoutes";
import { tableAssignments } from "../../controllers/tableAssignmentController";
import { guests } from "../../controllers/guestController";
import { venues } from "../../controllers/venueController";
import { events } from "../../controllers/eventController";
import { generateUUID } from "../../utils/uuid";
import { GuestStatus } from "../../types/guest";
import { EventType, Event } from "../../types/event";
import { TableAssignment } from "../../types/tableAssignment";
import { Venue, VenueFeature } from "../../types/venue";

const app = express();
app.use(express.json());
app.use("/api", tableAssignmentRoutes);

describe("Table Assignment Routes", () => {
  const testEventId = generateUUID();
  const testUserId = generateUUID();
  const testVenueId = generateUUID();
  const testTableId = generateUUID();
  const testGuestId = generateUUID();

  beforeEach(() => {
    // Clear arrays before each test
    tableAssignments.length = 0;
    guests.length = 0;
    venues.length = 0;
    events.length = 0;

    // Add test event
    const testEvent: Event = {
      id: testEventId,
      userId: testUserId,
      venueId: testVenueId,
      title: "Test Event",
      description: "Test Event Description",
      date: new Date(),
      type: EventType.WEDDING,
      createdAt: new Date(),
    };
    events.push(testEvent);

    // Add test venue with table
    const testVenue: Venue = {
      id: testVenueId,
      name: "Test Venue",
      address: "123 Test St",
      description: "Test Venue Description",
      capacity: 100,
      map: {
        dimensions: { width: 100, height: 100 },
        features: [
          {
            type: "table" as const,
            tableNumber: testTableId,
            position: { x: 10, y: 20 },
            numberOfSeats: 8,
            guests: [],
            shape: "rectangular",
            dimensions: { width: 10, height: 5 },
          },
        ],
      },
      createdAt: new Date(),
    };
    venues.push(testVenue);

    // Add test guest
    const testGuest = {
      id: testGuestId,
      eventId: testEventId,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      partySize: 2,
      status: GuestStatus.CONFIRMED,
      createdAt: new Date(),
    };
    guests.push(testGuest);
  });

  describe("POST /events/:eventId/tables/:tableId/assignments", () => {
    it("should create table assignment with valid data", async () => {
      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: [1, 2],
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(201);
      expect(response.body.guestId).toBe(testGuestId);
      expect(response.body.tableId).toBe(testTableId);
      expect(response.body.seatNumbers).toEqual([1, 2]);
    });

    it("should validate seat numbers against table capacity", async () => {
      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: [9, 10], // Table only has 8 seats
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid seat numbers");
    });

    it("should prevent duplicate seat assignments", async () => {
      // Create first assignment
      const assignment1: TableAssignment = {
        id: generateUUID(),
        eventId: testEventId,
        tableId: testTableId,
        guestId: generateUUID(),
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date(),
      };
      tableAssignments.push(assignment1);

      // Try to assign same seats to another guest
      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: [1, 3], // Seat 1 is already taken
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("already assigned");
    });

    it("should validate party size matches seat numbers", async () => {
      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: [1, 2, 3], // Guest party size is 2
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Number of seats must match party size");
    });

    it("should prevent assigning already assigned guest", async () => {
      // Create first assignment
      const existingAssignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEventId,
        tableId: generateUUID(),
        guestId: testGuestId,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date(),
      };
      tableAssignments.push(existingAssignment);

      // Try to assign same guest to another table
      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: [3, 4],
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Guest is already assigned to a table");
    });

    it("should validate seat number format", async () => {
      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: ["1", "2"], // Invalid: strings instead of numbers
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid seat numbers");
    });

    it("should validate non-integer seat numbers", async () => {
      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: [1.5, 2.7], // Invalid: floating point numbers
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid seat numbers");
    });

    it("should validate NaN seat numbers", async () => {
      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: [NaN, 2], // Invalid: NaN
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid seat numbers");
    });

    it("should require seat numbers array", async () => {
      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: null, // Invalid: not an array
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Seat numbers are required");
    });

    it("should require non-empty seat numbers array", async () => {
      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: [], // Invalid: empty array
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Seat numbers are required");
    });

    it("should handle non-existent guest", async () => {
      const assignmentData = {
        guestId: generateUUID(), // Non-existent guest ID
        seatNumbers: [1, 2],
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Guest not found or does not belong to this event");
    });

    // Note: We don't test internal errors (500) here because:
    // 1. We're already testing all error cases that could happen in normal operation
    // 2. Forcing internal errors would require corrupting data structures
    // 3. Such tests would be brittle and depend on implementation details

    it("should handle guest from different event", async () => {
      // Create guest for different event
      const otherEventGuest = {
        id: generateUUID(),
        eventId: generateUUID(), // Different event ID
        name: "Other Guest",
        email: "other@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.CONFIRMED,
        createdAt: new Date(),
      };
      guests.push(otherEventGuest);

      const assignmentData = {
        guestId: otherEventGuest.id,
        seatNumbers: [1, 2],
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Guest not found or does not belong to this event");
    });

    it("should handle invalid table ID format in delete", async () => {
      const response = await request(app)
        .delete(`/api/events/${testEventId}/tables/invalid-uuid/assignments/${testGuestId}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid table ID format");
    });

    it("should handle invalid guest ID format in delete", async () => {
      const response = await request(app)
        .delete(`/api/events/${testEventId}/tables/${testTableId}/assignments/invalid-uuid`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid ID format");
    });
  });

  describe("GET /events/:eventId/tables/:tableId/assignments", () => {
    it("should return all assignments for a table", async () => {
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEventId,
        tableId: testTableId,
        guestId: testGuestId,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date(),
      };
      tableAssignments.push(assignment);

      const response = await request(app)
        .get(`/api/events/${testEventId}/tables/${testTableId}/assignments`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].guestId).toBe(testGuestId);
    });

    it("should handle non-existent table", async () => {
      const response = await request(app)
        .get(`/api/events/${testEventId}/tables/${generateUUID()}/assignments`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Table not found in venue");
    });
  });

  describe("DELETE /events/:eventId/tables/:tableId/assignments/:guestId", () => {
    it("should delete table assignment", async () => {
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEventId,
        tableId: testTableId,
        guestId: testGuestId,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date(),
      };
      tableAssignments.push(assignment);

      const response = await request(app)
        .delete(`/api/events/${testEventId}/tables/${testTableId}/assignments/${testGuestId}`);

      expect(response.status).toBe(204);

      // Verify assignment was deleted
      expect(tableAssignments).toHaveLength(0);
    });

    it("should handle non-existent assignment", async () => {
      const response = await request(app)
        .delete(`/api/events/${testEventId}/tables/${testTableId}/assignments/${generateUUID()}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Table assignment not found");
    });
  });

  describe("Error Scenarios", () => {
    it("should handle invalid event ID", async () => {
      const response = await request(app)
        .get(`/api/events/invalid-uuid/tables/${testTableId}/assignments`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid event ID format");
    });

    it("should handle non-existent event", async () => {
      const response = await request(app)
        .get(`/api/events/${generateUUID()}/tables/${testTableId}/assignments`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Event not found");
    });

    it("should handle non-existent venue", async () => {
      // Remove venue
      venues.length = 0;

      const response = await request(app)
        .get(`/api/events/${testEventId}/tables/${testTableId}/assignments`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Venue or venue map not found");
    });

    it("should handle venue without map", async () => {
      // Update venue to remove map
      venues[0].map = undefined;

      const response = await request(app)
        .get(`/api/events/${testEventId}/tables/${testTableId}/assignments`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Venue or venue map not found");
    });

    it("should handle invalid guest ID format", async () => {
      const assignmentData = {
        guestId: "invalid-uuid",
        seatNumbers: [1, 2],
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid guest ID format");
    });

    it("should handle non-existent table in venue", async () => {
      // Update venue to have a different table
      const tableFeature = venues[0].map!.features[0] as VenueFeature & { type: "table" };
      tableFeature.tableNumber = generateUUID();

      const response = await request(app)
        .get(`/api/events/${testEventId}/tables/${testTableId}/assignments`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Table not found in venue");
    });

    it("should handle non-existent guest in event", async () => {
      // Remove all guests
      guests.length = 0;

      const assignmentData = {
        guestId: testGuestId,
        seatNumbers: [1, 2],
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/tables/${testTableId}/assignments`)
        .send(assignmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Guest not found or does not belong to this event");
    });

    it("should handle non-existent assignment in delete", async () => {
      const response = await request(app)
        .delete(`/api/events/${testEventId}/tables/${testTableId}/assignments/${testGuestId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Table assignment not found");
    });
  });
}); 