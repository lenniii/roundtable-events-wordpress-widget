import { EventCardGrid } from "./features/events/components/EventCardGrid";
import { mockActivities } from "./features/events/mock-activities";
import { normalizeActivity } from "./features/events/lib/normalize-activity";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles.css";

const queryClient = new QueryClient();

const events = mockActivities.map(normalizeActivity);

export default function EventsWidget() {
  return (
    <QueryClientProvider client={queryClient}>
      <section
        id="events-widget"
        className={`rtw-widget  min-h-screen bg-stone-100 px-4 py-6 text-slate-900 dark:bg-[#1f2227] dark:text-zinc-100 sm:px-6 lg:px-8`}
      >
        <div className="mx-auto max-w-7xl">
          <EventCardGrid events={events} />
        </div>
      </section>
    </QueryClientProvider>
  );
}
