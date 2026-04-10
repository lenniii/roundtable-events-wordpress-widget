import { useSuspenseQuery } from "@tanstack/react-query";
import { upcomingEventsQueryOptions } from "../lib/upcoming-events-query";
import { EventCardGrid } from "./EventCardGrid";
import { EventsEmptyState } from "./EventsEmptyState";

export function UpcomingEventsGrid() {
  const { data: events } = useSuspenseQuery(upcomingEventsQueryOptions);

  if (events.length === 0) {
    return <EventsEmptyState />;
  }

  return <EventCardGrid events={events} />;
}
