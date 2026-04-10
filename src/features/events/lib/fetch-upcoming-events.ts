import { EVENTS_API_BASE_URL } from "../constants";
import type { ActivitiesResponse, EventCardModel, StatutoryYear } from "../types";
import { normalizeActivity } from "./normalize-activity";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchStatutoryYears(): Promise<StatutoryYear[]> {
  const url = new URL(`${EVENTS_API_BASE_URL}/api/statutory-years/`, window.location.origin);

  return fetchJson<StatutoryYear[]>(url.toString());
}

export function getCurrentStatutoryYear(years: StatutoryYear[]): StatutoryYear {
  const currentYear = years.find((year) => year.is_current);

  if (!currentYear) {
    throw new Error("Current statutory year not found");
  }

  return currentYear;
}

export async function fetchActivities(input: {
  statutoryYear: string;
  startDate: string;
}): Promise<ActivitiesResponse> {
  const url = new URL(`${EVENTS_API_BASE_URL}/api/activities/`, window.location.origin);

  url.searchParams.set("statutory_year", input.statutoryYear);
  url.searchParams.set("page", "1");
  url.searchParams.set("start_date", input.startDate);

  return fetchJson<ActivitiesResponse>(url.toString());
}

export async function getUpcomingEvents(): Promise<EventCardModel[]> {
  const statutoryYears = await fetchStatutoryYears();
  const currentStatutoryYear = getCurrentStatutoryYear(statutoryYears);
  const activities = await fetchActivities({
    statutoryYear: currentStatutoryYear.name,
    startDate: new Date().toISOString(),
  });

  return activities.results.map(normalizeActivity);
}
