# Events API Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock event list with live upcoming events from the Round Table APIs, using TanStack Query suspense, skeleton cards for loading, and an inline retry flow for failures.

**Architecture:** Keep the existing card components presentational and introduce a small events data layer that fetches statutory years, derives the current year, loads the first activities page, and normalizes the result into `EventCardModel[]`. The widget shell owns suspense, empty-state rendering, and error recovery so transport concerns do not leak into `EventCard` or `EventCardGrid`.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Vite, Tailwind CSS v4

---

## File Structure

### Create

- `src/features/events/lib/fetch-upcoming-events.ts`
  - Fetch statutory years and activities, derive the current statutory year, and normalize API payloads into `EventCardModel[]`
- `src/features/events/lib/upcoming-events-query.ts`
  - Central TanStack Query options for the widget's live events query
- `src/features/events/components/EventCardSkeleton.tsx`
  - One skeleton card that matches the existing card rhythm closely
- `src/features/events/components/EventCardGridSkeleton.tsx`
  - Grid wrapper that renders multiple skeleton cards during suspense fallback
- `src/features/events/components/EventsEmptyState.tsx`
  - Compact empty state for successful-but-empty activity responses
- `src/features/events/components/EventsQueryBoundary.tsx`
  - Resettable error boundary and retry UI around the suspense content
- `src/features/events/components/UpcomingEventsGrid.tsx`
  - Suspense-driven render component that reads the live query and chooses between empty state or grid

### Modify

- `src/features/events/types.ts`
  - Add raw API contracts for statutory years and paginated activities
- `src/events-widget.tsx`
  - Replace mock data wiring with suspense, error boundary, retry, and live query rendering

### Manual verification only

Per user instruction, skip automated tests for this feature. Verification is `bun run build`, `bun run lint`, and manual browser checks.

## Task 1: Add API contracts and fetch composition

**Files:**
- Modify: `src/features/events/types.ts`
- Create: `src/features/events/lib/fetch-upcoming-events.ts`

- [ ] **Step 1: Extend the events types with statutory-year and paginated-response contracts**

```ts
// src/features/events/types.ts
export type Activity = {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  cover_picture: string | null;
  slug: string;
  api_endpoint_area: string;
  api_endpoint_description: string;
  latitude: string | null;
  longitude: string | null;
};

export type StatutoryYear = {
  name: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
};

export type ActivitiesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Activity[];
};

export type EventTheme = "light" | "dark";

export type EventCardModel = {
  id: number;
  title: string;
  metaLabel: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  imageUrl: string;
  eventUrl: string;
  mapsUrl: string | null;
  calendarUrl: string | null;
  description: string | null;
};
```

- [ ] **Step 2: Create one focused fetch module that owns both API calls and the composed live-events flow**

```ts
// src/features/events/lib/fetch-upcoming-events.ts
import { EVENTS_BASE_URL } from "../constants";
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
  const url = new URL("/api/statutory-years/", EVENTS_BASE_URL);
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
  const url = new URL("/api/activities/", EVENTS_BASE_URL);

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
```

- [ ] **Step 3: Run the build after the new contracts and fetch layer are in place**

Run: `bun run build`  
Expected: TypeScript and Vite complete successfully without introducing unused imports or broken event types.

- [ ] **Step 4: Commit the API-contract and fetch-layer work**

```bash
git add src/features/events/types.ts src/features/events/lib/fetch-upcoming-events.ts
git commit -m "feat: add live events fetch layer"
```

## Task 2: Add TanStack Query configuration and success/empty rendering

**Files:**
- Create: `src/features/events/lib/upcoming-events-query.ts`
- Create: `src/features/events/components/EventsEmptyState.tsx`
- Create: `src/features/events/components/UpcomingEventsGrid.tsx`

- [ ] **Step 1: Create a single query-options module for the live events request**

```ts
// src/features/events/lib/upcoming-events-query.ts
import { queryOptions } from "@tanstack/react-query";
import { getUpcomingEvents } from "./fetch-upcoming-events";

export const upcomingEventsQueryOptions = queryOptions({
  queryKey: ["upcoming-events"],
  queryFn: () => getUpcomingEvents(),
});
```

- [ ] **Step 2: Add a compact empty-state component for a successful but empty response**

```tsx
// src/features/events/components/EventsEmptyState.tsx
export function EventsEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-white/70 px-6 py-12 text-center text-slate-700 dark:border-white/15 dark:bg-zinc-900/70 dark:text-zinc-300">
      <p className="text-lg font-semibold tracking-[-0.02em]">Nessun evento disponibile</p>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">
        Non ci sono eventi futuri nella prima pagina dei risultati al momento.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create the suspense-driven grid component that reads the query result**

```tsx
// src/features/events/components/UpcomingEventsGrid.tsx
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
```

- [ ] **Step 4: Run lint after adding the query and state components**

Run: `bun run lint`  
Expected: no import-order, formatting, or unused-symbol violations in the new files.

- [ ] **Step 5: Commit the suspense-query and empty-state work**

```bash
git add src/features/events/lib/upcoming-events-query.ts src/features/events/components/EventsEmptyState.tsx src/features/events/components/UpcomingEventsGrid.tsx
git commit -m "feat: add suspense events query rendering"
```

## Task 3: Add skeleton loading and retryable error boundaries

**Files:**
- Create: `src/features/events/components/EventCardSkeleton.tsx`
- Create: `src/features/events/components/EventCardGridSkeleton.tsx`
- Create: `src/features/events/components/EventsQueryBoundary.tsx`

- [ ] **Step 1: Add a skeleton card that mirrors the current card structure closely**

```tsx
// src/features/events/components/EventCardSkeleton.tsx
export function EventCardSkeleton() {
  return (
    <article className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <header className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="h-5 w-32 rounded-full bg-slate-200 dark:bg-zinc-800" />
        <div className="size-5 rounded-full bg-slate-200 dark:bg-zinc-800" />
      </header>

      <div className="aspect-[1/0.92] w-full bg-slate-200 dark:bg-zinc-800" />

      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="space-y-2">
          <div className="h-5 w-4/5 rounded-full bg-slate-200 dark:bg-zinc-800" />
          <div className="h-5 w-3/5 rounded-full bg-slate-200 dark:bg-zinc-800" />
        </div>

        <div className="h-6 w-2/3 rounded-full bg-slate-200 dark:bg-zinc-800" />

        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-1/2 rounded-full bg-slate-200 dark:bg-zinc-800" />
          <div className="size-9 rounded-lg bg-slate-200 dark:bg-zinc-800" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-zinc-800" />
          <div className="h-4 w-11/12 rounded-full bg-slate-200 dark:bg-zinc-800" />
          <div className="h-4 w-4/5 rounded-full bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Add the suspense fallback grid that renders multiple skeleton cards**

```tsx
// src/features/events/components/EventCardGridSkeleton.tsx
import { EventCardSkeleton } from "./EventCardSkeleton";

type EventCardGridSkeletonProps = {
  count?: number;
};

export function EventCardGridSkeleton({ count = 6 }: EventCardGridSkeletonProps) {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <EventCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: Add a resettable error boundary with an inline retry button**

```tsx
// src/features/events/components/EventsQueryBoundary.tsx
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Component, type ReactNode } from "react";

type ResettableErrorBoundaryProps = {
  children: ReactNode;
  onReset: () => void;
};

type ResettableErrorBoundaryState = {
  error: Error | null;
};

class ResettableErrorBoundary extends Component<
  ResettableErrorBoundaryProps,
  ResettableErrorBoundaryState
> {
  state: ResettableErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ResettableErrorBoundaryState {
    return { error };
  }

  handleRetry = () => {
    this.props.onReset();
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          <p className="text-lg font-semibold tracking-[-0.02em]">
            Impossibile caricare gli eventi
          </p>
          <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-200">
            Controlla la connessione e riprova.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-zinc-200"
          >
            Riprova
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

type EventsQueryBoundaryProps = {
  children: ReactNode;
};

export function EventsQueryBoundary({ children }: EventsQueryBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ResettableErrorBoundary onReset={reset}>{children}</ResettableErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

- [ ] **Step 4: Run the build with the new suspense fallback and error boundary components**

Run: `bun run build`  
Expected: the new class-based error boundary and suspense fallback compile cleanly in the existing React 19 setup.

- [ ] **Step 5: Commit the loading and retry UI**

```bash
git add src/features/events/components/EventCardSkeleton.tsx src/features/events/components/EventCardGridSkeleton.tsx src/features/events/components/EventsQueryBoundary.tsx
git commit -m "feat: add widget loading and retry states"
```

## Task 4: Integrate the live query into the widget shell

**Files:**
- Modify: `src/events-widget.tsx`

- [ ] **Step 1: Replace the mock-data wiring with suspense, retry, and live query rendering**

```tsx
// src/events-widget.tsx
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
```

- [ ] **Step 2: Run lint and build together before manual browser checks**

Run: `bun run lint`  
Expected: no lint violations in the integrated widget shell.

Run: `bun run build`  
Expected: production build completes successfully with the live-query widget entrypoint.

- [ ] **Step 3: Perform manual verification in the browser**

Run: `bun run dev`  
Expected: the widget boots locally and shows skeleton cards before the live data resolves.

Manual checks:

- verify the first render shows the skeleton grid
- verify the resolved cards come from the live API, not `mockActivities`
- verify only first-page results are shown
- verify the widget still hides location/description rows when fields are missing
- temporarily change `EVENTS_BASE_URL` to `https://events.invalid`, reload, confirm the retry panel appears, then restore the real base URL
- after restoring the real base URL, click `Riprova` and confirm the live events load again

- [ ] **Step 4: Commit the widget integration**

```bash
git add src/events-widget.tsx
git commit -m "feat: load live events in widget"
```

## Task 5: Final cleanup and handoff verification

**Files:**
- Modify: `src/features/events/types.ts`
- Modify: `src/features/events/lib/fetch-upcoming-events.ts`
- Modify: `src/features/events/lib/upcoming-events-query.ts`
- Modify: `src/features/events/components/EventCardSkeleton.tsx`
- Modify: `src/features/events/components/EventCardGridSkeleton.tsx`
- Modify: `src/features/events/components/EventsEmptyState.tsx`
- Modify: `src/features/events/components/EventsQueryBoundary.tsx`
- Modify: `src/features/events/components/UpcomingEventsGrid.tsx`
- Modify: `src/events-widget.tsx`

- [ ] **Step 1: Re-read the final live-events files and remove any low-signal duplication or dead code**

Focus points:

- keep fetch ownership in `fetch-upcoming-events.ts`
- keep render branching in `UpcomingEventsGrid.tsx`
- keep retry UI isolated in `EventsQueryBoundary.tsx`
- avoid pushing API logic back down into `EventCard` or `EventCardGrid`

- [ ] **Step 2: Run the final verification commands**

Run: `bun run lint`  
Expected: PASS

Run: `bun run build`  
Expected: PASS

- [ ] **Step 3: Commit the cleanup pass if any file changed**

```bash
git add src/features/events/types.ts src/features/events/lib/fetch-upcoming-events.ts src/features/events/lib/upcoming-events-query.ts src/features/events/components/EventCardSkeleton.tsx src/features/events/components/EventCardGridSkeleton.tsx src/features/events/components/EventsEmptyState.tsx src/features/events/components/EventsQueryBoundary.tsx src/features/events/components/UpcomingEventsGrid.tsx src/events-widget.tsx
git commit -m "chore: polish live events widget"
```
