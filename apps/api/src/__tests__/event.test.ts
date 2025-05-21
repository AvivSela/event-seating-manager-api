import request from "supertest";
import app from "../app";
import { Event, EventType } from "../types/event";
import { User } from "../types/user";
import { Venue } from "../types/venue";
import { clearEvents, clearVenues } from "../utils/testUtils";
import { events } from "../controllers/eventController";
import { venues } from "../controllers/venueController";
import { generateUUID } from "../utils/uuid";

describe("Event API Routes", () => {
  let testUser: User;
  let testVenue: Venue;
  let createdEvent: Event;
  const nonExistentId = generateUUID(); // Use a valid UUID format for non-existent event/venue

  // Create a test user before running event tests
  beforeAll(async () => {
    const userResponse = await request(app).post("/api/users").send({
      name: "Test User",
      email: "test.user@example.com",
    });
    testUser = userResponse.body;
  });

  beforeEach(async () => {
    clearEvents();
    clearVenues();

    // Create a test venue
    const venueResponse = await request(app).post("/api/venues").send({
      name: "Test Venue",
      address: "123 Test St",
      capacity: 100,
      description: "A test venue",
    });
    testVenue = venueResponse.body;
  });

  describe("POST /api/events", () => {
    it("should create a new event", async () => {
      const eventData = {
        type: EventType.WEDDING,
        title: "John & Jane's Wedding",
        description: "Celebration of John and Jane's marriage",
        date: "2024-06-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: testVenue.id,
      };

      const response = await request(app).post("/api/events").send(eventData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.type).toBe(EventType.WEDDING);
      expect(response.body.title).toBe(eventData.title);
      expect(response.body.description).toBe(eventData.description);
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.venueId).toBe(testVenue.id);

      createdEvent = response.body;
    });

    it("should return 400 when required fields are missing", async () => {
      const response = await request(app).post("/api/events").send({
        type: EventType.WEDDING,
        title: "Test Event",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Type, title, date, userId, and venueId are required",
      );
    });

    it("should return 400 when venue does not exist", async () => {
      const response = await request(app).post("/api/events").send({
        type: EventType.WEDDING,
        title: "Test Event",
        description: "Test Description",
        date: "2024-06-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: nonExistentId,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Venue not found");
    });

    it("should return 400 for invalid venue UUID format", async () => {
      const response = await request(app).post("/api/events").send({
        type: EventType.WEDDING,
        title: "Test Event",
        description: "Test Description",
        date: "2024-06-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: "invalid-uuid",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid venue ID format");
    });
  });

  describe("GET /api/events", () => {
    it("should return all events", async () => {
      // Create events for different users
      const anotherUserResponse = await request(app).post("/api/users").send({
        name: "Another User",
        email: "another.user@example.com",
      });
      const anotherUser = anotherUserResponse.body;

      const event1 = {
        type: EventType.WEDDING,
        title: "John & Jane's Wedding",
        description: "Celebration of John and Jane's marriage",
        date: "2024-06-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: testVenue.id,
      };

      const event2 = {
        type: EventType.BIRTHDAY,
        title: "Another User's Birthday",
        description: "Another user's birthday party",
        date: "2024-07-15T15:00:00.000Z",
        userId: anotherUser.id,
        venueId: testVenue.id,
      };

      await request(app).post("/api/events").send(event1);

      await request(app).post("/api/events").send(event2);

      const response = await request(app).get("/api/events");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.some((e: Event) => e.userId === testUser.id)).toBe(
        true,
      );
      expect(
        response.body.some((e: Event) => e.userId === anotherUser.id),
      ).toBe(true);
    });

    it("should return empty array when no events exist", async () => {
      const response = await request(app).get("/api/events");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("GET /api/events/:id", () => {
    it("should return a specific event", async () => {
      const eventData = {
        type: EventType.WEDDING,
        title: "John & Jane's Wedding",
        description: "Celebration of John and Jane's marriage",
        date: "2024-06-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: testVenue.id,
      };

      const createResponse = await request(app)
        .post("/api/events")
        .send(eventData);

      const eventId = createResponse.body.id;

      const response = await request(app).get(`/api/events/${eventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", eventId);
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.venueId).toBe(testVenue.id);
      expect(response.body.title).toBe(eventData.title);
    });

    it("should return 404 for non-existent event", async () => {
      const response = await request(app).get(`/api/events/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Event not found");
    });

    it("should return 400 for invalid UUID format", async () => {
      const response = await request(app).get("/api/events/invalid-uuid");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid event ID format");
    });
  });

  describe("PUT /api/events/:id", () => {
    it("should update an event", async () => {
      const eventData = {
        type: EventType.WEDDING,
        title: "John & Jane's Wedding",
        description: "Celebration of John and Jane's marriage",
        date: "2024-06-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: testVenue.id,
      };

      const createResponse = await request(app)
        .post("/api/events")
        .send(eventData);

      const eventId = createResponse.body.id;

      const updateData = {
        title: "Updated Wedding Title",
      };

      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", eventId);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body).toHaveProperty("updatedAt");
    });

    it("should return 404 for non-existent event", async () => {
      const response = await request(app).put(`/api/events/${nonExistentId}`).send({
        title: "Updated Title",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Event not found");
    });

    it("should return 400 for invalid UUID format", async () => {
      const response = await request(app).put("/api/events/invalid-uuid").send({
        title: "Updated Title",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid event ID format");
    });

    it("should return 400 when updating to non-existent venue", async () => {
      const eventData = {
        type: EventType.WEDDING,
        title: "Original Title",
        description: "Original Description",
        date: "2024-06-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: testVenue.id,
      };

      const createResponse = await request(app)
        .post("/api/events")
        .send(eventData);

      const eventId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .send({
          venueId: nonExistentId,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Venue not found");
    });

    it("should handle invalid venue ID format in update", async () => {
      const eventData = {
        type: EventType.WEDDING,
        title: "Original Title",
        description: "Original Description",
        date: "2024-06-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: testVenue.id,
      };

      const createResponse = await request(app)
        .post("/api/events")
        .send(eventData);

      const eventId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .send({
          venueId: "invalid-uuid",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid venue ID format");
    });
  });

  describe("DELETE /api/events/:id", () => {
    it("should delete an event", async () => {
      const eventData = {
        type: EventType.WEDDING,
        title: "Event to Delete",
        description: "This event will be deleted",
        date: "2024-06-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: testVenue.id,
      };

      const createResponse = await request(app)
        .post("/api/events")
        .send(eventData);

      const eventId = createResponse.body.id;

      const deleteResponse = await request(app).delete(`/api/events/${eventId}`);
      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app).get(`/api/events/${eventId}`);
      expect(getResponse.status).toBe(404);
    });

    it("should return 404 for non-existent event", async () => {
      const response = await request(app).delete(`/api/events/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Event not found");
    });

    it("should return 400 for invalid UUID format", async () => {
      const response = await request(app).delete("/api/events/invalid-uuid");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid event ID format");
    });
  });

  describe("GET /api/users/:userId/events", () => {
    it("should return all events for a user", async () => {
      // Create multiple events for the test user
      const event1 = {
        type: EventType.WEDDING,
        title: "User's Wedding",
        description: "Wedding event",
        date: "2024-06-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: testVenue.id,
      };

      const event2 = {
        type: EventType.BIRTHDAY,
        title: "User's Birthday",
        description: "Birthday event",
        date: "2024-07-15T15:00:00.000Z",
        userId: testUser.id,
        venueId: testVenue.id,
      };

      await request(app).post("/api/events").send(event1);
      await request(app).post("/api/events").send(event2);

      const response = await request(app).get(`/api/users/${testUser.id}/events`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.every((e: Event) => e.userId === testUser.id)).toBe(true);
    });

    it("should return empty array for user with no events", async () => {
      const response = await request(app).get(`/api/users/${testUser.id}/events`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it("should handle invalid user ID format", async () => {
      const response = await request(app).get("/api/users/invalid-uuid/events");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid user ID format");
    });
  });
});
