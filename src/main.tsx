import { DEFAULT_THEME } from "./features/events/constants";
import { normalizeActivity } from "./features/events/lib/normalize-activity";
import { mockActivities } from "./features/events/mock-activities";
import { autoMountEventsWidget } from "./wordpress-widget";

const target = document.getElementById("events-widget");

if (target && !target.dataset.events) {
  target.dataset.events = JSON.stringify(mockActivities.map(normalizeActivity));
  target.dataset.theme = target.dataset.theme ?? DEFAULT_THEME;
}

autoMountEventsWidget();
