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

  if (period === "PM" && hours !== 12) {
    cronHours = hours + 12;
  }
  if (period === "AM" && hours === 12) {
    cronHours = 0;
  }

  return `${minutes} ${cronHours} * * *`;
}

export { parseFrequency, createCronExpression };
