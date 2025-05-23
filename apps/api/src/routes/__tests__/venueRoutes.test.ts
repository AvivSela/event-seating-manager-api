import request from "supertest";
import app from "../../app";
import { venues } from "../../controllers/venueController";
import { events } from "../../controllers/eventController";
import { generateUUID } from "../../utils/uuid";
import { Venue, VenueMap, TableFeature } from "../../types/venue";
import { EventType } from "../../types/event";

describe("Venue Routes", () => {
  const validTableFeature: TableFeature = {
    type: "table",
    tableNumber: "T1",
    position: { x: 10, y: 10 },
    numberOfSeats: 8,
    shape: "rectangular",
    dimensions: { width: 20, height: 10 },
  };

  const validVenueMap: VenueMap = {
    dimensions: {
      width: 100,
      height: 100,
    },
    features: [validTableFeature],
  };

  const validVenueData = {
    name: "Test Venue",
    address: "123 Test St",
    capacity: 100,
    description: "A test venue",
    map: validVenueMap,
  };

  beforeEach(() => {
    venues.length = 0;
    events.length = 0;
  });

  describe("GET /api/venues", () => {
    it("should return empty array when no venues exist", async () => {
      const response = await request(app).get("/api/venues");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return all venues", async () => {
      const venue: Venue = {
        id: generateUUID(),
        ...validVenueData,
        createdAt: new Date(),
      };
      venues.push(venue);

      const response = await request(app).get("/api/venues");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual(expect.objectContaining(validVenueData));
    });
  });

  describe("GET /api/venues/:id", () => {
    it("should return 400 for invalid UUID", async () => {
      const response = await request(app).get("/api/venues/invalid-uuid");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Invalid venue ID format",
        details: { id: "invalid-uuid" }
      });
    });

    it("should return 404 for non-existent venue", async () => {
      const nonExistentId = generateUUID();
      const response = await request(app).get(`/api/venues/${nonExistentId}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "NOT_FOUND",
        message: `Venue with ID ${nonExistentId} not found`,
        details: undefined
      });
    });

    it("should return venue by ID", async () => {
      const venue: Venue = {
        id: generateUUID(),
        ...validVenueData,
        createdAt: new Date(),
      };
      venues.push(venue);

      const response = await request(app).get(`/api/venues/${venue.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(validVenueData));
    });
  });

  describe("POST /api/venues", () => {
    it("should create venue with valid data", async () => {
      const response = await request(app)
        .post("/api/venues")
        .send(validVenueData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          ...validVenueData,
          id: expect.any(String),
          createdAt: expect.any(String),
        })
      );
    });

    it("should return 400 for missing required fields", async () => {
      const invalidData = { ...validVenueData };
      const { name, ...dataWithoutName } = invalidData;

      const response = await request(app)
        .post("/api/venues")
        .send(dataWithoutName);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Name, address, and capacity are required",
        details: { name: "missing" }
      });
    });

    it("should validate venue map data", async () => {
      const { width, ...dimensionsWithoutWidth } = validVenueMap.dimensions;
      const invalidMap = {
        ...validVenueMap,
        dimensions: dimensionsWithoutWidth,
      };

      const response = await request(app)
        .post("/api/venues")
        .send({ ...validVenueData, map: invalidMap });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Map dimensions must include width and height",
        details: { dimensions: dimensionsWithoutWidth }
      });
    });
  });

  describe("PUT /api/venues/:id", () => {
    let testVenue: Venue;

    beforeEach(() => {
      testVenue = {
        id: generateUUID(),
        ...validVenueData,
        createdAt: new Date(),
      };
      venues.push(testVenue);
    });

    it("should update venue with valid data", async () => {
      const updateData = {
        name: "Updated Venue",
        description: "Updated description",
      };

      const response = await request(app)
        .put(`/api/venues/${testVenue.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...testVenue,
        ...updateData,
        createdAt: testVenue.createdAt.toISOString(),
      });
    });

    it("should return 404 for non-existent venue", async () => {
      const nonExistentId = generateUUID();
      const response = await request(app)
        .put(`/api/venues/${nonExistentId}`)
        .send({ name: "Updated Venue" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "NOT_FOUND",
        message: `Venue with ID ${nonExistentId} not found`,
        details: undefined
      });
    });

    it("should validate updated map data", async () => {
      const { width, ...dimensionsWithoutWidth } = validVenueMap.dimensions;
      const invalidMap = {
        ...validVenueMap,
        dimensions: dimensionsWithoutWidth,
      };

      const response = await request(app)
        .put(`/api/venues/${testVenue.id}`)
        .send({ map: invalidMap });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Map dimensions must include width and height",
        details: { dimensions: dimensionsWithoutWidth }
      });
    });
  });

  describe("DELETE /api/venues/:id", () => {
    let testVenue: Venue;

    beforeEach(() => {
      testVenue = {
        id: generateUUID(),
        ...validVenueData,
        createdAt: new Date(),
      };
      venues.push(testVenue);
    });

    it("should delete venue when no events exist", async () => {
      const response = await request(app).delete(`/api/venues/${testVenue.id}`);
      expect(response.status).toBe(204);
      expect(venues).toHaveLength(0);
    });

    it("should return 400 for invalid UUID", async () => {
      const response = await request(app).delete("/api/venues/invalid-uuid");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Invalid venue ID format",
        details: { id: "invalid-uuid" }
      });
    });

    it("should return 404 for non-existent venue", async () => {
      const nonExistentId = generateUUID();
      const response = await request(app).delete(`/api/venues/${nonExistentId}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "NOT_FOUND",
        message: `Venue with ID ${nonExistentId} not found`,
        details: undefined
      });
    });
  });

  describe("Error Scenarios", () => {
    it("should handle invalid venue ID format", async () => {
      const response = await request(app).get("/api/venues/invalid-uuid");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Invalid venue ID format",
        details: { id: "invalid-uuid" }
      });
    });

    it("should handle non-existent venue", async () => {
      const nonExistentId = generateUUID();
      const response = await request(app).get(`/api/venues/${nonExistentId}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "NOT_FOUND",
        message: `Venue with ID ${nonExistentId} not found`,
        details: undefined
      });
    });

    it("should handle invalid map data", async () => {
      const { width, ...dimensionsWithoutWidth } = validVenueMap.dimensions;
      const invalidMap = {
        ...validVenueMap,
        dimensions: dimensionsWithoutWidth,
      };

      const response = await request(app)
        .post("/api/venues")
        .send({ ...validVenueData, map: invalidMap });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Map dimensions must include width and height",
        details: { dimensions: dimensionsWithoutWidth }
      });
    });

    it("should handle invalid feature data", async () => {
      const { position, ...featureWithoutPosition } = validTableFeature;
      const invalidFeature = {
        ...validVenueMap,
        features: [featureWithoutPosition],
      };

      const response = await request(app)
        .post("/api/venues")
        .send({ ...validVenueData, map: invalidFeature });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Each feature must have a valid type and position",
        details: { feature: featureWithoutPosition }
      });
    });

    it("should handle invalid table feature data", async () => {
      const { numberOfSeats, ...featureWithoutSeats } = validTableFeature;
      const invalidTableFeature = {
        ...validVenueMap,
        features: [featureWithoutSeats],
      };

      const response = await request(app)
        .post("/api/venues")
        .send({ ...validVenueData, map: invalidTableFeature });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Table features must specify numberOfSeats",
        details: { numberOfSeats: undefined }
      });
    });

    it("should handle invalid guest seat number", async () => {
      const invalidGuestSeat = {
        ...validVenueMap,
        features: [{
          ...validTableFeature,
          numberOfSeats: 4,
          guests: [{ id: "1", seatNumber: 5 }], // Seat number > numberOfSeats
        }],
      };

      const response = await request(app)
        .post("/api/venues")
        .send({ ...validVenueData, map: invalidGuestSeat });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Guest seat number must be between 1 and numberOfSeats",
        details: { seatNumber: 5, numberOfSeats: 4 }
      });
    });

    it("should handle venue deletion with existing events", async () => {
      const venue: Venue = {
        id: generateUUID(),
        ...validVenueData,
        createdAt: new Date(),
      };
      venues.push(venue);

      events.push({
        id: generateUUID(),
        userId: generateUUID(),
        venueId: venue.id,
        type: EventType.WEDDING,
        title: "Test Event",
        description: "Test Description",
        date: new Date(),
        createdAt: new Date(),
      });

      const response = await request(app).delete(`/api/venues/${venue.id}`);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Cannot delete venue that is being used by events",
        details: { venueId: venue.id }
      });
    });
  });
}); 