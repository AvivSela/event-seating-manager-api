import { Request, Response } from "express";
import {
  Venue,
  CreateVenueDto,
  UpdateVenueDto,
  VenueMap,
  VenueFeature,
} from "../types/venue";
import { generateUUID, isValidUUID } from "../utils/uuid";
import { events } from "./eventController";
import { ValidationError } from "../types/errors/validation.error";
import { NotFoundError } from "../types/errors/not-found.error";
import { BaseError } from "../types/errors/base.error";

export let venues: Venue[] = [];

// Validate map data
function validateVenueMap(map: VenueMap | undefined): void {
  if (!map) return;

  if (
    !map.dimensions ||
    typeof map.dimensions.width !== "number" ||
    typeof map.dimensions.height !== "number"
  ) {
    throw new ValidationError("Map dimensions must include width and height", {
      dimensions: map?.dimensions
    });
  }

  if (!Array.isArray(map.features)) {
    throw new ValidationError("Map features must be an array", {
      features: map.features
    });
  }

  map.features.forEach((feature: VenueFeature) => {
    if (
      !feature.type ||
      !feature.position ||
      typeof feature.position.x !== "number" ||
      typeof feature.position.y !== "number"
    ) {
      throw new ValidationError("Each feature must have a valid type and position", {
        feature: feature
      });
    }

    if (feature.type === "table") {
      if (
        typeof feature.numberOfSeats !== "number" ||
        feature.numberOfSeats < 1
      ) {
        throw new ValidationError("Table features must specify numberOfSeats", {
          numberOfSeats: feature.numberOfSeats
        });
      }

      if (feature.guests) {
        feature.guests.forEach((guest) => {
          if (
            guest.seatNumber < 1 ||
            guest.seatNumber > feature.numberOfSeats!
          ) {
            throw new ValidationError(
              "Guest seat number must be between 1 and numberOfSeats",
              {
                seatNumber: guest.seatNumber,
                numberOfSeats: feature.numberOfSeats
              }
            );
          }
        });
      }
    }
  });
}

// Get all venues
export const getAllVenues = (_req: Request, res: Response): void => {
  try {
    res.json(venues);
  } catch (error) {
    throw new BaseError(
      'INTERNAL_ERROR',
      500,
      'Failed to retrieve venues',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};

// Get venue by ID
export const getVenueById = (req: Request, res: Response): void => {
  try {
    const venueId = req.params.id;

    if (!isValidUUID(venueId)) {
      throw new ValidationError("Invalid venue ID format", { id: venueId });
    }

    const venue = venues.find((v) => v.id === venueId);
    if (!venue) {
      throw new NotFoundError("Venue", venueId);
    }
    res.json(venue);
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new BaseError(
      'INTERNAL_ERROR',
      500,
      'Failed to retrieve venue',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};

// Create new venue
export const createVenue = (req: Request, res: Response): void => {
  try {
    const { name, address, capacity, description, map } = req.body;

    if (!name || !address || !capacity) {
      throw new ValidationError("Name, address, and capacity are required", {
        name: !name ? "missing" : undefined,
        address: !address ? "missing" : undefined,
        capacity: !capacity ? "missing" : undefined,
      });
    }

    validateVenueMap(map);

    const venue: Venue = {
      id: generateUUID(),
      name,
      address,
      capacity,
      description: description || "",
      map,
      createdAt: new Date(),
    };

    venues.push(venue);
    res.status(201).json(venue);
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new BaseError(
      'INTERNAL_ERROR',
      500,
      'Failed to create venue',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};

// Update venue
export const updateVenue = (req: Request, res: Response): void => {
  try {
    const venueId = req.params.id;
    const updates = req.body;

    if (!isValidUUID(venueId)) {
      throw new ValidationError("Invalid venue ID format", { id: venueId });
    }

    const venueIndex = venues.findIndex((v) => v.id === venueId);
    if (venueIndex === -1) {
      throw new NotFoundError("Venue", venueId);
    }

    if (updates.map) {
      validateVenueMap(updates.map);
    }

    const updatedVenue = {
      ...venues[venueIndex],
      ...updates,
      id: venueId, // Ensure ID cannot be changed
    };

    venues[venueIndex] = updatedVenue;
    res.json(updatedVenue);
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new BaseError(
      'INTERNAL_ERROR',
      500,
      'Failed to update venue',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};

// Delete venue
export const deleteVenue = (req: Request, res: Response): void => {
  try {
    const venueId = req.params.id;

    if (!isValidUUID(venueId)) {
      throw new ValidationError("Invalid venue ID format", { id: venueId });
    }

    // Check if venue exists
    const venue = venues.find(v => v.id === venueId);
    if (!venue) {
      throw new NotFoundError("Venue", venueId);
    }

    // Check if venue has any associated events
    const hasEvents = events.some(e => e.venueId === venueId);
    if (hasEvents) {
      throw new ValidationError(
        "Cannot delete venue that is being used by events",
        { venueId }
      );
    }

    venues = venues.filter((v) => v.id !== venueId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new BaseError(
      'INTERNAL_ERROR',
      500,
      'Failed to delete venue',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
};
