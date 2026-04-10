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
