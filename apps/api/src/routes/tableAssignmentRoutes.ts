import express from 'express';
import {
  createTableAssignment,
  getTableAssignments,
  deleteTableAssignment
} from '../controllers/tableAssignmentController';

const router = express.Router();

// Table assignment routes
router.post('/events/:eventId/tables/:tableId/assignments', createTableAssignment);
router.get('/events/:eventId/tables/:tableId/assignments', getTableAssignments);
router.delete('/events/:eventId/tables/:tableId/assignments/:guestId', deleteTableAssignment);

export default router; 