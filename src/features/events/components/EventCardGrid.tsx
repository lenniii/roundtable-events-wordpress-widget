import type { EventCardModel } from "../types";
import { EventCard } from "./EventCard";

type EventCardGridProps = {
  events: EventCardModel[];
};

export function EventCardGrid({ events }: EventCardGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  );
}
