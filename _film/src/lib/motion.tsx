import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../theme";

export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.6, 0, 0.9, 0.4),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
  linear: (x: number) => x,
};

/** Seconds since the start of the enclosing <Sequence>. */
export const useT = () => useCurrentFrame() / FPS;

/** 0→1 progress of a transition that starts at `at` and lasts `dur` seconds. */
export const pt = (t: number, at: number, dur: number, ease = E.out) =>
  interpolate(t, [at, at + Math.max(dur, 1e-3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** In at `at`, out at `out` (if given): a 0→1→0 envelope. */
export const inOut = (t: number, at: number, out?: number, din = 0.6, dout = 0.45) =>
  pt(t, at, din) * (out === undefined ? 1 : 1 - pt(t, out, dout, E.in));

type RiseProps = {
  at: number;
  out?: number;
  dur?: number;
  outDur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  inner?: React.CSSProperties;
};

/** A line of text that slides up from behind a mask, and away again. */
export const Rise: React.FC<RiseProps> = ({ at, out, dur = 0.75, outDur = 0.35, children, style, inner }) => {
  const t = useT();
  const a = pt(t, at, dur);
  const b = out === undefined ? 0 : pt(t, out, outDur, E.in);
  const y = (1 - a) * 110 - b * 110;
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.14em", marginBottom: "-0.14em", ...style }}>
      <div style={{ transform: `translateY(${y}%)`, ...inner }}>{children}</div>
    </div>
  );
};

/** Words that rise one after another; wraps naturally inside its container. */
export const Words: React.FC<{
  text: string;
  at: number;
  out?: number;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  color?: (i: number, word: string) => string | undefined;
}> = ({ text, at, out, stagger = 0.045, dur = 0.7, style, color }) => {
  const t = useT();
  const words = text.split(" ");
  return (
    <div style={style}>
      {words.map((w, i) => {
        const a = pt(t, at + i * stagger, dur);
        const b = out === undefined ? 0 : pt(t, out + i * stagger * 0.2, 0.3, E.in);
        return (
          <span
            key={i}
            style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.14em", marginBottom: "-0.14em" }}
          >
            <span style={{ display: "inline-block", transform: `translateY(${(1 - a) * 110 - b * 110}%)`, color: color?.(i, w) }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Characters typed one by one, with a block cursor while typing. */
export const Typed: React.FC<{ text: string; at: number; cps?: number; style?: React.CSSProperties; cursor?: string; hideCursorAfter?: number }> = ({
  text,
  at,
  cps = 38,
  style,
  cursor = C.red,
  hideCursorAfter = 0.8,
}) => {
  const t = useT();
  const n = Math.max(0, Math.min(text.length, Math.floor((t - at) * cps)));
  const done = t - at > text.length / cps + hideCursorAfter;
  const blink = Math.floor(t * 2.4) % 2 === 0;
  if (t < at) return <div style={style}>&nbsp;</div>;
  return (
    <div style={style}>
      {text.slice(0, n)}
      {!done && (
        <span style={{ display: "inline-block", width: "0.55em", height: "1em", background: cursor, opacity: blink || n < text.length ? 1 : 0, verticalAlign: "-0.12em", marginLeft: 2 }} />
      )}
    </div>
  );
};

/** A rule that draws from left to right. */
export const Rule: React.FC<{ at: number; dur?: number; out?: number; color?: string; height?: number; style?: React.CSSProperties; origin?: "left" | "right" }> = ({
  at,
  dur = 0.9,
  out,
  color = C.ink,
  height = 2,
  style,
  origin = "left",
}) => {
  const t = useT();
  const a = pt(t, at, dur, E.inOut);
  const b = out === undefined ? 0 : pt(t, out, 0.5, E.in);
  return (
    <div
      style={{
        height,
        background: color,
        transform: `scaleX(${a * (1 - b)})`,
        transformOrigin: b > 0 ? (origin === "left" ? "right" : "left") : origin,
        ...style,
      }}
    />
  );
};

/** A counting number with thousands separators. */
export const Count: React.FC<{ to: number; at: number; dur?: number; decimals?: number; style?: React.CSSProperties; suffix?: string }> = ({
  to,
  at,
  dur = 1.6,
  decimals = 0,
  style,
  suffix = "",
}) => {
  const t = useT();
  const v = to * pt(t, at, dur, E.soft);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
};

/** Small uppercase label with the site's red square bullet. */
export const Kicker: React.FC<{ children: React.ReactNode; color?: string; square?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.muted,
  square = C.red,
  size = 22,
  style,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: size * 0.6,
      fontFamily: FONT.body,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    <span style={{ width: size * 0.42, height: size * 0.42, background: square, flex: "none" }} />
    {children}
  </div>
);

/** Fade + slight lift, for blocks that should not slide from a mask. */
export const Appear: React.FC<{ at: number; out?: number; dur?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  out,
  dur = 0.7,
  dy = 24,
  children,
  style,
}) => {
  const t = useT();
  const a = pt(t, at, dur);
  const b = out === undefined ? 0 : pt(t, out, 0.4, E.in);
  return <div style={{ opacity: a * (1 - b), transform: `translateY(${(1 - a) * dy - b * dy * 0.5}px)`, ...style }}>{children}</div>;
};
