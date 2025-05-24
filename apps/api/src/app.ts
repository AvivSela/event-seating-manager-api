import express, { Express, Request, Response, RequestHandler } from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
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

// Swagger UI
const options = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
};

app.use('/api-docs', swaggerUi.serve as unknown as RequestHandler[]);
app.use('/api-docs', swaggerUi.setup(specs, options) as unknown as RequestHandler);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api", guestRoutes);  // Guest routes are under /api/events/:eventId/guests
app.use("/api", tableAssignmentRoutes);  // Table assignment routes are under /api/events/:eventId/tables/:tableId/assignments

// Error handling middleware - must be last
app.use(errorHandler);

export default app;
