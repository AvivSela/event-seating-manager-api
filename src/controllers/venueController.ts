import { Request, Response } from 'express';
import { Venue, CreateVenueDto, UpdateVenueDto, VenueMap } from '../types/venue';

export let venues: Venue[] = [];
let nextId = 1;

// For testing purposes
export const clearVenues = () => {
  venues = [];
};

// Validate map data
const validateMapData = (map: VenueMap): string | null => {
  if (!map.dimensions || !map.dimensions.width || !map.dimensions.height) {
    return 'Map dimensions must include width and height';
  }

  if (map.features) {
    for (const feature of map.features) {
      if (!feature.type || !feature.position || 
          typeof feature.position.x !== 'number' || 
          typeof feature.position.y !== 'number') {
        return 'Each feature must have a valid type and position';
      }
    }
  }

  return null;
};

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
export const createVenue = (
  req: Request<{}, {}, CreateVenueDto>,
  res: Response
): void => {
  const { name, address, capacity, description, map } = req.body;

  if (!name || !address || !capacity) {
    res.status(400).json({ 
      message: 'Name, address, and capacity are required' 
    });
    return;
  }

  // Validate map data if provided
  if (map) {
    const mapError = validateMapData(map);
    if (mapError) {
      res.status(400).json({ message: mapError });
      return;
    }
  }

  const newVenue: Venue = {
    id: nextId++,
    name,
    address,
    capacity,
    description: description || '',
    map,
    createdAt: new Date()
  };

  venues.push(newVenue);
  res.status(201).json(newVenue);
};

// Update venue
export const updateVenue = (
  req: Request<{ id: string }, {}, UpdateVenueDto>,
  res: Response
): void => {
  const venueId = parseInt(req.params.id);
  const venueIndex = venues.findIndex(v => v.id === venueId);
  
  if (venueIndex === -1) {
    res.status(404).json({ message: 'Venue not found' });
    return;
  }

  const { name, address, capacity, description, map } = req.body;

  // Validate map data if provided
  if (map) {
    const mapError = validateMapData(map);
    if (mapError) {
      res.status(400).json({ message: mapError });
      return;
    }
  }

  const updatedVenue: Venue = {
    ...venues[venueIndex],
    name: name || venues[venueIndex].name,
    address: address || venues[venueIndex].address,
    capacity: capacity || venues[venueIndex].capacity,
    description: description || venues[venueIndex].description,
    map: map || venues[venueIndex].map,
    updatedAt: new Date()
  };

  venues[venueIndex] = updatedVenue;
  res.json(updatedVenue);
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