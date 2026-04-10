# Events API Wiring Design

## Goal

Replace the widget's mock events with live data from `https://events.roundtable.it/` while preserving the current card UI contract.

This phase covers:

- fetching the current statutory year from `/api/statutory-years/`
- fetching the first page of upcoming activities from `/api/activities/`
- deriving `start_date` from the current time at request time
- rendering suspense skeleton cards during loading
- showing an inline retry action when either API call fails

Pagination, filters, and broader API client abstractions remain out of scope.

## Scope

### In scope

- use TanStack Query for the widget data fetch
- fetch the statutory years list and select the item where `is_current === true`
- fetch only `page=1` of activities for that statutory year
- set `start_date` to `new Date().toISOString()` when the activities request runs
- normalize the activities payload into the existing `EventCardModel`
- render a suspense fallback with skeleton cards that closely mirror the current card structure
- render an inline error state with a retry button
- render an inline empty state when the activities request succeeds with no results

### Out of scope

- pagination controls or loading additional pages
- user-configurable filters
- server-side rendering or route-level data loading
- automated tests beyond the current manual verification approach

## Success Criteria

- the widget loads the current statutory year dynamically instead of hardcoding it
- the widget loads live upcoming events from the first activities page
- loading uses suspense with low-layout-shift skeleton cards
- fetch failures render an inline retry affordance instead of a blank widget
- card components continue to receive normalized, presentation-ready data

## Recommended Approach

Use a single widget-level suspense query that orchestrates both API calls.

The query flow is:

1. fetch statutory years
2. select the current year where `is_current` is `true`
3. fetch activities with that year, `page=1`, and the current ISO timestamp as `start_date`
4. normalize `results` into `EventCardModel[]`

This keeps the widget surface simple:

- one suspense boundary
- one error boundary
- one retry path
- one stable data contract for the card grid

## Architecture

### Presentational boundary

Keep the current UI split intact:

- `EventCard` remains presentational
- `EventCardGrid` remains presentational
- both continue to consume `EventCardModel[]`

The live API integration should not add fetch logic to either card component.

### Data boundary

Add a small events data layer next to the existing feature code:

- low-level fetch helper for statutory years
- low-level fetch helper for activities
- one composed query function that returns normalized events

The composed query should be the only API consumed by the widget render layer.

### Widget composition

The widget shell should render:

- a suspense boundary with the skeleton grid as fallback
- an error boundary around the suspense content
- the live `EventCardGrid` on success

This keeps loading and failure behavior local to the widget rather than leaking into the card components.

## API Contracts

### Statutory years

Observed payload shape:

```ts
type StatutoryYear = {
  name: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
};
```

The widget uses only the item where `is_current === true` and reads its `name` for the activities request.

### Activities

Observed payload shape:

```ts
type ActivitiesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Activity[];
};
```

The widget uses only:

- `results` for rendering
- the existing card-relevant `Activity` fields already modeled in the feature

The widget intentionally ignores pagination metadata in this phase.

## Data Flow

### `fetchStatutoryYears()`

Returns the raw statutory years array from `/api/statutory-years/`.

### `getCurrentStatutoryYear()`

Finds the record where `is_current` is `true`.

If no current year exists, treat that as an error state rather than an empty result because the widget cannot produce a valid activities request.

### `fetchActivities({ statutoryYear, startDate })`

Calls `/api/activities/` with:

- `statutory_year=<current year name>`
- `page=1`
- `start_date=<current ISO timestamp>`

Returns the full paginated payload and leaves field normalization to the next layer.

### `getUpcomingEvents()`

Composes the two fetches and returns:

```ts
Promise<EventCardModel[]>
```

by mapping `response.results` through `normalizeActivity`.

## Rendering States

### Loading

Use React suspense for the initial fetch path.

The fallback should render a skeleton grid that closely mirrors the existing card layout:

- meta row placeholder
- image block placeholder
- title lines placeholder
- location row placeholder
- date row placeholder
- description lines placeholder

The intent is to preserve the current grid rhythm and minimize visible layout shift.

### Success

Render the normalized events through `EventCardGrid`.

### Empty

If the activities request succeeds and `results.length === 0`, render a compact empty state in the widget container instead of blank space.

This is distinct from an error because the API returned a valid response.

### Error

If either API request fails, or if no current statutory year can be selected, render an inline error panel in the widget container with:

- a short failure message
- a retry button

The retry action should re-run the full query chain rather than attempting partial local recovery.

## Retry Behavior

The retry action should integrate with the suspense/error-boundary flow rather than forcing a page reload.

Desired behavior:

- the error boundary catches the failed query render
- the retry button resets the boundary/query state
- the widget re-enters suspense and re-fetches both APIs

This keeps retry logic local and predictable.

## Card Data And Local Fallbacks

The existing normalization behavior remains valid for live data:

- missing `cover_picture`: use the existing default image
- missing `location`: hide the location row
- missing `description`: hide the description block
- missing `end_date`: render only the start date/time

Live API wiring should not change the card contract or card-level fallback behavior.

## File-Level Intent

The implementation should likely introduce or adjust code in these areas:

- events types for `StatutoryYear` and `ActivitiesResponse`
- fetch helpers for the two API endpoints
- a composed TanStack Query config or hook for upcoming events
- suspense skeleton components for the card grid
- widget-level error boundary and retry UI
- `events-widget.tsx` to swap mock data for the suspense-driven live query

The exact filenames can follow the existing `src/features/events` structure as long as the responsibilities remain clearly separated.

## Verification

Manual verification for this phase:

- confirm the widget fetches the current statutory year dynamically
- confirm the widget renders live first-page activities for that year
- confirm suspense shows skeleton cards during the initial load
- confirm a forced fetch failure shows the inline retry state
- confirm retry re-runs the requests successfully
- confirm an empty activities response renders the empty state
- run `bun run build`

## Deferred Work

Still deferred after this phase:

- pagination support
- filtering UI
- broader reusable API client abstraction
- automated test coverage
