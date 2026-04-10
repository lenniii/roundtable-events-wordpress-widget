import { queryOptions } from "@tanstack/react-query";
import { getUpcomingEvents } from "./fetch-upcoming-events";

export const upcomingEventsQueryOptions = queryOptions({
  queryKey: ["upcoming-events"],
  queryFn: () => getUpcomingEvents(),
});
