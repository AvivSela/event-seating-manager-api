import request from "supertest";
import express from "express";
import guestRoutes from "../guestRoutes";
import { guests } from "../../controllers/guestController";
import { events } from "../../controllers/eventController";
import { tableAssignments } from "../../controllers/tableAssignmentController";
import { generateUUID } from "../../utils/uuid";
import { GuestStatus } from "../../types/guest";
import { EventType, Event } from "../../types/event";
import { TableAssignment } from "../../types/tableAssignment";

const app = express();
app.use(express.json());
app.use("/api", guestRoutes);

describe("Guest Routes", () => {
  const testEventId = generateUUID();
  const testUserId = generateUUID();
  const testVenueId = generateUUID();

  beforeEach(() => {
    // Clear arrays before each test
    guests.length = 0;
    events.length = 0;
    tableAssignments.length = 0;

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
  });

  describe("POST /events/:eventId/guests", () => {
    it("should create guest with valid data", async () => {
      const newGuest = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.PENDING,
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send(newGuest);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newGuest.name);
      expect(response.body.id).toBeDefined();
      expect(response.body.eventId).toBe(testEventId);
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send({ name: "John Doe" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Missing required fields");
    });

    it("should validate email format", async () => {
      const invalidGuest = {
        name: "John Doe",
        email: "invalid-email",
        phone: "+1234567890",
        partySize: 2,
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send(invalidGuest);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid email format");
    });

    it("should validate phone format", async () => {
      const invalidGuest = {
        name: "John Doe",
        email: "john@example.com",
        phone: "invalid-phone",
        partySize: 2,
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send(invalidGuest);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid phone format");
    });

    it("should validate party size", async () => {
      const invalidGuest = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        partySize: 0,
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send(invalidGuest);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Party size must be at least 1");
    });

    it("should validate guest status", async () => {
      const invalidGuest = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: "INVALID_STATUS",
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send(invalidGuest);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid guest status");
    });
  });

  describe("GET /events/:eventId/guests", () => {
    it("should return all guests for an event", async () => {
      const guest = {
        id: generateUUID(),
        eventId: testEventId,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.PENDING,
        createdAt: new Date(),
      };
      guests.push(guest);

      const response = await request(app).get(`/api/events/${testEventId}/guests`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe(guest.name);
    });

    it("should filter guests by assignment status", async () => {
      const guest1 = {
        id: generateUUID(),
        eventId: testEventId,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.CONFIRMED,
        createdAt: new Date(),
      };
      const guest2 = {
        id: generateUUID(),
        eventId: testEventId,
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+1234567891",
        partySize: 2,
        status: GuestStatus.CONFIRMED,
        createdAt: new Date(),
      };
      guests.push(guest1, guest2);

      // Assign guest1 to a table
      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEventId,
        guestId: guest1.id,
        tableId: generateUUID(),
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date(),
      };
      tableAssignments.push(assignment);

      // Get assigned guests
      const assignedResponse = await request(app)
        .get(`/api/events/${testEventId}/guests?assigned=true`);
      expect(assignedResponse.status).toBe(200);
      expect(assignedResponse.body).toHaveLength(1);
      expect(assignedResponse.body[0].id).toBe(guest1.id);

      // Get unassigned guests
      const unassignedResponse = await request(app)
        .get(`/api/events/${testEventId}/guests?assigned=false`);
      expect(unassignedResponse.status).toBe(200);
      expect(unassignedResponse.body).toHaveLength(1);
      expect(unassignedResponse.body[0].id).toBe(guest2.id);
    });
  });

  describe("GET /events/:eventId/guests/:guestId", () => {
    it("should return guest by ID", async () => {
      const guest = {
        id: generateUUID(),
        eventId: testEventId,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.PENDING,
        createdAt: new Date(),
      };
      guests.push(guest);

      const response = await request(app)
        .get(`/api/events/${testEventId}/guests/${guest.id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(guest.id);
    });

    it("should include table assignment information", async () => {
      const guest = {
        id: generateUUID(),
        eventId: testEventId,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.CONFIRMED,
        createdAt: new Date(),
      };
      guests.push(guest);

      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEventId,
        guestId: guest.id,
        tableId: generateUUID(),
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date(),
      };
      tableAssignments.push(assignment);

      const response = await request(app)
        .get(`/api/events/${testEventId}/guests/${guest.id}`);
      expect(response.status).toBe(200);
      expect(response.body.tableAssignment).toBeDefined();
      expect(response.body.tableAssignment.tableId).toBe(assignment.tableId);
    });
  });

  describe("PUT /events/:eventId/guests/:guestId", () => {
    it("should update guest with valid data", async () => {
      const guest = {
        id: generateUUID(),
        eventId: testEventId,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.PENDING,
        createdAt: new Date(),
      };
      guests.push(guest);

      const updateData = {
        name: "John Smith",
        status: GuestStatus.CONFIRMED,
      };

      const response = await request(app)
        .put(`/api/events/${testEventId}/guests/${guest.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.email).toBe(guest.email);
    });

    it("should validate status transitions", async () => {
      const guest = {
        id: generateUUID(),
        eventId: testEventId,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.PENDING,
        createdAt: new Date(),
      };
      guests.push(guest);

      const updateData = {
        status: "INVALID_STATUS",
      };

      const response = await request(app)
        .put(`/api/events/${testEventId}/guests/${guest.id}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid guest status");
    });
  });

  describe("DELETE /events/:eventId/guests/:guestId", () => {
    it("should delete guest and associated assignments", async () => {
      const guest = {
        id: generateUUID(),
        eventId: testEventId,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.CONFIRMED,
        createdAt: new Date(),
      };
      guests.push(guest);

      const assignment: TableAssignment = {
        id: generateUUID(),
        eventId: testEventId,
        guestId: guest.id,
        tableId: generateUUID(),
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date(),
      };
      tableAssignments.push(assignment);

      const response = await request(app)
        .delete(`/api/events/${testEventId}/guests/${guest.id}`);
      expect(response.status).toBe(204);

      // Verify guest was deleted
      const getResponse = await request(app)
        .get(`/api/events/${testEventId}/guests/${guest.id}`);
      expect(getResponse.status).toBe(404);

      // Verify assignment was deleted
      expect(tableAssignments.find(a => a.guestId === guest.id)).toBeUndefined();
    });

    it("should return 404 for non-existent guest", async () => {
      const response = await request(app)
        .delete(`/api/events/${testEventId}/guests/${generateUUID()}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Guest not found");
    });
  });

  describe("Error Scenarios", () => {
    it("should handle invalid event ID format", async () => {
      const response = await request(app)
        .get("/api/events/invalid-uuid/guests");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid event ID format");
    });

    it("should handle non-existent event", async () => {
      const response = await request(app)
        .get(`/api/events/${generateUUID()}/guests`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Event not found");
    });

    it("should handle invalid guest ID format", async () => {
      const response = await request(app)
        .get(`/api/events/${testEventId}/guests/invalid-uuid`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid guest ID format");
    });

    it("should handle non-existent guest", async () => {
      const response = await request(app)
        .get(`/api/events/${testEventId}/guests/${generateUUID()}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Guest not found");
    });

    it("should handle invalid email format", async () => {
      const guestData = {
        name: "Test Guest",
        email: "invalid-email", // Invalid email format
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.CONFIRMED
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send(guestData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid email format");
    });

    it("should handle invalid phone format", async () => {
      const guestData = {
        name: "Test Guest",
        email: "test@example.com",
        phone: "invalid-phone", // Invalid phone format
        partySize: 2,
        status: GuestStatus.CONFIRMED
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send(guestData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid phone format");
    });

    it("should handle invalid party size", async () => {
      const guestData = {
        name: "Test Guest",
        email: "test@example.com",
        phone: "+1234567890",
        partySize: 0, // Invalid party size
        status: GuestStatus.CONFIRMED
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send(guestData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Party size must be at least 1");
    });

    it("should handle invalid guest status", async () => {
      const guestData = {
        name: "Test Guest",
        email: "test@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: "INVALID_STATUS" // Invalid status
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send(guestData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid guest status");
    });

    it("should handle missing required fields", async () => {
      const guestData = {
        name: "Test Guest",
        // Missing email, phone, and partySize
        status: GuestStatus.CONFIRMED
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/guests`)
        .send(guestData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Missing required fields");
    });

    it("should handle guest deletion with table assignment", async () => {
      // Create a guest
      const guest = {
        id: generateUUID(),
        eventId: testEventId,
        name: "Test Guest",
        email: "test@example.com",
        phone: "+1234567890",
        partySize: 2,
        status: GuestStatus.CONFIRMED,
        createdAt: new Date()
      };
      guests.push(guest);

      // Create a table assignment for the guest
      const assignment = {
        id: generateUUID(),
        eventId: testEventId,
        tableId: generateUUID(),
        guestId: guest.id,
        seatNumbers: [1, 2],
        assignedAt: new Date(),
        createdAt: new Date()
      };
      tableAssignments.push(assignment);

      const response = await request(app)
        .delete(`/api/events/${testEventId}/guests/${guest.id}`);

      expect(response.status).toBe(204);

      // Verify that both guest and assignment were deleted
      expect(guests.find(g => g.id === guest.id)).toBeUndefined();
      expect(tableAssignments.find(a => a.guestId === guest.id)).toBeUndefined();
    });
  });
}); 