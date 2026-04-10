# Isolet WordPress Widget Design

## Goal

Package the existing events widget as a self-contained browser bundle that can be enqueued by WordPress and mounted into:

```html
<div id="events-widget"></div>
```

The bundle should use `isolet` for runtime isolation and packaging so the widget can render inside WordPress without depending on the host page's CSS or application bootstrapping.

## Scope

### In scope

- package the widget with `isolet`
- auto-mount into the first `#events-widget` element when the script loads
- keep the existing React widget composition and live events data flow
- isolate widget styles from the host WordPress theme
- produce a single browser-ready artifact that WordPress can enqueue

### Out of scope

- supporting multiple widget instances on the same page
- exposing a public global mount API
- creating a WordPress plugin scaffold in this repository
- adding widget configuration via props or `data-*` attributes

## Success Criteria

- WordPress can enqueue one built JavaScript asset
- the script mounts the widget into `<div id="events-widget"></div>` without extra page code
- host page CSS does not break the widget layout
- widget CSS does not leak into the WordPress page
- the existing loading, success, empty, and error states continue to work

## Recommended Approach

Use `isolet` as both the widget runtime and the packaging layer.

The implementation should:

1. create an `isolet` widget with the React adapter
2. inline the widget CSS into the isolated root
3. find `document.getElementById("events-widget")` on script execution
4. mount once if the element exists
5. exit quietly if the element does not exist

This keeps the WordPress contract minimal while moving isolation concerns out of the page template.

## Architecture

### React widget root

Keep [`src/events-widget.tsx`](/Users/lenni/projects/roundtable-events-widget/src/events-widget.tsx) as the React composition root.

It should continue to own:

- the `QueryClientProvider`
- suspense fallback rendering
- query error boundary rendering
- the upcoming events grid

This avoids mixing packaging concerns into the widget UI logic.

### Isolet entry

Add a dedicated widget entry that is responsible for:

- creating the `isolet` instance
- connecting the React adapter to `EventsWidget`
- providing the widget CSS as an inline string
- locating the WordPress mount element
- mounting automatically on load

The existing app-style bootstrap in [`src/main.tsx`](/Users/lenni/projects/roundtable-events-widget/src/main.tsx) should be replaced or superseded by this entry.

### Build configuration

Add an `isolet` config file that points at the widget entry and emits a browser-ready distribution artifact.

The repository should stop treating this project as a Vite app deployment target. Vite may still be used as part of the CSS/build pipeline if needed, but the top-level build contract becomes "build a widget bundle for WordPress."

## CSS And Isolation

Use `isolet`'s `shadow-dom` isolation mode.

This is the safest default for WordPress because theme styles are often broad and unpredictable. The widget already depends on utility classes and a small set of base rules. Encapsulating those styles in the widget boundary is the main value of the integration.

The stylesheet in [`src/styles.css`](/Users/lenni/projects/roundtable-events-widget/src/styles.css) should be adjusted so widget-scoped defaults apply inside the isolated root instead of assuming global `html`, `body`, or `#root` targets.

The intended behavior is:

- widget typography and layout defaults remain intact
- host page resets do not affect the widget
- widget resets do not affect the host page

## Runtime Contract

The first version exposes no public JavaScript API.

WordPress integration is:

1. enqueue the built widget script
2. render `<div id="events-widget"></div>` where the widget should appear

When the script loads, it attempts to mount exactly once into that element.

If a future phase needs configuration from WordPress, the preferred extension path is to read `data-*` attributes from the mount element rather than introducing a global imperative API immediately.

## File-Level Changes

Expected implementation areas:

- add `isolet` dependencies in [`package.json`](/Users/lenni/projects/roundtable-events-widget/package.json)
- add `isolet` build configuration at the repo root
- add or update the widget bootstrap entry under `src/`
- adjust stylesheet targeting in [`src/styles.css`](/Users/lenni/projects/roundtable-events-widget/src/styles.css)
- keep [`src/events-widget.tsx`](/Users/lenni/projects/roundtable-events-widget/src/events-widget.tsx) focused on UI composition, not mounting

## Verification

Minimum verification for implementation:

- build the widget artifact successfully
- confirm the generated bundle mounts when loaded on a page containing `<div id="events-widget"></div>`
- confirm the bundle does nothing when the element is absent
- confirm the existing live events flow still renders loading, success, empty, and error states

If practical within current tooling, add a focused bootstrap test for auto-mount behavior. If not, rely on build verification plus a local browser smoke test.

## Risks And Constraints

### CSS pipeline compatibility

`isolet` expects CSS to be provided as text to the widget. If the current Tailwind/Vite setup does not directly provide inline compiled CSS in the required format, the build pipeline may need a small restructuring.

This is acceptable and should be treated as part of the migration rather than a reason to keep the current app-style bootstrap.

### Single-instance assumption

This design intentionally supports only one widget instance because the mount contract is `id="events-widget"`.

If multiple instances become necessary later, the contract should move to a selector like `data-events-widget` and the bootstrap should mount per matching node.
