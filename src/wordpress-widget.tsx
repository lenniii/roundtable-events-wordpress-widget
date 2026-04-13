import { createIsolet } from "isolet-js";
import { react } from "isolet-js/react";
import EventsWidget from "./events-widget";
import { parseWidgetMountProps } from "./features/events/lib/widget-mount-props";
import type { EventsWidgetProps } from "./features/events/types";
import widgetStyles from "./styles.css?inline";

const FONT_STYLESHEET_ID = "rtw-instrument-sans-font";
const FONT_STYLESHEET_URL =
  "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap";

const eventsWidgetIsolet = createIsolet<EventsWidgetProps>({
  name: "roundtable-events-widget",
  mount: react(EventsWidget),
  css: widgetStyles,
  isolation: "shadow-dom",
});

let mountedTarget: HTMLElement | null = null;
let mountObserver: MutationObserver | null = null;

function ensureFontStylesheet(doc: Document) {
  if (doc.getElementById(FONT_STYLESHEET_ID)) {
    return;
  }

  const link = doc.createElement("link");
  link.id = FONT_STYLESHEET_ID;
  link.rel = "stylesheet";
  link.href = FONT_STYLESHEET_URL;
  doc.head?.appendChild(link);
}

function mountIntoTarget(target: HTMLElement, props: EventsWidgetProps) {
  if (eventsWidgetIsolet.mounted && mountedTarget !== target) {
    return null;
  }

  eventsWidgetIsolet.mount(target, props);
  mountedTarget = target;
  mountObserver?.disconnect();
  mountObserver = null;
  return eventsWidgetIsolet;
}

export function autoMountEventsWidget(doc: Document = document) {
  const target = doc.getElementById("events-widget");

  if (!target) {
    if (doc.readyState === "loading") {
      doc.addEventListener(
        "DOMContentLoaded",
        () => {
          autoMountEventsWidget(doc);
        },
        { once: true },
      );
      return null;
    }

    if (!mountObserver) {
      mountObserver = new MutationObserver(() => {
        autoMountEventsWidget(doc);
      });

      mountObserver.observe(doc.documentElement, {
        childList: true,
        subtree: true,
      });
    }

    return null;
  }

  ensureFontStylesheet(doc);
  return mountIntoTarget(
    target,
    parseWidgetMountProps({
      events: target.dataset.events,
      theme: target.dataset.theme,
    }),
  );
}
