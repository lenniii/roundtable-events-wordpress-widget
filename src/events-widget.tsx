import { EventsIntegrationErrorState } from "./features/events/components/EventsIntegrationErrorState";
import { EventCardGrid } from "./features/events/components/EventCardGrid";
import { EventsEmptyState } from "./features/events/components/EventsEmptyState";
import type { EventsWidgetProps } from "./features/events/types";

export default function EventsWidget({
  events,
  theme,
  integrationError,
}: EventsWidgetProps) {
  return (
    <section
      id="events-widget"
      className={[
        "rtw-widget min-h-screen bg-stone-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8",
        theme === "dark" ? "dark bg-[#1f2227] text-zinc-100" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto max-w-7xl">
        {integrationError ? (
          <EventsIntegrationErrorState message={integrationError} />
        ) : events.length === 0 ? (
          <EventsEmptyState />
        ) : (
          <EventCardGrid events={events} />
        )}
      </div>
    </section>
  );
}
