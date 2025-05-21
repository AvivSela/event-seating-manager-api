import { Router } from 'express';
import {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
} from '../controllers/venueController';

const router = Router();

// GET all venues
router.get('/', getAllVenues);

// GET single venue by ID
router.get('/:id', getVenueById);

// POST create new venue
router.post('/', createVenue);

// PUT update venue
router.put('/:id', updateVenue);

// DELETE venue
router.delete('/:id', deleteVenue);

export default router; 