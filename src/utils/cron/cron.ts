// Helper function to parse frequency string
function parseFrequency(frequency: string) {
  const [time, period] = frequency.split(" ");
  const [hours, minutes] = time.split(":");

  return {
    hours: parseInt(hours),
    minutes: parseInt(minutes),
    period: period.toUpperCase(),
  };
}

// Helper function to create cron expression
function createCronExpression(hours: number, minutes: number, period: string) {
  let cronHours = hours;

  // Handle AM times
  if (period === "AM") {
    if (hours === 12) {
      cronHours = 0; // 12 AM is 0 in 24-hour format
    }
    // else case is not needed as cronHours is already set to hours
  }
  // Handle PM times
  else if (period === "PM") {
    if (hours !== 12) {
      cronHours += 12; // Add 12 to hours that are not 12 PM
    }
    // 12 PM stays as 12, so no change needed
  }

  // Pad single-digit hours and minutes with leading zeros
  let hoursStr = cronHours.toString().padStart(2, "0");
  let minutesStr = minutes.toString().padStart(2, "0");

  // Add logging for debugging
  console.log(
    `Converting ${hours}:${minutes} ${period} to cron: ${minutesStr} ${hoursStr} * * *`
  );

  return `${minutesStr} ${hoursStr} * * *`;
}

export { parseFrequency, createCronExpression };
