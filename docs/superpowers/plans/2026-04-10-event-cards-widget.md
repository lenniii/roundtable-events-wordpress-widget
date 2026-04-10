# Event Cards Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable, theme-aware Round Table event cards grid using local mock data and card interactions that mirror the live site.

**Architecture:** Create a small `src/features/events` slice that separates mock data, formatting/link helpers, and presentational components. Keep fetching out of the UI so the later API step can normalize live payloads into the same card contract without rewriting the card components.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4

---

## File Structure

### Create

- `src/features/events/types.ts`
  - Raw API-aligned activity types and normalized card model
- `src/features/events/constants.ts`
  - Shared URLs, fallback image, and theme type
- `src/features/events/mock-activities.ts`
  - Local sample activities copied from the live payload shape
- `src/features/events/lib/extract-plain-text.ts`
  - HTML-to-plain-text cleanup for card excerpts and calendar details
- `src/features/events/lib/format-italian-date-range.ts`
  - Stable `it-IT` date formatting using `Europe/Rome`
- `src/features/events/lib/build-event-links.ts`
  - Event detail, Google Maps, and Google Calendar URLs
- `src/features/events/lib/normalize-activity.ts`
  - Mapping from raw activity payload to normalized card props
- `src/features/events/components/EventCard.tsx`
  - Single card UI and inline icon markup
- `src/features/events/components/EventCardGrid.tsx`
  - Responsive grid wrapper

### Modify

- `src/events-widget.tsx`
  - Replace the scaffold hero with the widget demo shell
- `src/styles.css`
  - Add class-based dark variant support and keep global styles minimal

### Manual verification only

The approved scope explicitly skips automated tests for this app. Verification is manual plus `bun run build`.

## Task 1: Create the event feature model and mock data

**Files:**
- Create: `src/features/events/types.ts`
- Create: `src/features/events/constants.ts`
- Create: `src/features/events/mock-activities.ts`

- [ ] **Step 1: Create the event types**

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

- [ ] **Step 2: Add shared constants**

```ts
// src/features/events/constants.ts
import type { EventTheme } from "./types";

export const EVENTS_BASE_URL = "https://events.roundtable.it";
export const DEFAULT_EVENT_IMAGE =
  "https://events.roundtable.it/static/events_app/images/og-default.png";

export const DEFAULT_THEME: EventTheme = "dark";
```

- [ ] **Step 3: Add mock activities using the real payload shape**

```ts
// src/features/events/mock-activities.ts
import type { Activity } from "./types";

export const mockActivities: Activity[] = [
  {
    id: 294,
    name: "RT36 VERONA - CONVIVIALE",
    description: "<p>RT36 VERONA - CONVIVIALE</p>",
    start_date: "2026-04-09T20:00:00+02:00",
    end_date: "2026-04-09T22:00:00+02:00",
    location: "MR MARTINI",
    cover_picture:
      "https://roundtable-prd.s3.eu-central-1.amazonaws.com/1989/cover_picture/56c3310e-06b6-4eb4-9335-16b1335446ec.jpeg",
    slug: "2026-04-09-rt36-verona-conviviale",
    api_endpoint_area: "Zona 1",
    api_endpoint_description: "RT 36 Verona",
    latitude: "45.41912510",
    longitude: "10.98893600",
  },
  {
    id: 290,
    name: "CHAMPAGNATA",
    description:
      "<p>La Round Table 7 Bologna ha il piacere di invitarVi alla <strong>“Champagnata”</strong> che si terrà venerdì 17 aprile 2026 a partire dalle ore 20:30, presso Villa Orsi in Via dei Drappieri, 40050 Funo di Argelato, Bologna.</p>",
    start_date: "2026-04-17T20:30:00+02:00",
    end_date: "2026-04-17T22:30:00+02:00",
    location: "Villa Orsi in Via dei Drappieri, 40050 Funo di Argelato, Bologna",
    cover_picture: null,
    slug: "2026-04-17-champagnata",
    api_endpoint_area: "Zona 3",
    api_endpoint_description: "RT 07 Bologna",
    latitude: "44.58947010",
    longitude: "11.37429520",
  },
  {
    id: 98,
    name: "PIZZATA RT 18 NAPOLI",
    description:
      '<p>Come ogni anno la celebre "Pizzata" organizzata dalla RT 18 Napoli non mancherà di deliziare tutti coloro che vi parteciperanno con il piatto più famoso del mondo!</p>',
    start_date: "2026-04-11T09:00:00+02:00",
    end_date: "2026-04-11T11:00:00+02:00",
    location: "Napoli",
    cover_picture: null,
    slug: "2026-04-11-pizzata-rt-18-napoli",
    api_endpoint_area: "Zona 5",
    api_endpoint_description: "RT 18 Napoli",
    latitude: "40.85179830",
    longitude: "14.26812000",
  },
];
```

- [ ] **Step 4: Run the build to catch type or import mistakes early**

Run: `bun run build`  
Expected: `vite build` completes successfully and prints a built-assets summary.

- [ ] **Step 5: Commit the feature model and mock data**

```bash
git add src/features/events/types.ts src/features/events/constants.ts src/features/events/mock-activities.ts
git commit -m "feat: add event widget data model"
```

## Task 2: Add event formatting, cleanup, and link helpers

**Files:**
- Create: `src/features/events/lib/extract-plain-text.ts`
- Create: `src/features/events/lib/format-italian-date-range.ts`
- Create: `src/features/events/lib/build-event-links.ts`
- Create: `src/features/events/lib/normalize-activity.ts`

- [ ] **Step 1: Add HTML cleanup for card descriptions**

```ts
// src/features/events/lib/extract-plain-text.ts
export function extractPlainText(html: string | null): string | null {
  if (!html) {
    return null;
  }

  const documentFragment = new DOMParser().parseFromString(html, "text/html");
  const text = documentFragment.body.textContent?.replace(/\s+/g, " ").trim();

  return text ? text : null;
}
```

- [ ] **Step 2: Add stable Italian date formatting**

```ts
// src/features/events/lib/format-italian-date-range.ts
const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Rome",
});

const timeFormatter = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Rome",
});

export function formatItalianDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const formattedDate = dateFormatter.format(start).replace(".", "");
  const formattedStartTime = timeFormatter.format(start);

  if (!endDate) {
    return `${formattedDate}, ${formattedStartTime}`;
  }

  const end = new Date(endDate);
  const formattedEndTime = timeFormatter.format(end);

  return `${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`;
}
```

- [ ] **Step 3: Add event, maps, and calendar link builders**

```ts
// src/features/events/lib/build-event-links.ts
import { EVENTS_BASE_URL } from "../constants";

function toGoogleCalendarDate(value: string): string {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildEventUrl(slug: string): string {
  return `${EVENTS_BASE_URL}/activity/${slug}/`;
}

export function buildMapsUrl(location: string | null): string | null {
  if (!location) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function buildCalendarUrl(input: {
  title: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  location: string | null;
}): string | null {
  if (!input.startDate) {
    return null;
  }

  const endDate = input.endDate ?? input.startDate;
  const searchParams = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${toGoogleCalendarDate(input.startDate)}/${toGoogleCalendarDate(endDate)}`,
  });

  if (input.description) {
    searchParams.set("details", input.description);
  }

  if (input.location) {
    searchParams.set("location", input.location);
  }

  return `https://www.google.com/calendar/render?${searchParams.toString()}`;
}
```

- [ ] **Step 4: Add activity normalization for the card layer**

```ts
// src/features/events/lib/normalize-activity.ts
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
```

- [ ] **Step 5: Run the build again after adding the helpers**

Run: `bun run build`  
Expected: `tsc --noEmit` and `vite build` finish without errors.

- [ ] **Step 6: Commit the helper layer**

```bash
git add src/features/events/lib/extract-plain-text.ts src/features/events/lib/format-italian-date-range.ts src/features/events/lib/build-event-links.ts src/features/events/lib/normalize-activity.ts
git commit -m "feat: add event widget formatting helpers"
```

## Task 3: Build the reusable event card components

**Files:**
- Create: `src/features/events/components/EventCard.tsx`
- Create: `src/features/events/components/EventCardGrid.tsx`

- [ ] **Step 1: Create the grid wrapper**

```tsx
// src/features/events/components/EventCardGrid.tsx
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
```

- [ ] **Step 2: Create the card component with the live-site interactions**

```tsx
// src/features/events/components/EventCard.tsx
import type { EventCardModel } from "../types";
import { formatItalianDateRange } from "../lib/format-italian-date-range";

type EventCardProps = {
  event: EventCardModel;
};

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-1 size-5 shrink-0">
      <path
        d="M12 21s6-5.686 6-11a6 6 0 1 0-12 0c0 5.314 6 11 6 11Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 13h4M12 17h4M8 13h.01M8 17h.01" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path
        d="m12 3.6 2.59 5.24 5.79.84-4.19 4.08.99 5.77L12 16.8l-5.18 2.73.99-5.77L3.62 9.68l5.79-.84L12 3.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white text-slate-900 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100">
      <header className="flex items-center justify-between gap-3 px-5 py-4">
        <p className="min-w-0 text-[1.05rem] leading-none font-medium tracking-[-0.02em]">
          {event.metaLabel}
        </p>
        <span className="shrink-0 text-slate-500 dark:text-zinc-400">
          <StarIcon />
        </span>
      </header>

      <a href={event.eventUrl} target="_blank" rel="noreferrer" className="block">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="aspect-[1/0.92] w-full object-cover"
          loading="lazy"
        />
      </a>

      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <h2 className="line-clamp-2 text-[1.1rem] leading-tight font-semibold uppercase">
          {event.title}
        </h2>

        {event.mapsUrl ? (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2 text-[1.02rem] leading-8 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span className="text-red-500 dark:text-red-400">
              <PinIcon />
            </span>
            <span>{event.location}</span>
          </a>
        ) : null}

        <div className="flex items-center justify-between gap-3 text-[1.02rem] leading-none text-slate-700 dark:text-zinc-300">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-slate-500 dark:text-zinc-400">
              <CalendarIcon />
            </span>
            <span className="truncate">{formatItalianDateRange(event.startDate, event.endDate)}</span>
          </div>

          {event.calendarUrl ? (
            <a
              href={event.calendarUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Aggiungi ${event.title} a Google Calendar`}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-black/15 text-slate-500 hover:bg-slate-100 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <CalendarIcon />
            </a>
          ) : null}
        </div>

        {event.description ? (
          <p className="line-clamp-3 text-[1rem] leading-8 text-slate-600 dark:text-zinc-400">
            {event.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Run the build after the component layer lands**

Run: `bun run build`  
Expected: the build succeeds and the generated bundle includes the new card components.

- [ ] **Step 4: Commit the card components**

```bash
git add src/features/events/components/EventCard.tsx src/features/events/components/EventCardGrid.tsx
git commit -m "feat: add reusable event card components"
```

## Task 4: Wire the demo page and theme-aware app shell

**Files:**
- Modify: `src/events-widget.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Replace the scaffold app with the event widget demo**

```tsx
// src/events-widget.tsx
import { DEFAULT_THEME } from "./features/events/constants";
import { EventCardGrid } from "./features/events/components/EventCardGrid";
import { mockActivities } from "./features/events/mock-activities";
import { normalizeActivity } from "./features/events/lib/normalize-activity";

const events = mockActivities.map(normalizeActivity);

export default function App() {
  return (
    <main className={DEFAULT_THEME === "dark" ? "dark" : undefined}>
      <div className="rtw-widget min-h-screen bg-stone-100 px-4 py-6 text-slate-900 dark:bg-[#1f2227] dark:text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <EventCardGrid events={events} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Update the global stylesheet for class-based dark mode and minimal app defaults**

```css
/* src/styles.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  font-family: "Instrument Sans", "Avenir Next", sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-width: 320px;
  min-height: 100%;
}

body {
  margin: 0;
}
```

- [ ] **Step 3: Run the production build**

Run: `bun run build`  
Expected: `tsc --noEmit` passes and Vite emits the production bundle without warnings that block the build.

- [ ] **Step 4: Run the local dev server for manual verification**

Run: `bun run dev`  
Expected: a local Vite URL appears and the page shows only the widget background plus the responsive cards grid.

- [ ] **Step 5: Manually verify the approved behaviors**

Check:
- image click opens `https://events.roundtable.it/activity/{slug}/`
- location click opens Google Maps search from the raw location string
- calendar button opens a Google Calendar template URL
- missing image uses the Round Table fallback asset
- missing description or location hides only that block
- title clamps to 2 lines and description clamps to 3 lines
- layout stays usable at 1, 2, and 3 columns
- changing `DEFAULT_THEME` between `"light"` and `"dark"` updates only the visual tokens

- [ ] **Step 6: Commit the demo shell**

```bash
git add src/events-widget.tsx src/styles.css
git commit -m "feat: render event cards widget demo"
```

## Self-Review

### Spec coverage

- responsive cards grid: Task 3 and Task 4
- light and dark support: Task 1 constants plus Task 4 theme shell
- mock-data-first approach: Task 1
- image, maps, and calendar interactions: Task 2 and Task 3
- plain-text description excerpts: Task 2 and Task 3
- widget-oriented style isolation: Task 4
- no automated tests: manual verification only in Task 4

### Placeholder scan

No unfinished placeholder language remains in this plan.

### Type consistency

The plan uses one raw activity type (`Activity`) and one normalized UI type (`EventCardModel`) throughout. The component layer only consumes normalized event data.
