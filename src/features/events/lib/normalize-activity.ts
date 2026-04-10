import { DEFAULT_EVENT_IMAGE } from "../constants";
import type { Activity, EventCardModel } from "../types";
import { buildCalendarUrl, buildEventUrl, buildMapsUrl } from "./build-event-links";
import { extractPlainText } from "./extract-plain-text";

export function normalizeActivity(activity: Activity): EventCardModel {
  const plainDescription = extractPlainText(activity.description);

  return {
    id: activity.id,
    title: activity.name,
    metaLabel: `${activity.api_endpoint_description} · ${activity.api_endpoint_area}`,
    location: activity.location,
    startDate: activity.start_date,
    endDate: activity.end_date,
    imageUrl: activity.cover_picture ?? DEFAULT_EVENT_IMAGE,
    eventUrl: buildEventUrl(activity.slug),
    mapsUrl: buildMapsUrl(activity.location),
    calendarUrl: buildCalendarUrl({
      title: activity.name,
      startDate: activity.start_date,
      endDate: activity.end_date,
      description: plainDescription,
      location: activity.location,
    }),
    description: plainDescription,
  };
}
