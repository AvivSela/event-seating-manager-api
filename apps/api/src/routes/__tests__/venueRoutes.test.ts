import request from "supertest";
import express from "express";
import venueRoutes from "../venueRoutes";
import { venues } from "../../controllers/venueController";
import { generateUUID } from "../../utils/uuid";
import { events } from "../../controllers/eventController";
import { EventType } from "../../types/event";

const app = express();
app.use(express.json());
app.use("/api/venues", venueRoutes);

describe("Venue Routes", () => {
  beforeEach(() => {
    // Clear venues array before each test
    venues.length = 0;
  });

  describe("GET /api/venues", () => {
    it("should return empty array when no venues exist", async () => {
      const response = await request(app).get("/api/venues");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return all venues", async () => {
      const testVenue = {
        id: generateUUID(),
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "Test Description",
        createdAt: new Date(),
      };
      venues.push(testVenue);

      const response = await request(app).get("/api/venues");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe(testVenue.name);
    });
  });

  describe("GET /api/venues/:id", () => {
    it("should return 400 for invalid UUID", async () => {
      const response = await request(app).get("/api/venues/invalid-uuid");
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid venue ID format");
    });

    it("should return 404 for non-existent venue", async () => {
      const response = await request(app).get(`/api/venues/${generateUUID()}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Venue not found");
    });

    it("should return venue by ID", async () => {
      const testVenue = {
        id: generateUUID(),
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "Test Description",
        createdAt: new Date(),
      };
      venues.push(testVenue);

      const response = await request(app).get(`/api/venues/${testVenue.id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testVenue.id);
    });
  });

  describe("POST /api/venues", () => {
    it("should create new venue with valid data", async () => {
      const newVenue = {
        name: "New Venue",
        address: "456 New St",
        capacity: 200,
        description: "New Description",
      };

      const response = await request(app)
        .post("/api/venues")
        .send(newVenue);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newVenue.name);
      expect(response.body.id).toBeDefined();
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/venues")
        .send({ name: "Incomplete Venue" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Name, address, and capacity are required");
    });

    it("should validate venue map data", async () => {
      const venueWithInvalidMap = {
        name: "Map Venue",
        address: "789 Map St",
        capacity: 300,
        map: {
          dimensions: { width: "invalid" }, // Invalid dimensions
          features: []
        }
      };

      const response = await request(app)
        .post("/api/venues")
        .send(venueWithInvalidMap);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Map dimensions must include width and height");
    });

    it("should create venue with valid map and table configuration", async () => {
      const venueWithMap = {
        name: "Map Venue",
        address: "789 Map St",
        capacity: 300,
        map: {
          dimensions: { width: 100, height: 100 },
          features: [
            {
              type: "table",
              position: { x: 10, y: 20 },
              numberOfSeats: 8,
              guests: []
            }
          ]
        }
      };

      const response = await request(app)
        .post("/api/venues")
        .send(venueWithMap);

      expect(response.status).toBe(201);
      expect(response.body.map.features[0].numberOfSeats).toBe(8);
    });
  });

  describe("PUT /api/venues/:id", () => {
    it("should update venue with valid data", async () => {
      const testVenue = {
        id: generateUUID(),
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "Test Description",
        createdAt: new Date(),
      };
      venues.push(testVenue);

      const updateData = {
        name: "Updated Venue",
        capacity: 150
      };

      const response = await request(app)
        .put(`/api/venues/${testVenue.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.capacity).toBe(updateData.capacity);
      expect(response.body.address).toBe(testVenue.address);
    });

    it("should return 404 for non-existent venue", async () => {
      const response = await request(app)
        .put(`/api/venues/${generateUUID()}`)
        .send({ name: "Updated Name" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Venue not found");
    });

    it("should validate updated map data", async () => {
      const testVenue = {
        id: generateUUID(),
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        createdAt: new Date(),
      };
      venues.push(testVenue);

      const invalidUpdate = {
        map: {
          dimensions: { width: "invalid" },
          features: []
        }
      };

      const response = await request(app)
        .put(`/api/venues/${testVenue.id}`)
        .send(invalidUpdate);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Map dimensions must include width and height");
    });
  });

  describe("DELETE /api/venues/:id", () => {
    it("should delete existing venue", async () => {
      const testVenue = {
        id: generateUUID(),
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "Test Description",
        createdAt: new Date(),
      };
      venues.push(testVenue);

      const response = await request(app).delete(`/api/venues/${testVenue.id}`);
      expect(response.status).toBe(204);

      // Verify venue was deleted
      const getResponse = await request(app).get(`/api/venues/${testVenue.id}`);
      expect(getResponse.status).toBe(404);
    });

    it("should return 400 for invalid UUID", async () => {
      const response = await request(app).delete("/api/venues/invalid-uuid");
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid venue ID format");
    });

    it("should return 404 for non-existent venue", async () => {
      const response = await request(app).delete(`/api/venues/${generateUUID()}`);
      expect(response.status).toBe(404);
    });
  });

  describe("Error Scenarios", () => {
    it("should handle invalid venue ID format", async () => {
      const response = await request(app)
        .get("/api/venues/invalid-uuid");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid venue ID format");
    });

    it("should handle non-existent venue", async () => {
      const response = await request(app)
        .get(`/api/venues/${generateUUID()}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Venue not found");
    });

    it("should handle invalid map data", async () => {
      const venueData = {
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "Test Description",
        map: {
          dimensions: { width: "invalid" }, // Invalid width type
          features: []
        }
      };

      const response = await request(app)
        .post("/api/venues")
        .send(venueData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Map dimensions must include width and height");
    });

    it("should handle invalid feature data", async () => {
      const venueData = {
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "Test Description",
        map: {
          dimensions: { width: 100, height: 100 },
          features: [
            {
              type: "table",
              position: { x: 10 }, // Missing y coordinate
              numberOfSeats: 8
            }
          ]
        }
      };

      const response = await request(app)
        .post("/api/venues")
        .send(venueData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Each feature must have a valid type and position");
    });

    it("should handle invalid table feature data", async () => {
      const venueData = {
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "Test Description",
        map: {
          dimensions: { width: 100, height: 100 },
          features: [
            {
              type: "table",
              position: { x: 10, y: 20 },
              numberOfSeats: 0 // Invalid number of seats
            }
          ]
        }
      };

      const response = await request(app)
        .post("/api/venues")
        .send(venueData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Table features must specify numberOfSeats");
    });

    it("should handle invalid guest seat number", async () => {
      const venueData = {
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "Test Description",
        map: {
          dimensions: { width: 100, height: 100 },
          features: [
            {
              type: "table",
              position: { x: 10, y: 20 },
              numberOfSeats: 4,
              guests: [
                { id: generateUUID(), seatNumber: 5 } // Seat number > numberOfSeats
              ]
            }
          ]
        }
      };

      const response = await request(app)
        .post("/api/venues")
        .send(venueData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Guest seat number must be between 1 and numberOfSeats");
    });

    it("should handle venue deletion with existing events", async () => {
      // Create a venue
      const venue = {
        id: generateUUID(),
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "Test Description",
        createdAt: new Date()
      };
      venues.push(venue);

      // Create an event using this venue
      const event = {
        id: generateUUID(),
        userId: generateUUID(),
        venueId: venue.id,
        title: "Test Event",
        description: "Test Event Description",
        date: new Date(),
        type: EventType.WEDDING,
        createdAt: new Date()
      };
      events.push(event);

      const response = await request(app)
        .delete(`/api/venues/${venue.id}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot delete venue with existing events");
    });
  });
}); 