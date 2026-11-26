import React, { Children, cloneElement, type CSSProperties, isValidElement, type ReactElement, type ReactNode, useMemo } from "react";
import ppg from "../../../data/ppg-window.json";
import { E, pt, useT } from "../../lib/motion";
import { breath, SignalPath, toPts } from "../../lib/signal";
import { C, FONT } from "../../theme";

// Drawings and blocks for the health slides, made as the film makes them (src/scenes/Health.tsx). They hold no
// words: every label, number and source is written in the slide file and only placed and animated here.
// Positions are the film's, on its 1920 × 1080 frame.

type El = ReactElement<{ children?: ReactNode; style?: CSSProperties }>;

const withStyle = (el: El, style: CSSProperties) => cloneElement(el, { style: { ...style, ...el.props.style } });
const textOf = (node: ReactNode): string =>
  typeof node === "string" || typeof node === "number"
    ? String(node)
    : Array.isArray(node)
      ? node.map(textOf).join("")
      : isValidElement<{ children?: ReactNode }>(node)
        ? textOf(node.props.children)
        : "";
const parts = (children: ReactNode) => Children.toArray(children).filter(isValidElement) as El[];
const valueOf = (el?: El) => Number(textOf(el).replace(/[^\d.]/g, "")) || 0;

/** The number written in `el`, counted up to `a` (0–1) of its value; the element as written once a = 1. */
const counted = (el: El, a: number) => {
  const text = textOf(el);
  const m = text.match(/[\d,]+(\.\d+)?/);
  if (!m || a >= 1) return el;
  const decimals = m[1] ? m[1].length - 1 : 0;
  return cloneElement(el, undefined, text.replace(m[0], (Number(m[0].replace(/,/g, "")) * a).toFixed(decimals)));
};

/** A full-frame drawing layer; it lets clicks through to the words underneath. */
const Layer: React.FC<{ opacity?: number; children: ReactNode }> = ({ opacity = 1, children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
    {children}
  </svg>
);

// ---------------------------------------------------------------------------------------------------------------
// JoulesEye

/**
 * The dark monitor beside the thermal view: an illustrative breathing trace (src/lib/signal.tsx, not a
 * recording) that scrolls in like a live monitor. Its label is the child, set in the top-left corner.
 */
export const BreathPanel: React.FC<{ at?: number; children?: ReactNode }> = ({ at = 0, children }) => {
  const t = useT();
  const pts = useMemo(() => toPts(breath(240), { x0: 20, x1: 330, top: 46, base: 154 }), []);
  const draw = pt(t, at + 0.2, 2.6, E.linear);
  return (
    <div style={{ position: "absolute", left: 1450, top: 446, width: 350, height: 190, background: C.ink, opacity: pt(t, at, 0.4) }}>
      <div style={{ position: "absolute", left: 20, top: 14 }}>{children}</div>
      <svg width={350} height={190} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
        <SignalPath pts={pts} draw={draw} color={C.signal} width={3} glow={0.6} />
      </svg>
    </div>
  );
};

/**
 * One error bar, as the JoulesEye panel draws it: the label (<span>) and the value (<b>) on a line, a thin bar
 * under them. The bar grows to value / max and the number counts up with it.
 */
export const Gauge: React.FC<{ at?: number; max: number; hi?: boolean; children: ReactNode }> = ({ at = 0, max, hi, children }) => {
  const t = useT();
  const [label, num] = parts(children);
  const a = pt(t, at, 1.1, E.out);
  const col = hi ? "var(--red)" : "var(--muted)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 6, marginBottom: 16 }}>
      {label && withStyle(label, { fontFamily: FONT.body, fontSize: 22, lineHeight: "normal", color: "var(--ink)" })}
      {num && withStyle(counted(num, a), { fontFamily: FONT.head, fontWeight: 700, fontSize: 30, lineHeight: "normal", color: col, fontVariantNumeric: "tabular-nums" })}
      <div style={{ gridColumn: "1 / 3", height: 14, background: "var(--soft)" }}>
        <div style={{ height: "100%", width: `${(valueOf(num) / max) * 100 * a}%`, background: col }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Signal Descriptors: 8 s of wrist PPG while sitting (PPG-DaLiA, subject S5, CC BY 4.0), with its own descriptors

const P = ppg as unknown as { x: number[]; mean: number; sd: number; crossings: number[]; dominant_hz: number; spec_f: number[]; spec: number[] };
const BOX = { x0: 930, x1: 1790, top: 276, base: 540 };
const LO = Math.min(...P.x) - 5;
const HI = Math.max(...P.x) + 16;
const vy = (v: number) => BOX.base - ((v - LO) / (HI - LO)) * (BOX.base - BOX.top);
const xs = (i: number) => BOX.x0 + ((BOX.x1 - BOX.x0) * i) / (P.x.length - 1);
const PULSE = toPts(P.x, BOX, LO, HI);

/** The pulse, drawn from left to right. `at`: when it fades in; it draws from at + 0.45. */
export const PpgTrace: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT();
  return (
    <Layer opacity={pt(t, at, 0.5)}>
      <SignalPath pts={PULSE} draw={pt(t, at + 0.45, 1.6, E.inOut)} color={C.red} width={3.4} />
    </Layer>
  );
};

/** Statistical: the pulse's mean (dashed) and a band of ±1 SD, under the pulse (drawn again on top, whole). */
export const PpgSpread: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT();
  const a = pt(t, at, 0.5);
  return (
    <Layer>
      <rect x={BOX.x0} y={vy(P.mean + P.sd)} width={BOX.x1 - BOX.x0} height={vy(P.mean - P.sd) - vy(P.mean + P.sd)} fill={C.soft} opacity={a} />
      <line x1={BOX.x0} x2={BOX.x1} y1={vy(P.mean)} y2={vy(P.mean)} stroke={C.ink} strokeWidth={2} strokeDasharray="7 6" opacity={a} />
      <SignalPath pts={PULSE} color={C.red} width={3.4} />
    </Layer>
  );
};

/** Temporal: a dot wherever the pulse crosses its mean, its rhythm. */
export const PpgCrossings: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT();
  const r = 6 * pt(t, at, 0.5);
  return (
    <Layer>
      {P.crossings.map((i) => (
        <circle key={i} cx={xs(i)} cy={vy(P.mean)} r={r} fill={C.ink} />
      ))}
    </Layer>
  );
};

/** Spectral: the pulse's spectrum, 0–5 Hz, with a red line at its strongest rhythm. */
export const PpgSpectrum: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT();
  const max = Math.max(...P.spec);
  const fx = (f: number) => 930 + (f / 5) * 860;
  const sy = (v: number) => 860 - (v / max) * 170;
  const d = P.spec_f.map((f, i) => `${i ? "L" : "M"}${fx(f).toFixed(1)},${sy(P.spec[i]).toFixed(1)}`).join("");
  return (
    <Layer opacity={pt(t, at, 0.6)}>
      <line x1={930} x2={1790} y1={860} y2={860} stroke={C.rule} strokeWidth={2} />
      <path d={d} fill="none" stroke={C.ink} strokeWidth={2.4} />
      <line x1={fx(P.dominant_hz)} x2={fx(P.dominant_hz)} y1={680} y2={860} stroke={C.red} strokeWidth={2.5} />
    </Layer>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Interpretable sleep staging

/**
 * Boxed words in a grid, appearing one after another (the ten concepts). Each child is one box; give a box
 * style={{ borderColor: 'var(--red)' }} to outline it in red.
 */
export const Tiles: React.FC<{ at?: number; stagger?: number; cols?: number; children: ReactNode }> = ({ at = 0, stagger = 0.12, cols = 5, children }) => {
  const t = useT();
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
      {parts(children).map((c, i) => {
        const a = pt(t, at + i * stagger, 0.4, E.out);
        return (
          <div key={i} style={{ display: "grid", opacity: a, transform: a < 1 ? `translateY(${(1 - a) * 14}px)` : undefined }}>
            {withStyle(c, {
              margin: 0,
              padding: "12px 10px",
              border: "2px solid var(--ink)",
              fontFamily: FONT.body,
              fontSize: 21,
              lineHeight: "normal",
              color: "var(--ink)",
              textAlign: "center",
            })}
          </div>
        );
      })}
    </div>
  );
};

/** One score bar, as the sleep slide draws it: the label (<span>), a bar to value / max, the value (<b>). */
export const Meter: React.FC<{ at?: number; max?: number; hi?: boolean; children: ReactNode }> = ({ at = 0, max = 1, hi, children }) => {
  const t = useT();
  const [label, num] = parts(children);
  const a = pt(t, at, 0.9, E.out);
  const col = hi ? "var(--red)" : "var(--muted)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 80px", alignItems: "center", gap: 14, marginBottom: 12, opacity: a > 0 ? 1 : 0 }}>
      {label && withStyle(label, { fontFamily: FONT.body, fontSize: 24, lineHeight: "normal", color: "var(--ink)" })}
      <div style={{ height: 22, background: "var(--soft)" }}>
        <div style={{ height: "100%", width: `${(valueOf(num) / max) * 100 * a}%`, background: col }} />
      </div>
      {num &&
        withStyle(num, {
          fontFamily: FONT.head,
          fontWeight: 700,
          fontSize: 30,
          lineHeight: "normal",
          color: col,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
          opacity: pt(t, at, 0.3),
        })}
    </div>
  );
};
