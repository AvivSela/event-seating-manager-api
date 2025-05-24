import express from 'express';
import {
  createGuest,
  getEventGuests,
  getGuest,
  updateGuest,
  deleteGuest
} from '../controllers/guestController';

const router = express.Router();

/**
 * @openapi
 * /api/events/{eventId}/guests:
 *   get:
 *     tags:
 *       - Guests
 *     summary: Get all guests for an event
 *     description: Retrieve a list of all guests for a specific event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The event ID
 *     responses:
 *       200:
 *         description: A list of guests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Guest'
 *       404:
 *         description: Event not found
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
router.get('/events/:eventId/guests', getEventGuests);

/**
 * @openapi
 * /api/events/{eventId}/guests/{guestId}:
 *   get:
 *     tags:
 *       - Guests
 *     summary: Get a guest by ID
 *     description: Retrieve a single guest by their ID for a specific event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The event ID
 *       - in: path
 *         name: guestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The guest ID
 *     responses:
 *       200:
 *         description: Guest found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guest'
 *       404:
 *         description: Guest or event not found
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
router.get('/events/:eventId/guests/:guestId', getGuest);

/**
 * @openapi
 * /api/events/{eventId}/guests:
 *   post:
 *     tags:
 *       - Guests
 *     summary: Create a new guest
 *     description: Create a new guest for a specific event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               status:
 *                 type: string
 *                 enum: ['PENDING', 'CONFIRMED', 'DECLINED', 'MAYBE']
 *             required:
 *               - name
 *               - email
 *     responses:
 *       201:
 *         description: Guest created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guest'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
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
router.post('/events/:eventId/guests', createGuest);

/**
 * @openapi
 * /api/events/{eventId}/guests/{guestId}:
 *   put:
 *     tags:
 *       - Guests
 *     summary: Update a guest
 *     description: Update a guest's information for a specific event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The event ID
 *       - in: path
 *         name: guestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The guest ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               status:
 *                 type: string
 *                 enum: ['PENDING', 'CONFIRMED', 'DECLINED', 'MAYBE']
 *     responses:
 *       200:
 *         description: Guest updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guest'
 *       404:
 *         description: Guest or event not found
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
router.put('/events/:eventId/guests/:guestId', updateGuest);

/**
 * @openapi
 * /api/events/{eventId}/guests/{guestId}:
 *   delete:
 *     tags:
 *       - Guests
 *     summary: Delete a guest
 *     description: Delete a guest from a specific event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The event ID
 *       - in: path
 *         name: guestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The guest ID
 *     responses:
 *       204:
 *         description: Guest deleted successfully
 *       404:
 *         description: Guest or event not found
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
router.delete('/events/:eventId/guests/:guestId', deleteGuest);

export default router; 