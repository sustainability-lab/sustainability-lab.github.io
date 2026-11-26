import React, { Children, cloneElement, isValidElement, useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { F } from "../../data";
import { equalEarth, geoDistance, GN, world } from "../../lib/geo";
import { E, lerp, pt, useT } from "../../lib/motion";
import { sigmoidPts, SignalPath } from "../../lib/signal";
import { C, DPR, FONT, H, M, W } from "../../theme";

// Drawings and layout for the lab slides (published at, life in the lab, alumni, join), made as the film makes them
// in src/scenes/Work.tsx, People.tsx, Alumni.tsx and Join.tsx. They hold no words: every word, name and number is
// written in the slide file, inside the elements these components place and animate. Times are seconds from the
// start of the slide, or of the build they are in.

type El = ReactElement<{ children?: ReactNode; style?: CSSProperties }>;
const els = (children: ReactNode) => Children.toArray(children).filter(isValidElement) as El[];
const withStyle = (el: El, style: CSSProperties) => cloneElement(el, { style: { ...style, ...el.props.style } });

/** Text styles from the film's lab scenes. Use as style={{ ...L.venue }} so the editor can add to them. */
export const L = {
  // Published at
  kicker: { fontFamily: FONT.body, fontWeight: 600, fontSize: 24, lineHeight: "normal", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", margin: 0 },
  venue: { fontFamily: FONT.head, fontWeight: 700, fontSize: 62, lineHeight: 1.02, letterSpacing: "-0.04em", color: "var(--ink)", margin: 0 },
  paper: { fontFamily: FONT.mono, fontSize: 24, lineHeight: 1.3, color: "var(--muted)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  badge: { display: "inline-block", margin: "10px 0 0", padding: "5px 10px", fontFamily: FONT.body, fontWeight: 700, fontSize: 21, lineHeight: "normal", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--bg)", background: "var(--red)" },
  // Life in the lab
  photoTitle: { fontFamily: FONT.head, fontWeight: 700, fontSize: 104, lineHeight: 1, letterSpacing: "-0.05em", color: C.paper, margin: 0 },
  photoYear: { fontFamily: FONT.mono, fontSize: 30, lineHeight: "normal", color: "#f6c2ba", margin: 0 },
  // Where our alumni are now
  mapTitle: { fontFamily: FONT.head, fontWeight: 700, fontSize: 84, lineHeight: 1, letterSpacing: "-0.045em", color: "var(--ink)", margin: 0 },
  place: { fontFamily: FONT.body, fontSize: 28, lineHeight: "32px", color: "var(--ink)", margin: 0, whiteSpace: "nowrap" },
  name: { fontFamily: FONT.head, fontWeight: 700, fontSize: 30, lineHeight: "normal", letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 },
  now: { fontFamily: FONT.body, fontSize: 22, lineHeight: 1.3, color: "var(--muted)", margin: "4px 0 0" },
  note: { fontFamily: FONT.mono, fontSize: 19, lineHeight: "normal", color: "var(--red)", margin: "4px 0 0" },
  also: { fontFamily: FONT.body, fontSize: 28, lineHeight: 1.35, color: "var(--ink)", margin: 0 },
  count: { fontFamily: FONT.mono, fontSize: 21, lineHeight: "normal", color: "var(--muted)", margin: 0 },
  // Join us
  join: { fontFamily: FONT.head, fontWeight: 700, fontSize: 250, lineHeight: 0.9, letterSpacing: "-0.06em", color: "var(--ink)", margin: 0 },
  role: { fontFamily: FONT.body, fontWeight: 600, fontSize: 40, lineHeight: "normal", color: "var(--ink)", margin: 0 },
  text: { fontFamily: FONT.body, fontSize: 38, lineHeight: 1.35, color: "var(--muted)", margin: 0 },
  url: { fontFamily: FONT.mono, fontSize: 40, lineHeight: "normal", color: "var(--red)", margin: 0 },
  scan: { fontFamily: FONT.mono, fontSize: 20, lineHeight: "normal", color: "var(--muted)", margin: "12px 0 0", textAlign: "center" },
  label: { fontFamily: FONT.body, fontWeight: 600, fontSize: 20, lineHeight: "normal", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 18px" },
  // the closing card: the lab's wordmark, its home and the edition
  wordmark: { fontFamily: FONT.logo, fontWeight: 400, fontSize: 108.8, lineHeight: 1.05, letterSpacing: 1.7, color: "#111111", margin: 0 },
  wordmarkLab: { fontFamily: FONT.logo, fontWeight: 300, fontSize: 61.2, lineHeight: 1.05, letterSpacing: 10.2, color: "#555555", margin: "2px 0 0" },
  home: { fontFamily: FONT.body, fontWeight: 500, fontSize: 40, lineHeight: "normal", color: "var(--ink)", margin: 0 },
  homeUrl: { fontFamily: FONT.mono, fontSize: 28, lineHeight: "normal", color: "var(--red)", margin: 0 },
  edition: { fontFamily: FONT.mono, fontSize: 19, lineHeight: "normal", color: "var(--muted)", margin: 0 },
} satisfies Record<string, CSSProperties>;

// ---------------------------------------------------------------------------------------------------------------
// Placing

/** Anything pinned to the frame's edges, in film pixels: a block that sits on the bottom margin, say. */
export const Pin: React.FC<{ left?: number; right?: number; top?: number; bottom?: number; w?: number; style?: CSSProperties; children: ReactNode }> = ({
  left,
  right,
  top,
  bottom,
  w,
  style,
  children,
}) => <div style={{ position: "absolute", left, right, top, bottom, width: w, ...style }}>{children}</div>;

/** A small square before a line of text, as the film marks its kickers and the open roles. `right`: flush right. */
export const Mark: React.FC<{ square: number; gap: number; color?: string; right?: boolean; children: ReactNode }> = ({ square, gap, color = "var(--red)", right, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap, justifyContent: right ? "flex-end" : undefined }}>
    <span style={{ width: square, height: square, background: color, flex: "none" }} />
    {children}
  </div>
);

/** A rule that draws from left to right. */
export const Line: React.FC<{ at?: number; x: number; y: number; w: number; height?: number; color?: string }> = ({ at = 0, x, y, w, height = 2, color = "var(--ink)" }) => {
  const t = useT();
  const a = pt(t, at, 0.9, E.inOut);
  return <div style={{ position: "absolute", left: x, top: y, width: w, height, background: color, transform: a < 1 ? `scaleX(${a})` : undefined, transformOrigin: "left" }} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Published at: the venue wall

/** The venue wall: four columns between the film's margins. Put a <Tile> in it for each venue. */
export const Wall: React.FC<{ top?: number; children: ReactNode }> = ({ top = 160, children }) => (
  <div style={{ position: "absolute", left: M, right: M, top, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "44px 34px" }}>{children}</div>
);

/**
 * One venue on the wall, in the order written: the paper's figure (<img>) wipes up in a white frame, the venue's name
 * rises, the paper's year and title fade in under it. Anything after those (a <Badge>) follows as written.
 */
export const Tile: React.FC<{ at?: number; children: ReactNode }> = ({ at = 0, children }) => {
  const t = useT();
  const [img, venue, paper, ...rest] = els(children);
  const a = pt(t, at, 0.5, E.out);
  return (
    <div style={{ opacity: a > 0 ? 1 : 0 }}>
      <div style={{ height: 282, background: "#ffffff", border: `1px solid ${C.rule}`, overflow: "hidden", clipPath: a < 1 ? `inset(${(1 - a) * 100}% 0 0 0)` : undefined }}>
        {img && withStyle(img, { display: "block", width: "100%", height: "100%", maxWidth: "none", objectFit: "contain", padding: 10 })}
      </div>
      <div style={{ overflow: a < 1 ? "hidden" : undefined, marginTop: 12 }}>
        <div style={{ transform: a < 1 ? `translateY(${(1 - a) * 100}%)` : undefined }}>{venue}</div>
      </div>
      <div style={{ marginTop: 8, opacity: pt(t, at + 0.2, 0.4) }}>{paper}</div>
      {rest}
    </div>
  );
};

/** An award on a venue's tile, popping in at `at` (seconds from the start of the slide). */
export const Badge: React.FC<{ at?: number; children: ReactNode }> = ({ at = 0, children }) => {
  const t = useT();
  const el = els(children)[0];
  const s = pt(t, at, 0.4, E.out);
  return el ? withStyle(el, { transform: s < 1 ? `scale(${s})` : undefined, transformOrigin: "left center" }) : null;
};

// ---------------------------------------------------------------------------------------------------------------
// Life in the lab

/**
 * A lab photo (an <img>), full frame, pushing in slowly as in the film: from 1.06× to 1.14× over `hold` seconds,
 * drifting left (`drift` -1) or right (1), under a dark fade at the foot for the caption.
 */
export const Photo: React.FC<{ drift?: number; hold?: number; children: ReactNode }> = ({ drift = -1, hold = 4, children }) => {
  const t = useT();
  const img = els(children)[0];
  const z = 1.06 + 0.08 * Math.min(1, Math.max(0, t / hold));
  return (
    <>
      {img &&
        withStyle(img, {
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          maxWidth: "none",
          objectFit: "cover",
          transform: `scale(${z}) translateX(${drift * (z - 1) * 120}px)`,
        })}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 420, background: "linear-gradient(transparent, rgba(16,18,17,.9))" }} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Where our alumni are now

const MAP = equalEarth(1510, 0, 1000, 566, 15);
const proj = (lon: number, lat: number): [number, number] => (MAP([lon, lat]) as [number, number] | null) ?? [0, 0];

/** The places alumni went to (film.yml → alumni.places), nearest first: the order the arcs fly in. */
const PLACES = F.alumni.places.map((p) => ({ lon: p.lon, lat: p.lat, d: geoDistance(GN, [p.lon, p.lat]) })).sort((a, b) => a.d - b.d);
/** When the k-th arc leaves Gandhinagar. It lands a second later. */
const flight = (k: number) => 0.9 + k * 0.17;

/** A flight-path arc in screen space, drawn up to fraction a. */
const arc = (g: [number, number], e: [number, number], a: number) => {
  const cx = (g[0] + e[0]) / 2;
  const cy = (g[1] + e[1]) / 2 - Math.max(30, Math.hypot(e[0] - g[0], e[1] - g[1]) * 0.32);
  const n = 48;
  const m = Math.max(1, Math.ceil(a * n));
  let d = "";
  let tip: [number, number] = g;
  for (let i = 0; i <= m; i++) {
    const u = Math.min(a, i / n);
    const x = (1 - u) * (1 - u) * g[0] + 2 * (1 - u) * u * cx + u * u * e[0];
    const y = (1 - u) * (1 - u) * g[1] + 2 * (1 - u) * u * cy + u * u * e[1];
    d += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    tip = [x, y];
  }
  return { d, tip };
};

/** The world in dots, and an arc from Gandhinagar to each place alumni went to, nearest first, as the film draws it. */
export const AlumniMap: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT() - at;
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const g = ref.current?.getContext("2d");
    if (!g) return;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.clearRect(0, 0, W, H);
    g.fillStyle = "#59615a";
    for (const [lat, lon] of world) {
      const p = MAP([lon, lat]);
      if (!p) continue;
      g.beginPath();
      g.arc(p[0], p[1], 2.1, 0, Math.PI * 2);
      g.fill();
    }
  }, []);
  const [gx, gy] = proj(GN[0], GN[1]);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: pt(t, 0, 0.8), pointerEvents: "none" }}>
      <canvas ref={ref} width={W * DPR} height={H * DPR} style={{ position: "absolute", inset: 0, width: W, height: H }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {PLACES.map((p, k) => {
          const a = pt(t, flight(k), 1.1, E.inOut);
          if (a <= 0) return null;
          const [ex, ey] = proj(p.lon, p.lat);
          const { d, tip } = arc([gx, gy], [ex, ey], a);
          const land = pt(t, flight(k) + 1.0, 0.5);
          return (
            <g key={k}>
              <path d={d} fill="none" stroke={C.signal} strokeWidth={2.2} opacity={0.9} />
              {a < 1 && <circle cx={tip[0]} cy={tip[1]} r={4} fill={C.nightInk} />}
              <circle cx={ex} cy={ey} r={5 * land} fill={C.nightInk} />
              {land > 0 && land < 1 && <circle cx={ex} cy={ey} r={6 + 22 * land} fill="none" stroke={C.nightInk} strokeWidth={1.5} opacity={1 - land} />}
            </g>
          );
        })}
        <circle cx={gx} cy={gy} r={9} fill={C.signal} />
      </svg>
    </div>
  );
};

/** From the top of a label's first line to its baseline: the film sets its map labels as SVG text, on the baseline. */
const BASELINE = 25.5;

/**
 * A label on the alumni map: its lines (<p>, one per place) sit beside the place at (lon, lat), offset by (dx, dy) to
 * the first line's baseline, with a leader line, and appear as that place's arc lands. `end`: the label ends there.
 */
export const AlumniPlace: React.FC<{ lon: number; lat: number; dx: number; dy: number; end?: boolean; at?: number; children: ReactNode }> = ({
  lon,
  lat,
  dx,
  dy,
  end,
  at = 0,
  children,
}) => {
  const t = useT() - at;
  const [x, y] = proj(lon, lat);
  const d = geoDistance(GN, [lon, lat]);
  const k = PLACES.filter((p) => p.d < d - 1e-9).length;
  const o = pt(t, flight(k) + 1.2, 0.5);
  const side: CSSProperties = end ? { right: W - (x + dx), textAlign: "right" } : { left: x + dx };
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
        <line x1={x} y1={y} x2={x + dx * 0.8} y2={y + dy - 6} stroke={C.nightMuted} strokeWidth={1.2} />
      </svg>
      <div style={{ position: "absolute", top: y + dy - BASELINE, ...side, opacity: o }}>{children}</div>
    </>
  );
};

/** A PhD graduate, fading up as in the film: the portrait (<img>), then the name, position and note beside it. */
export const Person: React.FC<{ at?: number; children: ReactNode }> = ({ at = 0, children }) => {
  const t = useT();
  const [img, ...lines] = els(children);
  const a = pt(t, at, 0.7);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: a, transform: a < 1 ? `translateY(${(1 - a) * 20}px)` : undefined }}>
      {img &&
        withStyle(img, {
          display: "block",
          flex: "none",
          width: 92,
          height: 92,
          maxWidth: "none",
          objectFit: "cover",
          borderRadius: "50%",
          border: "3px solid var(--red)",
        })}
      <div style={{ width: 520 }}>{lines}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Join us

/** The funders' logos (<img>s) spread across the page, each fading in a moment after the one before. */
export const Logos: React.FC<{ at?: number; step?: number; children: ReactNode }> = ({ at = 0, step = 0.07, children }) => {
  const t = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
      {els(children).map((img, i) => withStyle(img, { display: "block", height: 68, width: "auto", maxWidth: 134, objectFit: "contain", opacity: pt(t, at + i * step, 0.4) }))}
    </div>
  );
};

// the closing lockup, as in Join.tsx's EndCard: the mark at 3.4× its size in the lab's logo
const S = 3.4;
const CX = (W - 1080) / 2 + 30 * S;
const CY = 470;
const ux = (u: number) => CX + (u - 120) * S;
const uy = (u: number) => CY + (u - 60) * S;

/**
 * The film's closing card: paper fades up over the slide, then the lab's mark draws (two axes, the red sigmoid).
 * Write the wordmark beside it in the slide: SUSTAINABILITY at (675, 383.6), the lab's home at (675, 650).
 */
export const EndCard: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT() - at;
  const pts = useMemo(() => sigmoidPts(CX, CY, S, 200), []);
  const axis = pt(t, 0.2, 0.8, E.inOut);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "var(--bg)", opacity: pt(t, 0, 0.7, E.inOut) }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <line x1={ux(110)} y1={uy(85)} x2={ux(110)} y2={lerp(uy(85), uy(35), axis)} stroke="#444444" strokeWidth={2 * S} strokeLinecap="round" />
        <line x1={ux(110)} y1={uy(85)} x2={lerp(ux(110), ux(150), axis)} y2={uy(85)} stroke="#444444" strokeWidth={2 * S} strokeLinecap="round" />
        <SignalPath pts={pts} draw={pt(t, 0.35, 1.1, E.inOut)} color={C.red} width={3.5 * S} tip={false} />
      </svg>
    </>
  );
};
