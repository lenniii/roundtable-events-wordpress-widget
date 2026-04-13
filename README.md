# Roundtable Events WordPress Widget

This repository builds a single JavaScript bundle that auto-mounts the Roundtable events widget into a WordPress page.

The widget is render-only at runtime: PHP is expected to fetch the events data server-side and pass normalized props through `data-*` attributes on the mount element.

## Build

Install dependencies and build the widget:

```bash
bun install
bun run build
```

The production bundle is written to `dist/roundtable-events-widget.js`.

## Publish

GitHub Actions publishes the built widget bundle as a GitHub Release asset when code is pushed to `main`. The same workflow can also be started manually from the Actions tab with the `Publish` workflow.

Each run creates a release for the current commit and uploads `dist/roundtable-events-widget.js`.

## Embed

Add a container with the expected id and `data-*` props:

```html
<div
  id="events-widget"
  data-theme="dark"
  data-events="[...]"
></div>
```

`data-events` must contain a JSON-encoded array of normalized event cards with this shape:

```json
[
  {
    "id": 294,
    "title": "RT36 VERONA - CONVIVIALE",
    "metaLabel": "RT 36 Verona · Zona 1",
    "location": "MR MARTINI",
    "startDate": "2026-04-09T20:00:00+02:00",
    "endDate": "2026-04-09T22:00:00+02:00",
    "imageUrl": "https://events.roundtable.it/example.jpeg",
    "eventUrl": "https://events.roundtable.it/activity/2026-04-09-rt36-verona-conviviale/",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=MR%20MARTINI",
    "calendarUrl": "https://www.google.com/calendar/render?...",
    "description": "RT36 VERONA - CONVIVIALE"
  }
]
```

`data-theme` is optional and supports `dark` or `light`. If omitted or invalid, the widget falls back to `dark`.

Example PHP integration:

```php
<?php
$eventsJson = htmlspecialchars(json_encode($events, JSON_UNESCAPED_SLASHES), ENT_QUOTES, 'UTF-8');
$theme = 'dark';
?>

<div
  id="events-widget"
  data-theme="<?= htmlspecialchars($theme, ENT_QUOTES, 'UTF-8') ?>"
  data-events="<?= $eventsJson ?>"
></div>
```

Then load the built bundle on the page:

```html
<script src="/path/to/roundtable-events-widget.js"></script>
```

If you are building from this repository and uploading the asset manually, use `dist/roundtable-events-widget.js`.

## Runtime Notes

- The widget mounts itself automatically when the script loads.
- If `#events-widget` is added after the script runs, the widget keeps watching the DOM and mounts when the container appears.
- The widget does not fetch from the events API in the browser.
- Styles are isolated inside a shadow root so the host page should not override the widget UI.
- The script injects the Instrument Sans Google Fonts stylesheet into the page head.

## Example

See `docs/wordpress-widget-example.html` for a minimal standalone integration example.
