# Roundtable Event Cards Widget Design

## Goal

Recreate the event cards from `https://events.roundtable.it/` as a reusable widget-focused UI, starting with a standalone demo page that renders only the cards grid on the appropriate page background.

This phase covers only the card UI and local mock data. Filters, maps, favorites persistence, and live API wiring are explicitly out of scope for now.

## Scope

### In scope

- Reproduce the card layout as closely as practical to the source site
- Render a responsive cards grid
- Support both light and dark themes
- Use local mock data shaped to match the real activities payload closely
- Implement the card interactions that exist on the live site
- Build the styling with widget isolation in mind

### Out of scope

- Filtering controls
- Events map
- Favorites star behavior and local storage persistence
- Live API fetching
- Automated test coverage

## Success Criteria

- The cards are visually close to the live Round Table cards in both structure and spacing
- The widget can render a grid of cards responsively in narrow and wide containers
- Theme colors can switch between light and dark without changing component structure
- Image, location, and calendar interactions behave like the live site
- The UI layer is cleanly separated from future API fetching logic

## Recommended Approach

Use a staged widget architecture:

1. Build reusable presentational components first
2. Feed them normalized mock data that closely matches the live API shape
3. Keep formatting and URL-building logic in small helper utilities
4. Add API fetching in a later phase by mapping live payloads into the same normalized contract

This approach keeps the first milestone focused on visual fidelity while reducing rewrite risk during API integration.

## Architecture

### App shell

The standalone app will render only:

- the widget background surface
- a responsive grid of event cards

No filters, map, surrounding navigation, or theme switcher UI will be included in this phase.

### Units

#### `EventCardGrid`

Responsible for:

- rendering the list of cards
- handling the responsive column layout
- stretching cards to consistent row height

Responsive behavior:

- 1 column in narrow containers
- 2 columns in medium containers
- 3 columns when enough width is available

#### `EventCard`

Responsible for:

- rendering one normalized event
- applying theme-aware visual styles
- handling card-level actions and conditional rows

This component must remain presentational and must not fetch data directly.

#### Formatting helpers

Responsible for deriving UI-ready values from normalized event data:

- Italian date formatting
- plain-text description extraction from HTML
- event detail URL
- Google Maps URL
- Google Calendar URL
- image fallback selection

#### Mock dataset

Responsible for:

- providing local data for the first milestone
- staying close to the observed activities API fields so future API hookup is mechanical instead of architectural

## Data Model

The UI should normalize real activity payloads into one stable event shape for rendering.

Observed source fields from the live API that matter for cards:

- `name`
- `description`
- `start_date`
- `end_date`
- `location`
- `cover_picture`
- `slug`
- `api_endpoint_area`
- `api_endpoint_description`
- `latitude`
- `longitude`

Derived UI values:

- `metaLabel`
  - format: `{api_endpoint_description} · {api_endpoint_area}`
- `imageUrl`
  - `cover_picture` or site fallback image
- `eventUrl`
  - `https://events.roundtable.it/activity/{slug}/`
- `mapsUrl`
  - Google Maps search URL derived from the human-readable `location` string
- `calendarUrl`
  - Google Calendar template URL derived from event fields
- `plainDescription`
  - HTML-stripped and entity-decoded description text

## Card Structure

Each card should follow the live-site structure in this order:

1. Top meta row with endpoint description and area
2. Favorite star area
3. Large cover image
4. Event title
5. Location row
6. Date/time row with calendar action button
7. Description excerpt

### Favorite star

The live site shows a favorite star in the top-right area, but the requested first phase skips favorites persistence. The first milestone should therefore omit the behavior. The layout should still preserve a clean top-row composition rather than collapsing awkwardly.

### Image

- Fixed visual ratio similar to the live card
- Opens the event detail page in a new tab
- If no event image exists, use:
  - `https://events.roundtable.it/static/events_app/images/og-default.png`

### Title

- Render as plain text
- Clamp to 2 lines
- Not clickable in this phase, matching the live-site behavior described by the user

### Location row

- Show only if `location` exists
- Clicking the location opens a Google Maps search URL
- Use the location string as the search input

### Date row

- Show when `start_date` exists
- Format in Italian, independent of browser locale
- Target format:
  - `9 apr 2026, 20:00 - 22:00`
- If `end_date` is missing, render only the start date/time

### Calendar action

- Render as a separate action in the date row
- Open a Google Calendar template URL in a new tab
- Build the URL from event name, dates, location, and plain-text description
- If required inputs are missing, disable or hide only this action without breaking the card

### Description

- Strip HTML tags
- Decode HTML entities
- Render a short plain-text excerpt
- Clamp to 3 lines
- Hide if the description is missing or empty after cleanup

## Theming

The widget must support both light and dark themes from the first milestone.

### Theme method

Use Tailwind’s class-based theming approach. The widget root should be able to receive a theme class and drive all visual differences from that root.

### Theme tokens to cover

- page background
- card background
- border color
- primary text color
- secondary text color
- muted icon color
- interactive link color
- shadow strength

Theme support should not introduce alternate markup or layout branches. Only visual tokens should change.

## Style Isolation

The implementation should be widget-oriented from day one:

- keep the cards under a clear widget root
- avoid depending on broad global element styling
- keep card styles local to the widget structure

This prepares the UI for later iframe embedding or direct page injection without needing a structural rewrite.

## Error Handling and Fallbacks

For the UI-only phase, failure handling should remain simple and local to each card:

- missing image: use the known default site image
- missing location: hide the location row
- missing description: hide the description block
- missing end date: show only the start date/time
- missing maps or calendar inputs: disable or hide only the affected action

The card should degrade gracefully without collapsing layout quality.

## Testing Strategy

The user explicitly chose not to invest in automated tests for this app at this stage.

Phase-one verification should therefore be manual:

- compare the rendered cards against the live-site reference
- check responsive behavior across narrow and wide widths
- verify both light and dark theme rendering
- verify image, maps, and calendar links
- verify fallback behavior for missing fields

## Implementation Notes For Next Phase

When API wiring starts, fetching should be added outside the card components. The future data layer should:

- fetch statutory years separately
- fetch activities context separately
- fetch paginated activities separately
- normalize activity payloads into the UI event contract before rendering

That keeps the presentational layer stable and allows iframe/embed concerns to remain independent from transport details.
