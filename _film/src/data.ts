import film from "../public/film.json";

// Everything on screen that is not a data layer comes from public/film.json (made by scripts/prep.py).
export type Beat = { id: string; title: string; text?: string; tag?: string; question?: string; new?: boolean };
export type Chapter = { key: string; name: string; headline: string; beats: Beat[] };

export const F = film as unknown as {
  edition: string;
  url: string;
  join_url: string;
  music: string | null;
  hook: { word: string; caption: string }[];
  tagline: string;
  place: { kicker: string; coords: string; statement: string; coda: string };
  chapters: Chapter[];
  work: {
    kicker: string;
    venues: string[];
    wall: { venue: string; year: number; title: string; figure: string }[];
    badges: Record<string, string>;
    quarter_title: string;
    quarter: { when: string; type: string; text: string }[];
  };
  people: { title: string; photos: { src: string; caption: string; year: number }[] };
  alumni: {
    title: string;
    places: { name: string; lat: number; lon: number }[];
    also_at: string[];
    featured: { name: string; now: string; note: string; year: number; photo: string }[];
    counts: Record<string, number>;
  };
  join: { title: string; roles: string[]; text: string; email?: string };
  funders: string[];
  img: Record<string, string>;
  facts: Record<string, string | number>;
  dec2024: [string, number][];
};

export const chapter = (key: string) => F.chapters.find((c) => c.key === key)!;
export const beat = (key: string, id: string) => chapter(key).beats.find((b) => b.id === id)!;
