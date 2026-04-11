import { createIsolet } from "isolet-js";
import { react } from "isolet-js/react";
import EventsWidget from "./events-widget";
import widgetStyles from "./styles.css?raw";

const eventsWidgetIsolet = createIsolet({
  name: "roundtable-events-widget",
  mount: react(EventsWidget),
  css: widgetStyles,
  isolation: "shadow-dom",
});

let mountedTarget: HTMLElement | null = null;

export function autoMountEventsWidget(doc: Document = document) {
  const target = doc.getElementById("events-widget");

  if (!target) {
    return null;
  }

  if (!eventsWidgetIsolet.mounted) {
    eventsWidgetIsolet.mount(target);
    mountedTarget = target;
  }

  if (mountedTarget === target) {
    return eventsWidgetIsolet;
  }

  return eventsWidgetIsolet;
}
