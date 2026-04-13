import { DEFAULT_THEME } from "../constants";
import type { EventCardModel, EventTheme, EventsWidgetProps } from "../types";

type WidgetMountDataset = {
  events?: string;
  theme?: string;
};

function isTheme(value: string | undefined): value is EventTheme {
  return value === "light" || value === "dark";
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isEventCardModel(value: unknown): value is EventCardModel {
  if (!value || typeof value !== "object") {
    return false;
  }

  const event = value as Record<string, unknown>;

  return (
    typeof event.id === "number" &&
    Number.isFinite(event.id) &&
    typeof event.title === "string" &&
    typeof event.metaLabel === "string" &&
    isNullableString(event.location) &&
    typeof event.startDate === "string" &&
    isNullableString(event.endDate) &&
    typeof event.imageUrl === "string" &&
    typeof event.eventUrl === "string" &&
    isNullableString(event.mapsUrl) &&
    isNullableString(event.calendarUrl) &&
    isNullableString(event.description)
  );
}

function getTheme(theme: string | undefined): EventTheme {
  return isTheme(theme) ? theme : DEFAULT_THEME;
}

export function parseWidgetMountProps(input: WidgetMountDataset): EventsWidgetProps {
  const theme = getTheme(input.theme);

  if (!input.events?.trim()) {
    return {
      events: [],
      theme,
      integrationError: "Missing data-events attribute on #events-widget.",
    };
  }

  let parsedEvents: unknown;

  try {
    parsedEvents = JSON.parse(input.events);
  } catch {
    return {
      events: [],
      theme,
      integrationError: "Invalid JSON in data-events attribute.",
    };
  }

  if (!Array.isArray(parsedEvents) || parsedEvents.some((event) => !isEventCardModel(event))) {
    return {
      events: [],
      theme,
      integrationError: "Invalid event payload in data-events attribute.",
    };
  }

  return {
    events: parsedEvents,
    theme,
    integrationError: null,
  };
}
