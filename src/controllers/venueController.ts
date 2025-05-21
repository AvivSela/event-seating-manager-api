import { Request, Response } from 'express';
import { Venue, CreateVenueDto, UpdateVenueDto, VenueMap, VenueFeature } from '../types/venue';

export let venues: Venue[] = [];
let nextId = 1;

// Validate map data
function validateVenueMap(map: VenueMap | undefined): void {
  if (!map) return;

  if (!map.dimensions || typeof map.dimensions.width !== 'number' || typeof map.dimensions.height !== 'number') {
    throw new Error('Map dimensions must include width and height');
  }

  if (!Array.isArray(map.features)) {
    throw new Error('Map features must be an array');
  }

  map.features.forEach((feature: VenueFeature) => {
    if (!feature.type || !feature.position || typeof feature.position.x !== 'number' || typeof feature.position.y !== 'number') {
      throw new Error('Each feature must have a valid type and position');
    }

    if (feature.type === 'table') {
      if (typeof feature.numberOfSeats !== 'number' || feature.numberOfSeats < 1) {
        throw new Error('Table features must specify numberOfSeats');
      }

      if (feature.guests) {
        feature.guests.forEach(guest => {
          if (guest.seatNumber < 1 || guest.seatNumber > feature.numberOfSeats) {
            throw new Error('Guest seat number must be between 1 and numberOfSeats');
          }
        });
      }
    }
  });
}

// Get all venues
export const getAllVenues = (_req: Request, res: Response): void => {
  res.json(venues);
};

// Get venue by ID
export const getVenueById = (req: Request, res: Response): void => {
  const venueId = parseInt(req.params.id);
  const venue = venues.find(v => v.id === venueId);
  
  if (!venue) {
    res.status(404).json({ message: 'Venue not found' });
    return;
  }
  
  res.json(venue);
};

// Create new venue
export const createVenue = (req: Request, res: Response): void => {
  try {
    const { name, address, capacity, description, map } = req.body;

    if (!name || !address || !capacity) {
      res.status(400).json({ message: 'Name, address, and capacity are required' });
      return;
    }

    validateVenueMap(map);

    const venue: Venue = {
      id: nextId++,
      name,
      address,
      capacity,
      description: description || '',
      map,
      createdAt: new Date().toISOString()
    };

    venues.push(venue);
    res.status(201).json(venue);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Something went wrong!' });
    }
  }
};

// Update venue
export const updateVenue = (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id);
    const { name, address, capacity, description, map } = req.body;

    const venueIndex = venues.findIndex(v => v.id === id);
    if (venueIndex === -1) {
      res.status(404).json({ message: 'Venue not found' });
      return;
    }

    validateVenueMap(map);

    const updatedVenue: Venue = {
      ...venues[venueIndex],
      name: name || venues[venueIndex].name,
      address: address || venues[venueIndex].address,
      capacity: capacity || venues[venueIndex].capacity,
      description: description || venues[venueIndex].description,
      map: map || venues[venueIndex].map,
      updatedAt: new Date().toISOString()
    };

    venues[venueIndex] = updatedVenue;
    res.status(200).json(updatedVenue);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Something went wrong!' });
    }
  }
};

// Delete venue
export const deleteVenue = (req: Request, res: Response): void => {
  const venueId = parseInt(req.params.id);
  const venueIndex = venues.findIndex(v => v.id === venueId);
  
  if (venueIndex === -1) {
    res.status(404).json({ message: 'Venue not found' });
    return;
  }

  venues = venues.filter(v => v.id !== venueId);
  res.status(204).send();
}; 