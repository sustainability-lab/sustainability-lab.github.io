import React from "react";
import { E, lerp, pt, useT } from "../../lib/motion";
import { iawe, morph, type Pt, resampleMax, SignalPath, toPts } from "../../lib/signal";
import { C, FONT } from "../../theme";

// Drawings for the energy slides, made from the film's data (data/signals.json: one iAWE home in Delhi, one
// day) exactly as the film draws them (src/scenes/Energy.tsx). They hold no words: the meter's name, the date
// and the appliances' names are written in the slide file. The trace runs from x = 1130 to 1800; the names sit
// at x = 930, the meter's at y = 194, the date at 224, and appliance i's at y = 434 + 112 i.

const X0 = 1130;
const X1 = 1800;
const MAINS = { top: 190, base: 330 };
const LANE0 = 400;
const LANE_H = 112;
/** The lanes, top to bottom. The air conditioner is drawn in pink. */
const KEYS = ["air_conditioner", "fridge", "washing_machine", "television", "computer"] as const;

type Lines = { mains: Pt[]; lanes: { start: Pt[]; end: Pt[]; top: number }[] };
let lines: Lines | null = null;

/** The meter's line, and each appliance's line twice: at the meter's scale, sitting on its line, and in its own lane, on its own scale. */
const getLines = (): Lines => {
  if (lines) return lines;
  const mains = resampleMax(iawe.mains);
  const mx = Math.max(...mains);
  const box = { x0: X0, x1: X1, top: MAINS.top, base: MAINS.base };
  lines = {
    mains: toPts(mains, box, 0, mx),
    lanes: KEYS.map((key, i) => {
      const v = resampleMax(iawe[key]);
      const top = LANE0 + i * LANE_H;
      return { start: toPts(v, box, 0, mx), end: toPts(v, { x0: X0, x1: X1, top: top + 18, base: top + LANE_H - 24 }, 0, Math.max(...v) || 1), top };
    }),
  };
  return lines;
};

const layer: React.CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none" };

/** One home's meter over one day: a rule fades in at `at`, and the meter's line draws on over it from `at` + 0.2 s. */
export const MeterLine: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT();
  return (
    <svg width={1920} height={1080} style={{ ...layer, opacity: pt(t, at, 0.5) }}>
      <line x1={X0} x2={X1} y1={MAINS.base + 2} y2={MAINS.base + 2} stroke={C.nightRule} strokeWidth={1.5} />
      <SignalPath pts={getLines().mains} draw={pt(t, at + 0.2, 1.6, E.inOut)} color={C.signal} width={3} glow={0.8} />
    </svg>
  );
};

/**
 * The meter's line splitting into the home's appliances, one lane each: air conditioner (pink), fridge, washing
 * machine, television, computer. Lane i leaves the meter's line at `at` + 0.32 i s and settles into its own lane,
 * on its own scale, 1.1 s later; the day's hours appear under the lanes at `at` + 1.4 s. Put <MeterLine> after this
 * in the slide, so the meter's line stays on top, as in the film.
 */
export const Split: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT();
  return (
    <svg width={1920} height={1080} style={layer}>
      {getLines().lanes.map((ln, i) => {
        const s = pt(t, at + i * 0.32, 1.1, E.inOut);
        if (s <= 0) return null;
        return (
          <g key={i}>
            <line x1={X0} x2={X1} y1={ln.top + LANE_H - 22} y2={ln.top + LANE_H - 22} stroke={C.nightRule} strokeWidth={1} opacity={s} />
            <SignalPath pts={morph(ln.start, ln.end, s)} color={i === 0 ? C.pink : C.nightInk} width={2.4} tip={false} opacity={lerp(0.3, 1, s)} />
          </g>
        );
      })}
      {[0, 6, 12, 18, 24].map((h) => (
        <text key={h} x={X0 + ((X1 - X0) * h) / 24} y={LANE0 + KEYS.length * LANE_H + 14} fill={C.nightMuted} fontFamily={FONT.mono} fontSize={18} textAnchor="middle" opacity={pt(t, at + 1.4, 0.5)}>
          {String(h).padStart(2, "0")}:00
        </text>
      ))}
    </svg>
  );
};
