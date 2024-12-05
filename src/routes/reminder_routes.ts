import { Router, Request, Response } from "express";
import moment from "moment";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { scheduleReminder, cancelReminder } from "../utils/job/job";
import { reminderSchema } from "../schemas/reminder_schemas";
import { prisma } from "../services/reminder_service";
import { Job, scheduledJobs } from "node-schedule";
import { wordListData } from "../utils/wordlist/wordlist";

const router = Router();

// Create type for scheduled jobs map
interface ScheduledJobsMap {
  [key: string]: Job;
}

/**
 * @swagger
 * /api/reminder:
 *   post:
 *     summary: Create or update a reminder for a user
 *     tags: [Reminders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - deviceToken
 *               - startDate
 *               - endDate
 *               - frequency
 *             properties:
 *               userId:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               frequency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reminder created or updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/reminder", async (req: Request, res: Response) => {
  try {
    const validatedData = reminderSchema.parse(req.body);

    const start = moment(validatedData.startDate);
    const end = moment(validatedData.endDate);

    if (end.isBefore(start)) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    // Check if user already has an active reminder
    const existingReminder = await prisma.reminder.findFirst({
      where: { userId: validatedData.userId, isActive: true },
    });

    let reminder;
    if (existingReminder) {
      // Cancel existing reminder job
      await cancelReminder(existingReminder.id);

      // Update existing reminder
      reminder = await prisma.reminder.update({
        where: { id: existingReminder.id },
        data: validatedData,
      });
    } else {
      // Create new reminder
      reminder = await prisma.reminder.create({
        data: validatedData,
      });
    }

    // Schedule new job
    const job = await scheduleReminder(reminder, wordListData);

    if (job) {
      res.status(existingReminder ? 200 : 201).json({
        message: existingReminder
          ? "Reminder updated successfully"
          : "Reminder created successfully",
        reminder,
      });
    } else {
      throw new Error("Failed to schedule reminder");
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating/updating reminder:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/reminders/{userId}:
 *   get:
 *     summary: Get active reminder for a user
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active reminder for the user
 *       404:
 *         description: No active reminder found
 *       500:
 *         description: Server error
 */
router.get("/reminders/:userId", async (req: Request, res: Response) => {
  try {
    const reminder = await prisma.reminder.findFirst({
      where: { userId: req.params.userId, isActive: true },
    });

    if (!reminder) {
      return res
        .status(404)
        .json({ message: "No active reminder found for this user" });
    }

    res.json(reminder);
  } catch (error) {
    console.error("Error fetching reminder:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/reminder/{id}:
 *   delete:
 *     summary: Cancel a reminder
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reminder cancelled successfully
 *       404:
 *         description: Reminder not found
 *       500:
 *         description: Server error
 */
// In your DELETE route:
router.delete("/reminder/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reminder = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    const cancelled = await cancelReminder(id);

    if (cancelled) {
      // Update reminder in database
      await prisma.reminder.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ message: "Reminder cancelled successfully" });
    } else {
      res.status(404).json({ error: "No active job found for this reminder" });
    }
  } catch (error) {
    console.error("Error cancelling reminder:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
