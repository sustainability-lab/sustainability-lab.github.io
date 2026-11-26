import React, { Children, type CSSProperties, type ReactNode } from "react";
import { DotGlobe } from "../../lib/DotGlobe";
import { GN, ortho } from "../../lib/geo";
import { E, lerp, pt, useT } from "../../lib/motion";
import { breath, delhi, iawe, kilnProfile, morph, N, type Pt, resample, resampleMax, sigmoidPts, SignalPath, smooth, toPts } from "../../lib/signal";
import { END } from "../../lib/time";
import { C, FONT, H, M, W } from "../../theme";
import { Rise } from "../kit";

// Drawings and layout for the talk's opening slides (cover, hook, title, place, agenda), made from the film's data
// (data/signals.json, data/globe-dots.json) exactly as the film draws them (src/scenes/Hook.tsx, Place.tsx). They
// hold no words, except the tick labels under the signals: every other word is written in the slide file.

const LAYER: CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" };

/** Text styles of the opening, from the film's scenes. Use as style={{ ...O.word }} so the editor can add to them. */
export const O = {
  // the four words and their captions (Hook.tsx)
  word: { fontFamily: FONT.head, fontWeight: 700, fontSize: 132, lineHeight: 1, letterSpacing: "-0.045em", color: "var(--ink)", margin: 0, whiteSpace: "nowrap" },
  caption: { fontFamily: FONT.mono, fontWeight: 400, fontSize: 28, lineHeight: "normal", letterSpacing: "0.01em", color: "var(--muted)", margin: 0, whiteSpace: "nowrap" },
  // the lab's title card (Hook.tsx; the wordmark as in images/brand/logo-light.svg)
  wordmark: { fontFamily: FONT.logo, fontWeight: 400, fontSize: 121.6, lineHeight: 1.05, letterSpacing: 1.9, color: "var(--ink)", margin: 0, whiteSpace: "nowrap" },
  wordmarkLab: { fontFamily: FONT.logo, fontWeight: 300, fontSize: 68.4, lineHeight: 1.05, letterSpacing: 11.4, color: "var(--muted)", margin: "2px 0 0" },
  tagline: { fontFamily: FONT.body, fontWeight: 500, fontSize: 46, lineHeight: "normal", letterSpacing: "-0.01em", color: "var(--ink)", margin: 0, whiteSpace: "nowrap" },
  campus: { fontFamily: FONT.mono, fontWeight: 400, fontSize: 27, lineHeight: "normal", letterSpacing: "0.06em", color: "var(--muted)", margin: "16px 0 0" },
  // the place (Place.tsx)
  kicker: { display: "flex", alignItems: "center", gap: 14.4, fontFamily: FONT.body, fontWeight: 600, fontSize: 24, lineHeight: "normal", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", margin: 0 },
  coords: { fontFamily: FONT.mono, fontWeight: 400, fontSize: 26, lineHeight: "normal", letterSpacing: "0.04em", color: "var(--muted)", margin: 0 },
  statement: { fontFamily: FONT.body, fontWeight: 500, fontSize: 54, lineHeight: 1.18, letterSpacing: "-0.015em", color: "var(--ink)", margin: 0 },
  coda: { fontFamily: FONT.body, fontWeight: 500, fontSize: 54, lineHeight: 1.18, color: "var(--red)", margin: 0 },
  pin: { fontFamily: FONT.mono, fontWeight: 400, fontSize: 24, lineHeight: "normal", letterSpacing: "0.06em", color: "var(--ink)", margin: 0, whiteSpace: "nowrap" },
  // the agenda (the film's chapter header; the four parts)
  label: { fontFamily: FONT.body, fontWeight: 600, fontSize: 22, lineHeight: "normal", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink)" },
  labName: { fontFamily: FONT.logo, fontWeight: 400, fontSize: 20, lineHeight: "normal", letterSpacing: "0.14em", color: "var(--muted)" },
  num: { fontFamily: FONT.head, fontWeight: 700, fontSize: 72, lineHeight: 1, letterSpacing: "-0.05em", color: "var(--red)", margin: 0 },
  part: { fontFamily: FONT.head, fontWeight: 700, fontSize: 46, lineHeight: 1.05, letterSpacing: "-0.035em", color: "var(--ink)", margin: 0 },
  headline: { fontFamily: FONT.body, fontWeight: 400, fontSize: 30, lineHeight: 1.3, color: "var(--muted)", margin: "8px 0 0" },
} satisfies Record<string, CSSProperties>;

// ---------------------------------------------------------------------------------------------------------------
// The four signals (Hook.tsx): Air, Land, Breath and Power, drawn by one red line

/** Where the signals are drawn: the film's margins, from y = 470 to the baseline at 880. */
const BOX = { x0: M, x1: W - M, top: 470, base: 880 };

/** The lab's mark at the size the hook draws it: the logo's sigmoid, 3.8 px a unit, centred at (474, 468). */
const MARK = { s: 3.8, cx: (W - 1200) / 2 + 30 * 3.8, cy: 468 };
const ux = (u: number) => MARK.cx + (u - 120) * MARK.s;
const uy = (u: number) => MARK.cy + (u - 60) * MARK.s;

export type SignalName = "air" | "land" | "breath" | "power";
const ORDER: SignalName[] = ["air", "land", "breath", "power"];
/** How long each line takes to become the next, as in the film. */
const MORPH: Record<SignalName, number> = { air: 0, land: 0.85, breath: 0.75, power: 0.75 };

/** Tick labels under each signal, at fractions of the width. */
const TICKS: Record<SignalName, [number, string][]> = {
  air: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((y, i) => [(i + 0.5) / 9, String(y)]),
  land: [
    [(75.6 - 73.5) / 17, "Punjab"],
    [(77.0 - 73.5) / 17, "Haryana"],
    [(80.8 - 73.5) / 17, "Uttar Pradesh"],
    [(85.4 - 73.5) / 17, "Bihar"],
    [(88.0 - 73.5) / 17, "West Bengal"],
  ],
  breath: [0, 5, 10, 15, 20, 25, 30].map((s) => [s / 30, `${s} s`]),
  power: [0, 4, 8, 12, 16, 20, 24].map((h) => [h / 24, `${String(h).padStart(2, "0")}:00`]),
};

type Lines = Record<SignalName | "powerSoft" | "logo", Pt[]>;
let lines: Lines | null = null;

/** Every line the hook draws, with the same number of points so any two can morph. Built once. */
const getLines = (): Lines => {
  if (lines) return lines;
  // Delhi: mean-pool the daily series into N bins, so nothing is invented
  const per = delhi.length / N;
  const air = Array.from({ length: N }, (_, i) => {
    const a = Math.floor(i * per);
    const b = Math.max(a + 1, Math.floor((i + 1) * per));
    let s = 0;
    for (let j = a; j < b; j++) s += delhi[j];
    return s / (b - a);
  });
  const pw = resampleMax(iawe.mains);
  lines = {
    air: toPts(air, BOX, 0),
    land: toPts(resample(kilnProfile()), BOX, 0),
    breath: toPts(breath(), { ...BOX, top: BOX.top + 70, base: BOX.base - 70 }),
    power: toPts(pw, BOX, 0),
    powerSoft: toPts(smooth(pw, 28), BOX, 0, Math.max(...pw)),
    logo: sigmoidPts(MARK.cx, MARK.cy, MARK.s),
  };
  return lines;
};

// A build makes the hook's earlier words dim and hides their captions, lines and ticks. The parts are the row's
// children: the first word's part, then open-slide's builds (<div data-osd-step>, in the video too). A part with a
// revealed build after it is stale. Plain CSS, so it follows the builds wherever they are revealed.
const HOOK_CSS = `
[data-hook-row] > :has(~ [data-osd-step="revealed"]) [data-hook-layer] { visibility: hidden !important; }
[data-hook-row] > :has(~ [data-osd-step="revealed"]) [data-hook-word] * { color: #59615a !important; }
`;

/**
 * The hook's row of words at the film's place (left margin, y = 118), 0.3 em apart. Its children: the first word's
 * <HookPart>, then <Steps> with one <Step> per further word. Signals and captions inside are placed on the page.
 */
export const HookRow: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div data-hook-row="" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-start", gap: "0.3em", padding: `118px 0 0 ${M}px`, fontSize: 132, lineHeight: 1 }}>
    <style>{HOOK_CSS}</style>
    {children}
  </div>
);

/** The first word with its caption and signal, outside the builds. */
export const HookPart: React.FC<{ children: ReactNode }> = ({ children }) => <div data-hook-part="">{children}</div>;

/** One of the four words (an <h1>), rising from behind a mask. Bright while it is the latest, dim once a later word is shown. */
export const HookWord: React.FC<{ at?: number; children: ReactNode }> = ({ at = 0, children }) => (
  <div data-hook-word="">
    <Rise at={at} dur={0.6}>
      {children}
    </Rise>
  </div>
);

/** A signal's caption (a <p>), under the words, fading in. */
export const HookCaption: React.FC<{ at?: number; children: ReactNode }> = ({ at = 0.25, children }) => {
  const t = useT();
  return (
    <div data-hook-layer="" style={{ position: "absolute", left: M + 4, top: 300, opacity: pt(t, at, 0.4) }}>
      {children}
    </div>
  );
};

/** The signals' baseline, drawn once from left to right. */
export const HookAxis: React.FC = () => {
  const t = useT();
  const y = BOX.base + 24;
  return (
    <svg width={W} height={H} style={LAYER}>
      <line x1={BOX.x0} x2={BOX.x0 + (BOX.x1 - BOX.x0) * pt(t, 0.1, 1.6, E.inOut)} y1={y} y2={y} stroke={C.nightRule} strokeWidth={2} />
    </svg>
  );
};

/**
 * One signal and its ticks. Air is drawn from left to right by a pen (from 0.3 s); each later one grows out of the
 * line before it (Land out of Air, and so on), from `at`, as the film's line does.
 */
export const Signal: React.FC<{ name: SignalName; at?: number }> = ({ name, at = 0 }) => {
  const t = useT();
  const L = getLines();
  const i = ORDER.indexOf(name);
  const pts = i === 0 ? L.air : morph(L[ORDER[i - 1]], L[name], pt(t, at, MORPH[name], E.inOut));
  const draw = i === 0 ? pt(t, at + 0.3, 3.4, E.inOut) : 1;
  const ticks = pt(t, at + (i === 0 ? 0.25 : 0.2), 0.4);
  return (
    <svg data-hook-layer="" width={W} height={H} style={LAYER}>
      <g opacity={ticks}>
        {TICKS[name].map(([u, label]) => {
          const x = BOX.x0 + u * (BOX.x1 - BOX.x0);
          return (
            <g key={label}>
              <line x1={x} x2={x} y1={BOX.base + 24} y2={BOX.base + 34} stroke={C.nightMuted} strokeWidth={2} />
              <text x={x} y={BOX.base + 70} fill={C.nightMuted} fontFamily={FONT.mono} fontSize={24} textAnchor="middle">
                {label}
              </text>
            </g>
          );
        })}
      </g>
      <SignalPath pts={pts} draw={draw} color={C.signal} width={4} glow={1} />
    </svg>
  );
};

/**
 * The lab's mark: the red sigmoid between two grey axes, where the hook leaves it (put the wordmark's words next to
 * it at x = 645, y = 371.48). With `fold`, it starts as the Power line and folds into the mark at that time, as the
 * film's line does after "Power."; without, it is finished.
 */
export const LabMark: React.FC<{ fold?: number }> = ({ fold }) => {
  const t = useT();
  const L = getLines();
  const done = fold === undefined;
  const relax = done ? 1 : pt(t, fold - 0.1, 0.45, E.inOut); // the spikes settle before the line folds into the S
  const m = done ? 1 : pt(t, fold + 0.2, 1.05, E.inOut);
  const axis = done ? 1 : pt(t, fold + 0.55, 0.8, E.inOut);
  const pts = m > 0 ? morph(L.powerSoft, L.logo, m) : morph(L.power, L.powerSoft, relax);
  const s = MARK.s;
  return (
    <svg width={W} height={H} style={LAYER}>
      {axis > 0 && (
        <>
          <line x1={ux(110)} y1={uy(85)} x2={ux(110)} y2={lerp(uy(85), uy(35), axis)} stroke={C.nightMuted} strokeWidth={2 * s} strokeLinecap="round" />
          <line x1={ux(110)} y1={uy(85)} x2={lerp(ux(110), ux(150), axis)} y2={uy(85)} stroke={C.nightMuted} strokeWidth={2 * s} strokeLinecap="round" />
        </>
      )}
      <SignalPath pts={pts} color={C.signal} width={lerp(4, 3.5 * s, m)} glow={1 - m * 0.7} tip={false} />
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// The place (Place.tsx)

/** From the top of the pin's label (a <p> in O.pin: DM Mono, 24 px, normal line height) to its baseline. */
const PIN_BASELINE = 24;

/**
 * The globe turns from the Atlantic to India and settles on Gandhinagar, with a pulsing pin. Put the pin's label
 * inside, as a <p>: it sits up and to the left of the pin, at the end of a leader line, as in the film.
 */
export const PlaceGlobe: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const t = useT();
  const spin = pt(t, 0, 3.6, E.inOut);
  // The film keeps turning, 0.6° a second. Here the turn eases to a stop at 11.6 s, before the slide's clock
  // settles (12 s), so the finished slide is the same picture.
  const u = Math.min(1, Math.max(0, (t - 3.6) / 8));
  const rotLon = lerp(-38, GN[0] - 9, spin) + 2.4 * (1 - (1 - u) ** 2);
  const rotLat = lerp(8, GN[1] - 4, spin);
  const r = lerp(330, 470, pt(t, 0, 4.2, E.inOut));
  const cx = lerp(W / 2, 1350, pt(t, 0.4, 3.2, E.inOut));
  const cy = 548;
  const p = ortho(rotLon, rotLat, r, cx, cy)(GN) ?? [cx, cy];
  const pin = pt(t, 2.6, 0.6);
  const pulse = ((t < END / 2 ? t : 12) * 0.9) % 1;
  return (
    <div style={{ ...LAYER, opacity: pt(t, 0, 0.9) }}>
      <DotGlobe rotLon={rotLon} rotLat={rotLat} r={r} cx={cx} cy={cy} land="#7d867d" india={C.nightInk} indiaMix={pt(t, 1.8, 1.2)} outline={C.nightRule} />
      <svg width={W} height={H} style={LAYER}>
        <g opacity={pin}>
          {[0, 0.5].map((o) => {
            const k = (pulse + o) % 1;
            return <circle key={o} cx={p[0]} cy={p[1]} r={8 + 46 * k} fill="none" stroke={C.signal} strokeWidth={2} opacity={1 - k} />;
          })}
          <circle cx={p[0]} cy={p[1]} r={9} fill={C.signal} />
          <line x1={p[0]} y1={p[1]} x2={p[0] - 120} y2={p[1] - 120} stroke={C.nightMuted} strokeWidth={1.5} />
        </g>
      </svg>
      <div style={{ position: "absolute", right: W - (p[0] - 128), top: p[1] - 132 - PIN_BASELINE, opacity: pin, pointerEvents: "auto" }}>{children}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// The agenda

/**
 * A page header as on the film's chapter pages: a red square and a label (<span>), the lab's name (<span>) at the
 * right, and a rule under them, fading and drawing in from `at`.
 */
export const Header: React.FC<{ at?: number; children: ReactNode }> = ({ at = 0, children }) => {
  const t = useT();
  const [label, name] = Children.toArray(children);
  const on = pt(t, at, 0.6);
  const rule = pt(t, at, 1.0, E.inOut);
  return (
    <>
      <div style={{ position: "absolute", left: M, right: M, top: 58, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: on }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 10, height: 10, background: "var(--red)", flex: "none" }} />
          {label}
        </div>
        {name}
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: 104, height: 1, background: "var(--rule)", transform: `scaleX(${rule})`, transformOrigin: "left" }} />
    </>
  );
};

/** One part of the talk: a rule draws, then the number (<b>) and the name with its headline (a <div>) rise beside it. */
export const Part: React.FC<{ at?: number; children: ReactNode }> = ({ at = 0, children }) => {
  const t = useT();
  const [num, text] = Children.toArray(children);
  return (
    <div style={{ position: "relative", padding: "26px 0" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1, background: "var(--rule)", transform: `scaleX(${pt(t, at, 0.8, E.inOut)})`, transformOrigin: "left" }} />
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "baseline", columnGap: 24 }}>
        <Rise at={at + 0.1}>{num}</Rise>
        <Rise at={at + 0.2}>{text}</Rise>
      </div>
    </div>
  );
};
