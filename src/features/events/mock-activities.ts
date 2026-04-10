import type { Activity } from "./types";

export const mockActivities: Activity[] = [
  {
    id: 294,
    name: "RT36 VERONA - CONVIVIALE",
    description: "<p>RT36 VERONA - CONVIVIALE</p>",
    start_date: "2026-04-09T20:00:00+02:00",
    end_date: "2026-04-09T22:00:00+02:00",
    location: "MR MARTINI",
    cover_picture:
      "https://roundtable-prd.s3.eu-central-1.amazonaws.com/1989/cover_picture/56c3310e-06b6-4eb4-9335-16b1335446ec.jpeg",
    slug: "2026-04-09-rt36-verona-conviviale",
    api_endpoint_area: "Zona 1",
    api_endpoint_description: "RT 36 Verona",
    latitude: "45.41912510",
    longitude: "10.98893600",
  },
  {
    id: 290,
    name: "CHAMPAGNATA",
    description:
      "<p>La Round Table 7 Bologna ha il piacere di invitarVi alla <strong>“Champagnata”</strong> che si terrà venerdì 17 aprile 2026 a partire dalle ore 20:30, presso Villa Orsi in Via dei Drappieri, 40050 Funo di Argelato, Bologna.</p>",
    start_date: "2026-04-17T20:30:00+02:00",
    end_date: "2026-04-17T22:30:00+02:00",
    location: "Villa Orsi in Via dei Drappieri, 40050 Funo di Argelato, Bologna",
    cover_picture: null,
    slug: "2026-04-17-champagnata",
    api_endpoint_area: "Zona 3",
    api_endpoint_description: "RT 07 Bologna",
    latitude: "44.58947010",
    longitude: "11.37429520",
  },
  {
    id: 98,
    name: "PIZZATA RT 18 NAPOLI",
    description:
      '<p>Come ogni anno la celebre "Pizzata" organizzata dalla RT 18 Napoli non mancherà di deliziare tutti coloro che vi parteciperanno con il piatto più famoso del mondo!</p>',
    start_date: "2026-04-11T09:00:00+02:00",
    end_date: "2026-04-11T11:00:00+02:00",
    location: "Napoli",
    cover_picture: null,
    slug: "2026-04-11-pizzata-rt-18-napoli",
    api_endpoint_area: "Zona 5",
    api_endpoint_description: "RT 18 Napoli",
    latitude: "40.85179830",
    longitude: "14.26812000",
  },
];
