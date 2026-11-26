import React, { Children, cloneElement, type CSSProperties, isValidElement, type ReactElement, type ReactNode, useLayoutEffect, useRef } from "react";
import kilns from "../../../data/kilns.json";
import { flat } from "../../lib/geo";
import { IndiaMap } from "../../lib/IndiaMap";
import { E, lerp, pt, useT } from "../../lib/motion";
import { C, DPR, H, W } from "../../theme";

// Drawings for the Earth-observation slides, made from the film's data and moving as the film's do
// (src/scenes/Earth.tsx). They hold no words: every label is written in the slide file, and the pictures are the
// slide file's <img> elements, which these components only place and move. Times are seconds from the start of
// the slide, or of the build (<Step>) the component is in.

type El = ReactElement<{ children?: ReactNode; style?: CSSProperties }>;
const elements = (children: ReactNode) => Children.toArray(children).filter(isValidElement) as El[];
const withStyle = (el: El, style: CSSProperties) => cloneElement(el, { style: { ...style, ...el.props.style } });

// ---------------------------------------------------------------------------------------------------------------
// Numbers that move: the number written in the slide file is the one shown at rest; while it moves, the first
// number in the element's text is swapped for the moving value, in the same format (decimals, thousands commas).

const NUM = /\d[\d,]*(\.\d+)?/;
const valueOf = (written: string) => Number(written.replace(/,/g, ""));
const formatLike = (v: number, written: string) => {
  const decimals = written.includes(".") ? written.split(".")[1].length : 0;
  return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: written.includes(",") });
};
const swapNumber = (node: ReactNode, shown: (written: string) => string): ReactNode => {
  let done = false;
  const walk = (n: ReactNode): ReactNode => {
    if (done) return n;
    if (typeof n === "string") {
      const m = n.match(NUM);
      if (!m) return n;
      done = true;
      return n.replace(m[0], shown(m[0]));
    }
    if (Array.isArray(n)) return n.map(walk);
    if (isValidElement<{ children?: ReactNode }>(n) && n.props.children !== undefined) {
      const kids = walk(n.props.children);
      return done ? cloneElement(n, undefined, ...(Array.isArray(kids) ? kids : [kids])) : n;
    }
    return n;
  };
  return walk(node);
};

/** What is inside appears whole at `at`, and is not there before: words that join a line later. */
export const Later: React.FC<{ at: number; children: ReactNode }> = ({ at, children }) => <>{useT() >= at ? children : null}</>;

/** The slide's own background laid over a region, fading in: it clears that part of the stage for a build. */
export const Veil: React.FC<{ at?: number; dur?: number; x: number; y: number; w: number; h: number }> = ({ at = 0, dur = 0.5, x, y, w, h }) => {
  const t = useT();
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "var(--bg)", opacity: pt(t, at, dur, E.inOut) }} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Kilns

const VIEW = { lon0: 82.2, lat0: 26.6, k: 60, cx: 1330, cy: 560 };
const K = kilns as unknown as { n: number; pts: [number, number, number][] };
const LAG = 0.6; // the kilns start this long after the map
const SWEEP = 3.6; // seconds for all of them to appear

/** The kilns, in the dataset's order, each flaring as it lands (drawn on a canvas, as in the film). */
const KilnDots: React.FC<{ t: number; k: number; start: number }> = ({ t, k, start }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const g = ref.current?.getContext("2d");
    if (!g) return;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";
    const proj = flat({ ...VIEW, k });
    const shown = Math.floor(K.n * pt(t, start, SWEEP, E.linear));
    const per = SWEEP / K.n;
    for (let i = 0; i < shown; i++) {
      const [lat, lon] = K.pts[i];
      const [x, y] = proj(lon, lat);
      const fresh = Math.max(0, 1 - (t - (start + i * per)) / 0.5);
      g.fillStyle = fresh > 0 ? `rgba(255, ${Math.round(120 + 110 * fresh)}, ${Math.round(100 + 120 * fresh)}, ${0.55 + 0.45 * fresh})` : "rgba(230, 72, 60, 0.55)";
      const r = 1.5 + 2.2 * fresh;
      g.fillRect(x - r / 2, y - r / 2, r, r);
    }
  }, [t, k, start]);
  return <canvas ref={ref} width={W * DPR} height={H * DPR} style={{ position: "absolute", inset: 0, width: W, height: H }} />;
};

/**
 * India with SentinelKilnDB's 30,638 kilns in five states (data/kilns.json): the map fades in at `at`, the kilns
 * sweep in over 3.6 s from `at` + 0.6, and the map drifts in a little meanwhile. Put it before the slide's words.
 */
export const KilnMap: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT();
  const k = VIEW.k * (1 + 0.04 * pt(t, at - 0.1, 6, E.linear));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: pt(t, at, 1.1, E.inOut), pointerEvents: "none" }}>
      <IndiaMap view={{ ...VIEW, k }} stroke={C.nightRule} fill={C.nightSoft} />
      <KilnDots t={t} k={k} start={at + LAG} />
    </div>
  );
};

/** The number written in the element (the kilns found), counted up with the dots of the <KilnMap> with the same `at`. */
export const KilnCount: React.FC<{ at?: number; children: ReactNode }> = ({ at = 0, children }) => {
  const t = useT();
  const p = pt(t, at + LAG, SWEEP, E.linear);
  if (p >= 1) return <>{children}</>;
  return <>{swapNumber(children, (n) => formatLike(Math.round(valueOf(n) * p), n))}</>;
};

// ---------------------------------------------------------------------------------------------------------------
// FlowSat's dial

const turn = (t: number, at: number) => pt(t, at + 0.6, 3.0, E.inOut);

/**
 * FlowSat's ground-resolution dial: its <img> children are frames generated from the same description and noise
 * at rising ground resolution. They fade in at `at`, then turn from the first frame to the last over 3 s.
 */
export const Dial: React.FC<{ at?: number; x: number; y: number; size: number; children: ReactNode }> = ({ at = 0, x, y, size, children }) => {
  const t = useT();
  const frames = elements(children);
  const k = Math.round(turn(t, at) * (frames.length - 1));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size, opacity: pt(t, at - 0.2, 0.5, E.inOut) }}>
      {frames.map((f, i) =>
        withStyle(f, { position: "absolute", left: 0, top: 0, width: size, height: size, maxWidth: "none", display: "block", visibility: i === k ? "visible" : "hidden" }),
      )}
    </div>
  );
};

/** The number written in the element, turned up from `from` in steps of `by` with the frames of the <Dial> with the same `at`. */
export const Turn: React.FC<{ at?: number; from: number; by: number; children: ReactNode }> = ({ at = 0, from, by, children }) => {
  const t = useT();
  const p = turn(t, at);
  if (p >= 1) return <>{children}</>;
  return (
    <>
      {swapNumber(children, (n) => {
        const steps = Math.round((valueOf(n) - from) / by);
        return formatLike(from + Math.round(p * steps) * by, n);
      })}
    </>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Aperture's zoom

// The paper's zoom path (Fig. 3), in pixels of the 4096 px tile: the whole tile, its top-left quadrant, then that
// quadrant's bottom-right quadrant twice, down to the chimney.
const ZOOM: [number, number, number][] = [
  [0, 0, 4096],
  [0, 0, 2048],
  [1024, 1024, 1024],
  [1536, 1536, 512],
];
const SIDE = 760;
const PUSH = 0.35; // in a build, the grid fades out first, then the view pushes in for 0.95 s

/** The quadrant grid over step `k` of the zoom: a cross, and the next quadrant in red. */
const Grid: React.FC<{ k: number; opacity: number }> = ({ k, opacity }) => {
  if (opacity <= 0 || k < 0 || k >= ZOOM.length - 1) return null;
  const [x0, y0, size] = ZOOM[k];
  const [x1, y1, next] = ZOOM[k + 1];
  const s = SIDE / size;
  return (
    <svg width={SIDE} height={SIDE} style={{ position: "absolute", inset: 0, opacity }}>
      <line x1={SIDE / 2} x2={SIDE / 2} y1={0} y2={SIDE} stroke="#ffffff" strokeWidth={1.5} opacity={0.7} />
      <line x1={0} x2={SIDE} y1={SIDE / 2} y2={SIDE / 2} stroke="#ffffff" strokeWidth={1.5} opacity={0.7} />
      <rect x={(x1 - x0) * s + 3} y={(y1 - y0) * s + 3} width={next * s - 6} height={next * s - 6} fill="none" stroke={C.signal} strokeWidth={4} />
    </svg>
  );
};

/**
 * Aperture's look at one coal-plant tile, at step `k` (0–3) of the paper's zoom path, as a 760 px square where the
 * film has it. Children: the tile as an <img>, then the view's label (a <p>), written in the slide file.
 * Step 0 fades in at `at` and marks the first quadrant. Each later step goes in its own build, over the one before:
 * the grid fades, the view pushes into the marked quadrant while the label's number counts down to the one
 * written, and the next quadrant is marked.
 */
export const ZoomView: React.FC<{ k: number; at?: number; children: ReactNode }> = ({ k, at = 0, children }) => {
  const t = useT();
  const [tile, ...label] = elements(children);
  const from = ZOOM[Math.max(0, k - 1)];
  const to = ZOOM[k];
  const m = k === 0 ? 1 : pt(t, PUSH, 0.95, E.inOut);
  const size = Math.exp(lerp(Math.log(from[2]), Math.log(to[2]), m));
  const sc = SIDE / size;
  const [ox, oy] = [lerp(from[0], to[0], m), lerp(from[1], to[1], m)];
  return (
    <div style={{ position: "absolute", left: 1040, top: 190, width: SIDE, height: SIDE, overflow: "hidden", background: C.night, opacity: k === 0 ? pt(t, at - 0.2, 0.7, E.inOut) : 1 }}>
      {tile &&
        withStyle(tile, {
          position: "absolute",
          left: 0,
          top: 0,
          width: 4096,
          height: 4096,
          maxWidth: "none",
          transformOrigin: "0 0",
          transform: `translate(${-ox * sc}px, ${-oy * sc}px) scale(${sc})`,
        })}
      <Grid k={k - 1} opacity={k === 0 ? 0 : 1 - pt(t, 0, 0.3)} />
      <Grid k={k} opacity={pt(t, (k === 0 ? at : PUSH) + 0.5, 0.3)} />
      {m < 1 ? swapNumber(label, (n) => formatLike(Math.round(size), n)) : label}
    </div>
  );
};
