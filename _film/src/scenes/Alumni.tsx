import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Sfx } from "../lib/sfx";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { F } from "../data";
import { equalEarth, geoDistance, GN, world } from "../lib/geo";
import { Appear, E, Kicker, pt, Rise, useT, Words } from "../lib/motion";
import { C, FONT, H, M, W } from "../theme";
import { BAR } from "../timing";

export const ALUMNI_LEN = 6 * BAR;

// labels are grouped where campuses sit close together; the block sits at (dx, dy) from the first campus
const GROUPS: { names: string[]; dx: number; dy: number; anchor: "start" | "end" }[] = [
  { names: ["University of Cambridge"], dx: -26, dy: -40, anchor: "end" },
  { names: ["ETH Zurich", "Univ. of Tübingen"], dx: 34, dy: -58, anchor: "start" },
  { names: ["Carnegie Mellon", "Johns Hopkins", "NYU", "Stony Brook", "UMass Amherst"], dx: 70, dy: -10, anchor: "start" },
  { names: ["UIUC"], dx: -30, dy: -36, anchor: "end" },
  { names: ["Rice University"], dx: -26, dy: 44, anchor: "end" },
  { names: ["Caltech", "UC San Diego"], dx: -34, dy: -8, anchor: "end" },
  { names: ["Microsoft Research India", "Google DeepMind", "IISc"], dx: -44, dy: 40, anchor: "end" },
  { names: ["IIT Bombay", "IIT Madras"], dx: 44, dy: 18, anchor: "start" },
];

const MAP_W = 1510;
const CX = 1000;
const CY = 566;

/** A flight-path arc in screen space, drawn up to fraction a. */
const arc = (g: [number, number], e: [number, number], a: number) => {
  const mx = (g[0] + e[0]) / 2;
  const my = (g[1] + e[1]) / 2;
  const dist = Math.hypot(e[0] - g[0], e[1] - g[1]);
  const cx = mx;
  const cy = my - Math.max(30, dist * 0.32);
  let d = "";
  const n = 48;
  const m = Math.max(1, Math.ceil(a * n));
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

export const Alumni: React.FC = () => {
  const t = useT();
  const proj = useMemo(() => equalEarth(MAP_W, 0, CX, CY, 15), []);
  const ref = useRef<HTMLCanvasElement>(null);
  const on = pt(t, 0, 0.8);
  const out = pt(t, ALUMNI_LEN - 0.4, 0.4, E.in);

  useLayoutEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.clearRect(0, 0, W, H);
    g.fillStyle = "#59615a";
    for (const [lat, lon] of world) {
      const p = proj([lon, lat]);
      if (!p) continue;
      g.beginPath();
      g.arc(p[0], p[1], 2.1, 0, Math.PI * 2);
      g.fill();
    }
  }, [proj]);

  const places = F.alumni.places;
  const order = useMemo(() => places.map((p, i) => ({ p, i, d: geoDistance(GN, [p.lon, p.lat]) })).sort((a, b) => a.d - b.d), [places]);
  const [gx, gy] = proj(GN) ?? [0, 0];

  return (
    <AbsoluteFill style={{ background: C.night }}>
      {order.map((_, k) => (
        <Sfx key={k} at={0.9 + k * 0.17 + 1.0} name="ping" volume={0.4} />
      ))}
      <div style={{ position: "absolute", inset: 0, opacity: on * (1 - out) }}>
        <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0 }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {order.map(({ p, i }, k) => {
            const at = 0.9 + k * 0.17;
            const a = pt(t, at, 1.1, E.inOut);
            if (a <= 0) return null;
            const [ex, ey] = proj([p.lon, p.lat]) ?? [0, 0];
            const { d, tip } = arc([gx, gy], [ex, ey], a);
            const land = pt(t, at + 1.0, 0.5);
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={C.signal} strokeWidth={2.2} opacity={0.9} />
                {a < 1 && <circle cx={tip[0]} cy={tip[1]} r={4} fill={C.nightInk} />}
                <circle cx={ex} cy={ey} r={5 * land} fill={C.nightInk} />
                {land > 0 && land < 1 && <circle cx={ex} cy={ey} r={6 + 22 * land} fill="none" stroke={C.nightInk} strokeWidth={1.5} opacity={1 - land} />}
              </g>
            );
          })}
          <circle cx={gx} cy={gy} r={9} fill={C.signal} />
          {GROUPS.map((gr, gi) => {
            const first = places.find((p) => p.name === gr.names[0]);
            if (!first) return null;
            const [x, y] = proj([first.lon, first.lat]) ?? [0, 0];
            const k = order.findIndex((o) => o.p.name === gr.names[0]);
            const o = pt(t, 0.9 + k * 0.17 + 1.2, 0.5);
            return (
              <g key={gi} opacity={o}>
              <line x1={x} y1={y} x2={x + gr.dx * 0.8} y2={y + gr.dy - 6} stroke={C.nightMuted} strokeWidth={1.2} />
              <text x={x + gr.dx} y={y + gr.dy} fill={C.nightInk} fontFamily={FONT.body} fontSize={28} textAnchor={gr.anchor}>
                {gr.names.map((nm, j) => (
                  <tspan key={nm} x={x + gr.dx} dy={j ? 32 : 0}>
                    {nm}
                  </tspan>
                ))}
              </text>
              </g>
            );
          })}
        </svg>

        {/* title and the two PhD graduates */}
        <div style={{ position: "absolute", left: M, top: 64 }}>
          <Words text={F.alumni.title} at={0.2} style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 84, letterSpacing: "-0.045em", lineHeight: 1, color: C.nightInk, width: 640 }} />
        </div>
        <div style={{ position: "absolute", left: M, bottom: 84, display: "flex", flexDirection: "column", gap: 18 }}>
          {F.alumni.featured.map((a, i) => (
            <Appear key={a.name} at={2.6 + i * 0.25} dy={20}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <Img src={staticFile(a.photo)} style={{ width: 92, height: 92, borderRadius: "50%", objectFit: "cover", border: `3px solid ${C.signal}` }} />
                <div style={{ width: 520 }}>
                  <div style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", color: C.nightInk }}>{a.name}</div>
                  <div style={{ fontFamily: FONT.body, fontSize: 22, lineHeight: 1.3, color: C.nightMuted, marginTop: 4 }}>{a.now.replace(/ \(.*\)/, "")}</div>
                  {a.note && <div style={{ fontFamily: FONT.mono, fontSize: 19, color: C.signal, marginTop: 4 }}>{a.note}</div>}
                </div>
              </div>
            </Appear>
          ))}
        </div>
        <div style={{ position: "absolute", right: M, bottom: 84, textAlign: "right", width: 560 }}>
          <Rise at={3.4}>
            <Kicker color={C.nightMuted} square={C.signal} size={20} style={{ justifyContent: "flex-end" }}>
              Also at
            </Kicker>
          </Rise>
          <Rise at={3.55} style={{ marginTop: 10 }}>
            <div style={{ fontFamily: FONT.body, fontSize: 28, lineHeight: 1.35, color: C.nightInk }}>{F.alumni.also_at.join(" · ")}</div>
          </Rise>
          <Rise at={3.7} style={{ marginTop: 12 }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 21, color: C.nightMuted }}>
              {F.alumni.counts.PhD} PhD graduates · {F.alumni.counts.MTech} MTech alumni
            </div>
          </Rise>
        </div>
      </div>
    </AbsoluteFill>
  );
};
