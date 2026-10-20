import React from "react";
import signals from "../../data/signals.json";
import kilns from "../../data/kilns.json";

export type Pt = [number, number];
export const N = 720; // every line has the same number of points, so any two can morph

/** Linear resampling of a series to n points. */
export const resample = (v: number[], n = N) => {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * (v.length - 1);
    const a = Math.floor(x);
    const b = Math.min(v.length - 1, a + 1);
    out.push(v[a] + (v[b] - v[a]) * (x - a));
  }
  return out;
};

/** Max-pool resampling keeps spikes (for power traces). */
export const resampleMax = (v: number[], n = N) => {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.floor((i / n) * v.length);
    const b = Math.max(a + 1, Math.floor(((i + 1) / n) * v.length));
    let m = -Infinity;
    for (let j = a; j < b; j++) m = Math.max(m, v[j]);
    out.push(m);
  }
  return out;
};

export const smooth = (v: number[], r: number) =>
  v.map((_, i) => {
    let s = 0;
    let w = 0;
    for (let j = -r; j <= r; j++) {
      const k = i + j;
      if (k < 0 || k >= v.length) continue;
      const g = Math.exp(-(j * j) / (2 * (r / 2) ** 2));
      s += v[k] * g;
      w += g;
    }
    return s / w;
  });

export type Box = { x0: number; x1: number; top: number; base: number };

/** Map values into a screen box: min→base, max→top. */
export const toPts = (v: number[], box: Box, lo?: number, hi?: number): Pt[] => {
  const mn = lo ?? Math.min(...v);
  const mx = hi ?? Math.max(...v);
  return v.map((y, i) => [box.x0 + ((box.x1 - box.x0) * i) / (v.length - 1), box.base - ((y - mn) / (mx - mn || 1)) * (box.base - box.top)]);
};

export const morph = (a: Pt[], b: Pt[], t: number): Pt[] => a.map(([x, y], i) => [x + (b[i][0] - x) * t, y + (b[i][1] - y) * t]);

export const pathD = (pts: Pt[], upto = 1) => {
  const n = Math.max(2, Math.min(pts.length, Math.ceil(upto * (pts.length - 1)) + 1));
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < n; i++) d += `L${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`;
  return d;
};

/** Point at fraction `u` along the polyline's index (for the pen tip). */
export const tipAt = (pts: Pt[], u: number): Pt => {
  const x = u * (pts.length - 1);
  const a = Math.floor(x);
  const b = Math.min(pts.length - 1, a + 1);
  const f = x - a;
  return [pts[a][0] + (pts[b][0] - pts[a][0]) * f, pts[a][1] + (pts[b][1] - pts[a][1]) * f];
};

// ---------- the four opening signals (all real data except breathing, which is illustrative) ----------
export const delhi = signals.delhi_pm25.values as number[];
export const delhiStart = signals.delhi_pm25.start as string;

export const kilnProfile = () => {
  const c = signals.kiln_profile.counts as number[];
  return smooth(c, 6);
};

export const breath = (n = N) =>
  Array.from({ length: n }, (_, i) => {
    const s = i / (n - 1);
    const ph = s * 2 * Math.PI * 9.2; // ~9 breaths across the screen
    const amp = 0.82 + 0.18 * Math.sin(s * 5.1 + 0.6) + 0.06 * Math.sin(s * 31);
    // inhale is quicker than exhale: skew the sine
    const skew = Math.sin(ph + 0.55 * Math.sin(ph));
    return amp * skew + 0.04 * Math.sin(s * 210);
  });

export const iawe = signals.iawe as unknown as {
  date: string;
  mains: number[];
  air_conditioner: number[];
  fridge: number[];
  washing_machine: number[];
  television: number[];
  computer: number[];
};

/** The logo's sigmoid: y = 85 − 50 / (1 + e^(−0.2555 (x − 110))), x ∈ [90, 130]. */
export const sigmoidPts = (cx: number, cy: number, scale: number, n = N): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const x = 90 + (40 * i) / (n - 1);
    const y = 85 - 50 / (1 + Math.exp(-0.2555 * (x - 110)));
    return [cx + (x - 120) * scale, cy + (y - 60) * scale];
  });

export const kilnCount = (kilns as { n: number }).n;

/** The red signal line, drawn up to `draw` (0..1) with a glowing pen tip. */
export const SignalPath: React.FC<{
  pts: Pt[];
  draw?: number;
  color: string;
  width?: number;
  glow?: number;
  tip?: boolean;
  opacity?: number;
}> = ({ pts, draw = 1, color, width = 4, glow = 0, tip = true, opacity = 1 }) => {
  const d = pathD(pts, draw);
  const [tx, ty] = tipAt(pts, draw);
  return (
    <g opacity={opacity}>
      {glow > 0 && <path d={d} fill="none" stroke={color} strokeWidth={width * 4} strokeLinejoin="round" strokeLinecap="round" opacity={0.18 * glow} style={{ filter: "blur(10px)" }} />}
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />
      {tip && draw > 0.001 && draw < 0.999 && (
        <>
          <circle cx={tx} cy={ty} r={width * 4} fill={color} opacity={0.25} />
          <circle cx={tx} cy={ty} r={width * 1.6} fill={color} />
        </>
      )}
    </g>
  );
};
