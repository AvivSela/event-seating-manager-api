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

export const venues: Venue[] = [];

// Validate map data
export function validateVenueMap(map: VenueMap): void {
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

  map.features.forEach((feature) => {
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
        !feature.numberOfSeats ||
        typeof feature.numberOfSeats !== "number" ||
        feature.numberOfSeats < 1
      ) {
        throw new ValidationError("Table features must specify numberOfSeats", {
          numberOfSeats: feature.numberOfSeats
        });
      }

      feature.guests?.forEach((guest) => {
        if (
          typeof guest.seatNumber !== "number" ||
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
  });
}

// Get all venues
export const getAllVenues = (req: Request, res: Response): void => {
  try {
    res.json(venues);
  } catch (error) {
    throw new BaseError(
      'INTERNAL_ERROR',
      500,
      'Failed to retrieve venues',
      { error: (error as Error).message }
    );
  }
};

// Get venue by ID
export const getVenueById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      throw new ValidationError("Invalid venue ID format", { id });
    }

    const venue = venues.find((v) => v.id === id);
    if (!venue) {
      throw new NotFoundError("Venue", id);
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
      { error: (error as Error).message }
    );
  }
};

// Create new venue
export const createVenue = (req: Request, res: Response): void => {
  try {
    const venueData: CreateVenueDto = req.body;

    if (!venueData.name || !venueData.address || !venueData.capacity) {
      throw new ValidationError("Name, address, and capacity are required", {
        name: !venueData.name ? "missing" : undefined,
        address: !venueData.address ? "missing" : undefined,
        capacity: !venueData.capacity ? "missing" : undefined,
      });
    }

    if (venueData.map) {
      validateVenueMap(venueData.map);
    }

    const newVenue: Venue = {
      id: generateUUID(),
      ...venueData,
      createdAt: new Date()
    };

    venues.push(newVenue);
    res.status(201).json(newVenue);
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new BaseError(
      'INTERNAL_ERROR',
      500,
      'Failed to create venue',
      { error: (error as Error).message }
    );
  }
};

// Update venue
export const updateVenue = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const updates: UpdateVenueDto = req.body;

    if (!isValidUUID(id)) {
      throw new ValidationError("Invalid venue ID format", { id });
    }

    const venueIndex = venues.findIndex((v) => v.id === id);
    if (venueIndex === -1) {
      throw new NotFoundError("Venue", id);
    }

    if (updates.map) {
      validateVenueMap(updates.map);
    }

    const updatedVenue = {
      ...venues[venueIndex],
      ...updates
    };

    venues[venueIndex] = updatedVenue;
    res.status(200).json(updatedVenue);
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new BaseError(
      'INTERNAL_ERROR',
      500,
      'Failed to update venue',
      { error: (error as Error).message }
    );
  }
};

// Delete venue
export const deleteVenue = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      throw new ValidationError("Invalid venue ID format", { id });
    }

    const venueIndex = venues.findIndex((v) => v.id === id);
    if (venueIndex === -1) {
      throw new NotFoundError("Venue", id);
    }

    // Check if venue is being used by any events
    const hasEvents = events.some((event) => event.venueId === id);
    if (hasEvents) {
      throw new ValidationError("Cannot delete venue that is being used by events", {
        venueId: id
      });
    }

    venues.splice(venueIndex, 1);
    res.status(204).send();
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new BaseError(
      'INTERNAL_ERROR',
      500,
      'Failed to delete venue',
      { error: (error as Error).message }
    );
  }
};
