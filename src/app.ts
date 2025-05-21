import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes";
import eventRoutes from "./routes/eventRoutes";
import venueRoutes from "./routes/venueRoutes";

const app: Express = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/venues", venueRoutes);

export default app;
