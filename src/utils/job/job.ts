// utils/job/job.ts
import { Reminder } from "../../schemas/reminder_schemas";
import { createCronExpression, parseFrequency } from "../cron/cron";
import schedule, { Job, RecurrenceRule } from "node-schedule";
import { admin } from "../firebase/firebase";
import { WordList, Word } from "../../schemas/wordlist_schemas";

// Create a type for the scheduled jobs map
interface ScheduledJobs {
  [key: string]: Job;
}

// Add this function to randomly select a word
function getRandomWord(wordList: WordList): Word {
  const randomIndex = Math.floor(Math.random() * wordList.words.length);
  return wordList.words[randomIndex];
}

// Modify the scheduleReminder function
async function scheduleReminder(
  reminderData: Reminder,
  wordList: WordList
): Promise<Job | null> {
  try {
    const existingJob = schedule.scheduledJobs[reminderData.id];
    if (existingJob) {
      existingJob.cancel();
      console.log(`Canceled existing job with ID: ${reminderData.id}`);
    }

    console.log(`Attempting to schedule reminder for ${reminderData.id}`);
    console.log(`Reminder data:`, JSON.stringify(reminderData, null, 2));

    const { hours, minutes, period } = parseFrequency(reminderData.frequency);
    console.log(`Parsed frequency: ${hours}:${minutes} ${period}`);

    const cronExpression = createCronExpression(hours, minutes, period);
    console.log(`Created cron expression: ${cronExpression}`);

    const startDate = new Date(reminderData.startDate);
    // Set the start date to the beginning of the day (00:00:00.000)
    startDate.setHours(0, 0, 0, 0);

    // Set the end date to the end of the day (23:59:59.999)
    const endDate = new Date(reminderData.endDate);
    endDate.setHours(23, 59, 59, 999);

    console.log(`Start date: ${startDate}, End date: ${endDate}`);

    const rule = new RecurrenceRule();
    rule.hour = hours;
    rule.minute = minutes;
    console.log(`Recurrence rule: ${JSON.stringify(rule)}`);

    const job = schedule.scheduleJob(
      reminderData.id,
      { start: startDate, end: endDate, rule: cronExpression },
      async function () {
        try {
          const randomWord = getRandomWord(wordList);
          const message = {
            notification: {
              title: `${randomWord.name} ${randomWord.ipa}`,
              body: `*${randomWord.meaning}\n\n*Example: ${randomWord.example}`,
            },
            token: reminderData.deviceToken,
          };

          await admin.messaging().send(message);
          console.log(
            `Notification sent successfully for reminder ${reminderData.id} with word: ${randomWord.name}`
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
      console.log(`Next invocation: ${job.nextInvocation()}`);
      return job;
    } else {
      console.error(`Failed to schedule reminder ${reminderData.id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error scheduling reminder ${reminderData.id}:`, error);
    throw error;
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
