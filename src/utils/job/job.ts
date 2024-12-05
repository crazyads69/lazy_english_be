// utils/job/job.ts
import { Reminder } from "../../schemas/reminder_schemas";
import { createCronExpression, parseFrequency } from "../cron/cron";
import schedule, { Job } from "node-schedule";
import { admin } from "../firebase/firebase";

// Create a type for the scheduled jobs map
interface ScheduledJobs {
  [key: string]: Job;
}

// Helper function to schedule a reminder
async function scheduleReminder(reminderData: Reminder): Promise<Job | null> {
  try {
    const { hours, minutes, period } = parseFrequency(reminderData.frequency);
    const cronExpression = createCronExpression(hours, minutes, period);

    const job = schedule.scheduleJob(
      reminderData.id, // Use the reminder's ID as the job name
      {
        start: new Date(reminderData.startDate),
        end: new Date(reminderData.endDate),
        rule: cronExpression,
        tz: "UTC", // Explicitly set timezone
      },
      async function () {
        try {
          const message = {
            notification: {
              title: reminderData.title || "Thông báo học tập",
              body:
                reminderData.body ||
                "Đã đến giờ học tiếng Anh cùng Lazy English",
            },
            token: reminderData.deviceToken,
          };

          await admin.messaging().send(message);
          console.log(
            `Notification sent successfully for reminder ${reminderData.id}`
          );
        } catch (error) {
          console.error(
            `Error sending notification for reminder ${reminderData.id}:`,
            error
          );
        }
      }
    );

    if (job) {
      console.log(`Reminder ${reminderData.id} scheduled successfully`);
      return job;
    } else {
      console.error(`Failed to schedule reminder ${reminderData.id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error scheduling reminder ${reminderData.id}:`, error);
    return null;
  }
}

// Helper function to cancel a reminder
async function cancelReminder(id: string): Promise<boolean> {
  const scheduledJobs = schedule.scheduledJobs as ScheduledJobs;
  const job = scheduledJobs[id];

  if (job) {
    job.cancel();
    delete scheduledJobs[id];
    console.log(`Reminder job ${id} cancelled successfully`);
    return true;
  } else {
    console.log(`No active job found for reminder ${id}`);
    return false;
  }
}

export { scheduleReminder, cancelReminder };