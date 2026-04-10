export type Activity = {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  cover_picture: string | null;
  slug: string;
  api_endpoint_area: string;
  api_endpoint_description: string;
  latitude: string | null;
  longitude: string | null;
};

export type EventTheme = "light" | "dark";

export type EventCardModel = {
  id: number;
  title: string;
  metaLabel: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  imageUrl: string;
  eventUrl: string;
  mapsUrl: string | null;
  calendarUrl: string | null;
  description: string | null;
};
