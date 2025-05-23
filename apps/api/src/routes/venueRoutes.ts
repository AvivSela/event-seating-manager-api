import express from "express";
import {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} from "../controllers/venueController";

const router = express.Router();

// Wrap each route handler with error handling
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all venues
router.get("/", asyncHandler(getAllVenues));

// GET single venue by ID
router.get("/:id", asyncHandler(getVenueById));

// POST create new venue
router.post("/", asyncHandler(createVenue));

// PUT update venue
router.put("/:id", asyncHandler(updateVenue));

// DELETE venue
router.delete("/:id", asyncHandler(deleteVenue));

export default router;
