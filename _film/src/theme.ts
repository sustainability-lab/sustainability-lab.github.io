import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadDMMono } from "@remotion/google-fonts/DMMono";

// Same tokens as the site (theme/light.scss, theme/dark.scss): Swiss red on warm paper.
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const M = 120; // outer margin

/** Pixel ratio of the render: 1 at 1080p, 2 with `--scale=2` (4K). Canvas layers draw at this density. */
export const DPR = typeof window === "undefined" ? 1 : Math.max(1, window.devicePixelRatio || 1);

const dmSans = loadDMSans("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin", "latin-ext"] });
const dmMono = loadDMMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const FONT = {
  head: "Arial, Helvetica, sans-serif",
  body: `${dmSans.fontFamily}, Arial, sans-serif`,
  mono: `${dmMono.fontFamily}, ui-monospace, monospace`,
  logo: "system-ui, -apple-system, sans-serif",
};

export const C = {
  paper: "#fffefa",
  ink: "#222522",
  muted: "#60645e",
  rule: "#d4d6ce",
  soft: "#f0efe8",
  ill: "#eee9db",
  red: "#b52d24",
  redDeep: "#8f231c",
  // dark scenes: the site's dark paper, a touch deeper for the screen
  night: "#151816",
  nightInk: "#eeefe9",
  nightMuted: "#8d968d",
  nightRule: "#353d37",
  nightSoft: "#1d221f",
  signal: "#e6483c", // brand red lifted for dark backgrounds
  pink: "#f1a399",
};

export type Tone = "light" | "dark";
export const tone = (t: Tone) =>
  t === "light"
    ? { bg: C.paper, ink: C.ink, muted: C.muted, rule: C.rule, soft: C.soft, red: C.red }
    : { bg: C.night, ink: C.nightInk, muted: C.nightMuted, rule: C.nightRule, soft: C.nightSoft, red: C.signal };
