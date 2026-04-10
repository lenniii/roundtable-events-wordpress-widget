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

export function formatItalianDateRange(
  startDate: string,
  endDate: string | null,
): string {
  const start = new Date(startDate);
  const formattedDate = dateFormatter.format(start).replace(".", "");
  const formattedStartTime = timeFormatter.format(start);

  if (!endDate) {
    return `${formattedDate}, ${formattedStartTime}`;
  }

  const end = new Date(endDate);
  const formattedEndTime = timeFormatter.format(end);

  return `${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`;
}
