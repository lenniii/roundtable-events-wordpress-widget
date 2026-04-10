import { DEFAULT_THEME } from "./features/events/constants";
import { EventCardGrid } from "./features/events/components/EventCardGrid";
import { mockActivities } from "./features/events/mock-activities";
import { normalizeActivity } from "./features/events/lib/normalize-activity";

const events = mockActivities.map(normalizeActivity);

export default function App() {
  return (
    <main>
      <div
        className={`rtw-widget ${DEFAULT_THEME === "dark" ? "dark" : ""} min-h-screen bg-stone-100 px-4 py-6 text-slate-900 dark:bg-[#1f2227] dark:text-zinc-100 sm:px-6 lg:px-8`}
      >
        <div className="mx-auto max-w-7xl">
          <EventCardGrid events={events} />
        </div>
      </div>
    </main>
  );
}
