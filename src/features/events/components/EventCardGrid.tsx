import type { EventCardModel } from "../types";
import { EventCard } from "./EventCard";

type EventCardGridProps = {
  events: EventCardModel[];
};

export function EventCardGrid({ events }: EventCardGridProps) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </section>
  );
}
