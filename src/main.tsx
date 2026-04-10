import React from "react";
import ReactDOM from "react-dom/client";
import EventsWidget from "./events-widget.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EventsWidget />
  </React.StrictMode>,
);
