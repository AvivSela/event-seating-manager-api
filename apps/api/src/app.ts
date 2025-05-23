import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes";
import eventRoutes from "./routes/eventRoutes";
import venueRoutes from "./routes/venueRoutes";
import guestRoutes from "./routes/guestRoutes";
import tableAssignmentRoutes from "./routes/tableAssignmentRoutes";
import { errorHandler } from './middleware/error-handler';

const app: Express = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api", guestRoutes);  // Guest routes are under /api/events/:eventId/guests
app.use("/api", tableAssignmentRoutes);  // Table assignment routes are under /api/events/:eventId/tables/:tableId/assignments

// Error handling middleware - must be last
app.use(errorHandler);

export default app;
