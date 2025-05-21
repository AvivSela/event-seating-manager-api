import request from "supertest";
import app from "../app";
import { Venue, VenueMap, VenueFeature } from "../types/venue";
import { clearVenues } from "../utils/testUtils";
import { venues } from "../controllers/venueController";

describe("Venue API Routes", () => {
  let createdVenue: Venue;

  beforeEach(() => {
    clearVenues();
  });

  describe("POST /api/venues", () => {
    it("should create a new venue", async () => {
      const venueData = {
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "A test venue",
      };

      const response = await request(app).post("/api/venues").send(venueData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(venueData.name);
      expect(response.body.address).toBe(venueData.address);
      expect(response.body.capacity).toBe(venueData.capacity);
      expect(response.body.description).toBe(venueData.description);
      expect(response.body).toHaveProperty("createdAt");

      createdVenue = response.body;
    });

    it("should return 400 when required fields are missing", async () => {
      const response = await request(app).post("/api/venues").send({
        name: "Test Venue",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Name, address, and capacity are required",
      );
    });
  });

  describe("GET /api/venues", () => {
    it("should return all venues", async () => {
      // Create a test venue first
      const venueData = {
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "A test venue",
      };

      await request(app).post("/api/venues").send(venueData);

      const response = await request(app).get("/api/venues");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0].name).toBe(venueData.name);
    });

    it("should return empty array when no venues exist", async () => {
      const response = await request(app).get("/api/venues");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("GET /api/venues/:id", () => {
    it("should return a specific venue", async () => {
      const venueData = {
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "A test venue",
      };

      const createResponse = await request(app)
        .post("/api/venues")
        .send(venueData);

      const venueId = createResponse.body.id;

      const response = await request(app).get(`/api/venues/${venueId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", venueId);
      expect(response.body.name).toBe(venueData.name);
      expect(response.body.address).toBe(venueData.address);
    });

    it("should return 404 for non-existent venue", async () => {
      const response = await request(app).get("/api/venues/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Venue not found");
    });
  });

  describe("PUT /api/venues/:id", () => {
    it("should update a venue", async () => {
      const venueData = {
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "A test venue",
      };

      const createResponse = await request(app)
        .post("/api/venues")
        .send(venueData);

      const venueId = createResponse.body.id;

      const updateData = {
        name: "Updated Venue Name",
        capacity: 200,
      };

      const response = await request(app)
        .put(`/api/venues/${venueId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", venueId);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.capacity).toBe(updateData.capacity);
      expect(response.body.address).toBe(venueData.address);
      expect(response.body).toHaveProperty("updatedAt");
    });

    it("should return 404 for non-existent venue", async () => {
      const response = await request(app).put("/api/venues/999").send({
        name: "Updated Name",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Venue not found");
    });
  });

  describe("DELETE /api/venues/:id", () => {
    it("should delete a venue", async () => {
      const venueData = {
        name: "Test Venue",
        address: "123 Test St",
        capacity: 100,
        description: "A test venue",
      };

      const createResponse = await request(app)
        .post("/api/venues")
        .send(venueData);

      const venueId = createResponse.body.id;

      const deleteResponse = await request(app).delete(
        `/api/venues/${venueId}`,
      );

      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app).get(`/api/venues/${venueId}`);

      expect(getResponse.status).toBe(404);
    });

    it("should return 404 for non-existent venue", async () => {
      const response = await request(app).delete("/api/venues/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Venue not found");
    });
  });

  describe("Venue Map Functionality", () => {
    const validVenueMap: VenueMap = {
      dimensions: {
        width: 50,
        height: 30,
      },
      features: [
        {
          type: "stage",
          position: { x: 25, y: 5 },
          dimensions: { width: 10, height: 5 },
          rotation: 0,
        },
        {
          type: "bar",
          position: { x: 45, y: 15 },
          dimensions: { width: 5, height: 2 },
        },
        {
          type: "table",
          position: { x: 15, y: 20 },
          dimensions: { width: 3, height: 3 },
          numberOfSeats: 6,
          guests: [
            {
              id: "1",
              name: "John Doe",
              seatNumber: 1,
            },
            {
              id: "2",
              name: "Jane Smith",
              seatNumber: 2,
            },
          ],
        },
      ],
    };

    it("should create a venue with map data including tables", async () => {
      const venueData = {
        name: "Mapped Venue",
        address: "123 Map St",
        capacity: 200,
        description: "A venue with map and tables",
        map: validVenueMap,
      };

      const response = await request(app).post("/api/venues").send(venueData);

      expect(response.status).toBe(201);
      expect(response.body.map).toEqual(validVenueMap);
      const tableFeature = response.body.map.features.find(
        (f: VenueFeature) => f.type === "table",
      );
      expect(tableFeature).toBeDefined();
      expect(tableFeature.numberOfSeats).toBe(6);
      expect(tableFeature.guests).toHaveLength(2);
    });

    it("should reject table feature without required numberOfSeats", async () => {
      const invalidTableMap = {
        dimensions: { width: 50, height: 30 },
        features: [
          {
            type: "table",
            position: { x: 15, y: 20 },
            dimensions: { width: 3, height: 3 },
            // missing numberOfSeats
          },
        ],
      };

      const response = await request(app).post("/api/venues").send({
        name: "Invalid Table Venue",
        address: "123 Map St",
        capacity: 200,
        map: invalidTableMap,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Table features must specify numberOfSeats",
      );
    });

    it("should validate guest seatNumber against numberOfSeats", async () => {
      const invalidGuestMap = {
        dimensions: { width: 50, height: 30 },
        features: [
          {
            type: "table",
            position: { x: 15, y: 20 },
            dimensions: { width: 3, height: 3 },
            numberOfSeats: 4,
            guests: [
              {
                id: "1",
                name: "John Doe",
                seatNumber: 5, // Invalid seat number > numberOfSeats
              },
            ],
          },
        ],
      };

      const response = await request(app).post("/api/venues").send({
        name: "Invalid Guest Venue",
        address: "123 Map St",
        capacity: 200,
        map: invalidGuestMap,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Guest seat number must be between 1 and numberOfSeats",
      );
    });

    it("should reject invalid map dimensions", async () => {
      const venueData = {
        name: "Invalid Map Venue",
        address: "123 Map St",
        capacity: 200,
        map: {
          dimensions: {}, // Invalid dimensions
          features: [],
        },
      };

      const response = await request(app).post("/api/venues").send(venueData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Map dimensions must include width and height",
      );
    });

    it("should reject invalid feature data", async () => {
      const venueData = {
        name: "Invalid Feature Venue",
        address: "123 Map St",
        capacity: 200,
        map: {
          dimensions: { width: 50, height: 30 },
          features: [
            {
              type: "stage",
              position: {}, // Invalid position
            },
          ],
        },
      };

      const response = await request(app).post("/api/venues").send(venueData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Each feature must have a valid type and position",
      );
    });

    it("should update venue map", async () => {
      // First create a venue
      const createResponse = await request(app).post("/api/venues").send({
        name: "Update Map Venue",
        address: "123 Map St",
        capacity: 200,
        map: validVenueMap,
      });

      const venueId = createResponse.body.id;

      // Update the map
      const updatedMap = {
        dimensions: { width: 60, height: 40 },
        features: [
          {
            type: "stage",
            position: { x: 30, y: 10 },
            dimensions: { width: 15, height: 8 },
          },
        ],
      };

      const response = await request(app)
        .put(`/api/venues/${venueId}`)
        .send({ map: updatedMap });

      expect(response.status).toBe(200);
      expect(response.body.map).toEqual(updatedMap);
    });
  });
});
