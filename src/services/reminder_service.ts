import { PrismaClient } from "@prisma/client";
import { scheduleReminder } from "../utils/job/job";

const prisma = new PrismaClient();

// Load and schedule all active reminders on server start
async function loadActiveReminders() {
  try {
    const activeReminders = await prisma.reminder.findMany({
      where: { isActive: true },
    });

    for (const reminder of activeReminders) {
      await scheduleReminder(reminder);
    }

    console.log(`Loaded ${activeReminders.length} active reminders`);
  } catch (error) {
    console.error("Error loading active reminders:", error);
  }
}

export { prisma, loadActiveReminders };
