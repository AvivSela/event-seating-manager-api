import { Router } from 'express';
import { getEventsByUserId } from '../controllers/eventController';

const router = Router({ mergeParams: true }); // To access userId from parent router

// GET all events for a user
router.get('/', getEventsByUserId);

export default router; 