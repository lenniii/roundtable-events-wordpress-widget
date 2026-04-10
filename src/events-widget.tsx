import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { EventCardGridSkeleton } from "./features/events/components/EventCardGridSkeleton";
import { EventsQueryBoundary } from "./features/events/components/EventsQueryBoundary";
import { UpcomingEventsGrid } from "./features/events/components/UpcomingEventsGrid";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export default function EventsWidget() {
  return (
    <QueryClientProvider client={queryClient}>
      <section
        id="events-widget"
        className="rtw-widget min-h-screen bg-stone-100 px-4 py-6 text-slate-900 dark:bg-[#1f2227] dark:text-zinc-100 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <EventsQueryBoundary>
            <Suspense fallback={<EventCardGridSkeleton count={6} />}>
              <UpcomingEventsGrid />
            </Suspense>
          </EventsQueryBoundary>
        </div>
      </section>
    </QueryClientProvider>
  );
}
