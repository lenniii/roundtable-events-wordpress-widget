# Isolet WordPress Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package the existing events widget as an `isolet`-powered, WordPress-ready bundle that auto-mounts into `<div id="events-widget"></div>` and keeps its styles isolated from the host page.

**Architecture:** Keep [`src/events-widget.tsx`](/Users/lenni/projects/roundtable-events-widget/src/events-widget.tsx) as the React UI root, and introduce a thin bootstrap module that creates an `isolet` instance with the React adapter and mounts it into `#events-widget`. Move the distribution build from the current Vite app contract to an `isolet-js-cli` build, and rewrite the stylesheet defaults so they target the shadow host instead of `html`, `body`, or `#root`.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Tailwind CSS v4, Vite, Bun, `isolet-js`, `isolet-js-cli`, Vitest, jsdom

---

## File Structure

### Create

- `isolet.config.ts`
  - Defines the widget build entry and output format for the `isolet` CLI
- `src/wordpress-widget.tsx`
  - Creates the `isolet` instance, imports the widget CSS text, and exposes auto-mount helpers
- `src/wordpress-widget.test.tsx`
  - Verifies the WordPress auto-mount contract against `#events-widget`

### Modify

- `package.json`
  - Add `isolet`/test dependencies and switch scripts from app build to widget build
- `src/main.tsx`
  - Replace the Vite demo root mount with the new WordPress auto-mount bootstrap
- `src/styles.css`
  - Rewrite global defaults so they apply inside the widget host/shadow root
- `vite.config.ts`
  - Keep the current React/Tailwind/proxy setup and add the `isolet` CSS-text plugin
- `index.html`
  - Change the local preview container from `#root` to `#events-widget`

## Task 1: Add a failing test for the WordPress mount contract

**Files:**
- Modify: `package.json`
- Create: `src/wordpress-widget.test.tsx`

- [ ] **Step 1: Add the test runner dependencies and scripts before writing the first test**

Run:

```bash
bun add -d vitest jsdom
```

Update `package.json` scripts to include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "oxlint -c .oxlintrc.json .",
    "lint:fix": "oxlint -c .oxlintrc.json . --fix",
    "format": "oxfmt",
    "format:check": "oxfmt --check"
  }
}
```

- [ ] **Step 2: Write the failing test for auto-mount and missing-target behavior**

```tsx
// src/wordpress-widget.test.tsx
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("autoMountEventsWidget", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.resetModules();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => undefined)),
    );
  });

  it("mounts into #events-widget when the WordPress placeholder exists", async () => {
    document.body.innerHTML = '<div id="events-widget"></div>';

    const { autoMountEventsWidget } = await import("./wordpress-widget");
    const widget = autoMountEventsWidget(document);
    const target = document.getElementById("events-widget");

    expect(widget).not.toBeNull();
    expect(target?.shadowRoot).not.toBeNull();
  });

  it("returns null when the WordPress placeholder is absent", async () => {
    const { autoMountEventsWidget } = await import("./wordpress-widget");

    expect(autoMountEventsWidget(document)).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails for the right reason**

Run: `bun run test src/wordpress-widget.test.tsx`  
Expected: FAIL because `./wordpress-widget` does not exist yet.

- [ ] **Step 4: Commit the failing test harness**

```bash
git add package.json bun.lock src/wordpress-widget.test.tsx
git commit -m "test: cover wordpress widget auto-mount contract"
```

## Task 2: Implement the isolet bootstrap and make the new test pass

**Files:**
- Create: `src/wordpress-widget.tsx`
- Modify: `package.json`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install the `isolet` runtime before adding production code**

Run:

```bash
bun add isolet-js
```

- [ ] **Step 2: Add the widget bootstrap module that creates and mounts one isolated instance**

```tsx
// src/wordpress-widget.tsx
import { createIsolet } from "isolet-js";
import { react } from "isolet-js/react";
import EventsWidget from "./events-widget";
import styles from "./styles.css?raw";

function createEventsIsolet() {
  return createIsolet({
    name: "roundtable-events-widget",
    mount: react(EventsWidget),
    css: styles,
    isolation: "shadow-dom",
  });
}

export function mountEventsWidget(target: HTMLElement) {
  const widget = createEventsIsolet();
  widget.mount(target);
  return widget;
}

export function autoMountEventsWidget(doc: Document = document) {
  const target = doc.getElementById("events-widget");

  if (!target) {
    return null;
  }

  return mountEventsWidget(target);
}
```

- [ ] **Step 3: Replace the app-style Vite bootstrap with the WordPress auto-mount call**

```tsx
// src/main.tsx
import { autoMountEventsWidget } from "./wordpress-widget";

autoMountEventsWidget();
```

- [ ] **Step 4: Run the test again to verify the mount contract now passes**

Run: `bun run test src/wordpress-widget.test.tsx`  
Expected: PASS for both test cases, with the present-container case creating a shadow root on `#events-widget`.

- [ ] **Step 5: Commit the bootstrap implementation**

```bash
git add package.json bun.lock src/main.tsx src/wordpress-widget.tsx
git commit -m "feat: bootstrap isolet wordpress widget"
```

## Task 3: Move the build output from a Vite app to an isolet widget artifact

**Files:**
- Create: `isolet.config.ts`
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] **Step 1: Verify the current build contract is wrong for WordPress**

Run: `bun run build`  
Expected: PASS as a Vite app build, but the output is an HTML app shell plus assets rather than a single WordPress-ready widget bundle. Treat that as the failing build contract for this feature.

- [ ] **Step 2: Install the `isolet` CLI build dependency**

Run:

```bash
bun add -d isolet-js-cli
```

- [ ] **Step 3: Add the `isolet` config that points at the widget bootstrap entry**

```ts
// isolet.config.ts
import { defineConfig } from "isolet-js";

export default defineConfig({
  name: "roundtable-events-widget",
  entry: "./src/main.tsx",
  format: ["iife"],
  isolation: "shadow-dom",
});
```

- [ ] **Step 4: Change the package scripts so build now produces the widget bundle**

Update `package.json` scripts to:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && isolet-js-cli build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "oxlint -c .oxlintrc.json .",
    "lint:fix": "oxlint -c .oxlintrc.json . --fix",
    "format": "oxfmt",
    "format:check": "oxfmt --check"
  }
}
```

- [ ] **Step 5: Add the `isolet` CSS-text plugin to the existing Vite config so the raw CSS import resolves as widget CSS text**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cssTextPlugin } from "isolet-js/plugins/css-text";

export default defineConfig({
  plugins: [react(), tailwindcss(), cssTextPlugin()],
  server: {
    proxy: {
      "/rt-events-api": {
        target: "https://events.roundtable.it",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rt-events-api/, ""),
      },
    },
  },
});
```

- [ ] **Step 6: Run the build to verify the new packaging path works**

Run: `bun run build`  
Expected: PASS, with `dist/` containing a single IIFE widget artifact that WordPress can enqueue directly.

- [ ] **Step 7: Commit the build migration**

```bash
git add package.json bun.lock isolet.config.ts vite.config.ts
git commit -m "build: package widget with isolet cli"
```

## Task 4: Rewrite the stylesheet and preview shell for shadow-DOM mounting

**Files:**
- Modify: `src/styles.css`
- Modify: `index.html`

- [ ] **Step 1: Rewrite the widget stylesheet so defaults target the shadow host instead of the document root**

```css
/* src/styles.css */
@import "tailwindcss";

:host {
  display: block;
  min-width: 320px;
  font-family: "Instrument Sans", "Avenir Next", sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:host *,
:host *::before,
:host *::after {
  box-sizing: border-box;
}

.rtw-widget {
  min-width: 320px;
}
```

- [ ] **Step 2: Update the local preview HTML to match the WordPress mount target**

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Roundtable Events Widget</title>
  </head>
  <body>
    <div id="events-widget"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Run lint and the focused test after the CSS/preview migration**

Run: `bun run lint`  
Expected: PASS with no unused imports, invalid globals, or style-related lint regressions.

Run: `bun run test src/wordpress-widget.test.tsx`  
Expected: PASS, confirming the auto-mount contract still works after the style and preview changes.

- [ ] **Step 4: Commit the shadow-DOM stylesheet updates**

```bash
git add src/styles.css index.html
git commit -m "style: scope widget defaults to shadow host"
```

## Task 5: Final verification and WordPress handoff checks

**Files:**
- Verify only: `dist/*`

- [ ] **Step 1: Run the full local verification set**

Run: `bun run test`  
Expected: PASS.

Run: `bun run lint`  
Expected: PASS.

Run: `bun run build`  
Expected: PASS, producing the final WordPress-ready bundle in `dist/`.

- [ ] **Step 2: Smoke-test the real mount contract in the local preview page**

Run: `bun run dev`  
Expected: The page mounts automatically into `<div id="events-widget"></div>`, renders the widget inside a shadow root, and still shows the existing loading/success/empty/error states depending on the live API response.

- [ ] **Step 3: Confirm the no-op path manually**

Temporarily remove the `<div id="events-widget"></div>` placeholder from `index.html`, reload the page, and confirm there is no runtime crash or visible output. Restore the placeholder immediately after the check.

- [ ] **Step 4: Commit the verified integration state**

```bash
git add package.json bun.lock isolet.config.ts src/main.tsx src/styles.css src/wordpress-widget.tsx src/wordpress-widget.test.tsx vite.config.ts index.html
git commit -m "feat: ship isolet wordpress widget bundle"
```
