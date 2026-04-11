# Roundtable Events WordPress Widget

This repository builds a single JavaScript bundle that auto-mounts the Roundtable events widget into a WordPress page.

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

Add a container with the expected id:

```html
<div id="events-widget"></div>
```

Then load the built bundle on the page:

```html
<script src="/path/to/roundtable-events-widget.js"></script>
```

If you are building from this repository and uploading the asset manually, use `dist/roundtable-events-widget.js`.

## Runtime Notes

- The widget mounts itself automatically when the script loads.
- If `#events-widget` is added after the script runs, the widget keeps watching the DOM and mounts when the container appears.
- Styles are isolated inside a shadow root so the host page should not override the widget UI.
- The script injects the Instrument Sans Google Fonts stylesheet into the page head.

## Example

See `docs/wordpress-widget-example.html` for a minimal standalone integration example.
