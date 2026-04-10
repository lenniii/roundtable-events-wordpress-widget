const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Rome",
});

const timeFormatter = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Rome",
});

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function formatDate(date: Date): string {
  return dateFormatter.format(date).replace(".", "");
}

export function formatItalianDateRange(
  startDate: string,
  endDate: string | null,
): string {
  const start = new Date(startDate);

  if (!isValidDate(start)) {
    return "";
  }

  const formattedStartDate = formatDate(start);
  const formattedStartTime = timeFormatter.format(start);

  if (!endDate) {
    return `${formattedStartDate}, ${formattedStartTime}`;
  }

  const end = new Date(endDate);

  if (!isValidDate(end)) {
    return `${formattedStartDate}, ${formattedStartTime}`;
  }

  const formattedEndDate = formatDate(end);
  const formattedEndTime = timeFormatter.format(end);

  if (formattedStartDate === formattedEndDate) {
    return `${formattedStartDate}, ${formattedStartTime} - ${formattedEndTime}`;
  }

  return `${formattedStartDate}, ${formattedStartTime} - ${formattedEndDate}, ${formattedEndTime}`;
}
