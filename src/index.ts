import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { loadActiveReminders, prisma } from "./services/reminder_service";
import reminderRoutes from "./routes/reminder_routes";
import { swaggerUi, specs } from "./swagger";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Store scheduled jobs in memory
const scheduledJobs = new Map();

app.use("/api", reminderRoutes);

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await loadActiveReminders();
});

app.get("/", (req: Request, res: Response) => {
  // Send a JSON response with a message
  res.json({ message: "Hello, World!" });
});

// Handle cleanup on server shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down server...");
  scheduledJobs.forEach((job) => job.cancel());
  await prisma.$disconnect();
  process.exit(0);
});
