import { EVENTS_BASE_URL } from "../constants";

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function toGoogleCalendarDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export function buildEventUrl(slug: string): string {
  return `${EVENTS_BASE_URL}/activity/${slug}/`;
}

export function buildMapsUrl(location: string | null): string | null {
  if (!location) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function buildCalendarUrl(input: {
  title: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  location: string | null;
}): string | null {
  if (!input.startDate) {
    return null;
  }

  const startDate = new Date(input.startDate);

  if (!isValidDate(startDate)) {
    return null;
  }

  const endDate = input.endDate ? new Date(input.endDate) : startDate;
  const safeEndDate = isValidDate(endDate) ? endDate : startDate;
  const searchParams = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${toGoogleCalendarDate(startDate)}/${toGoogleCalendarDate(safeEndDate)}`,
  });

  if (input.description) {
    searchParams.set("details", input.description);
  }

  if (input.location) {
    searchParams.set("location", input.location);
  }

  return `https://www.google.com/calendar/render?${searchParams.toString()}`;
}
