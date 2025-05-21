import express from 'express';
import {
  createGuest,
  getEventGuests,
  getGuest,
  updateGuest,
  deleteGuest
} from '../controllers/guestController';

const router = express.Router();

// Guest management routes
router.post('/events/:eventId/guests', createGuest);
router.get('/events/:eventId/guests', getEventGuests);
router.get('/events/:eventId/guests/:guestId', getGuest);
router.put('/events/:eventId/guests/:guestId', updateGuest);
router.delete('/events/:eventId/guests/:guestId', deleteGuest);

export default router; 