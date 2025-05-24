import express from 'express';
import {
  createTableAssignment,
  getTableAssignments,
  deleteTableAssignment
} from '../controllers/tableAssignmentController';

const router = express.Router();

/**
 * @openapi
 * /api/events/{eventId}/tables/{tableId}/assignments:
 *   get:
 *     tags:
 *       - Table Assignments
 *     summary: Get all assignments for a table
 *     description: Retrieve all guest assignments for a specific table at an event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The event ID
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The table ID
 *     responses:
 *       200:
 *         description: A list of table assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TableAssignment'
 *       404:
 *         description: Event or table not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/events/:eventId/tables/:tableId/assignments', getTableAssignments);

/**
 * @openapi
 * /api/events/{eventId}/tables/{tableId}/assignments:
 *   post:
 *     tags:
 *       - Table Assignments
 *     summary: Create a new table assignment
 *     description: Assign a guest to a specific table at an event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The event ID
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guestId:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - guestId
 *     responses:
 *       201:
 *         description: Table assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TableAssignment'
 *       400:
 *         description: Invalid input or table is full
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event, table, or guest not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/events/:eventId/tables/:tableId/assignments', createTableAssignment);

/**
 * @openapi
 * /api/events/{eventId}/tables/{tableId}/assignments/{guestId}:
 *   delete:
 *     tags:
 *       - Table Assignments
 *     summary: Delete a table assignment
 *     description: Remove a guest's assignment from a specific table at an event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The event ID
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The table ID
 *       - in: path
 *         name: guestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The guest ID
 *     responses:
 *       204:
 *         description: Table assignment deleted successfully
 *       404:
 *         description: Event, table, guest, or assignment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/events/:eventId/tables/:tableId/assignments/:guestId', deleteTableAssignment);

export default router; 