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
      cronHours = 0;  // 12 AM is 0 in 24-hour format
    } else {
      cronHours = hours;  // Other AM hours stay the same
    }
  }
  // Handle PM times
  else if (period === "PM") {
    if (hours === 12) {
      cronHours = 12;  // 12 PM stays 12
    } else {
      cronHours = hours + 12;  // Other PM hours add 12
    }
  }

  // Add logging for debugging
  console.log(`Converting ${hours}:${minutes} ${period} to cron: ${minutes} ${cronHours} * * *`);

  return `${minutes} ${cronHours} * * *`;
}

export { parseFrequency, createCronExpression };
