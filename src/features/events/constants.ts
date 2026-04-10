import type { EventTheme } from "./types";

export const EVENTS_BASE_URL = "https://events.roundtable.it";
export const EVENTS_API_BASE_URL =
  import.meta.env.VITE_EVENTS_API_BASE_URL ??
  (import.meta.env.DEV ? "/rt-events-api" : EVENTS_BASE_URL);
export const DEFAULT_EVENT_IMAGE =
  `${EVENTS_BASE_URL}/static/events_app/images/og-default.png`;

export const DEFAULT_THEME: EventTheme = "dark";
