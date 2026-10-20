import React, { useMemo } from "react";
import { Sfx } from "../lib/sfx";
import { beat, chapter, F } from "../data";
import { BeatText, Chapter, Reveal } from "../lib/chapter";
import { E, inOut, lerp, pt, useT } from "../lib/motion";
import { iawe, morph, Pt, resampleMax, SignalPath, toPts } from "../lib/signal";
import { C, FONT, W, H } from "../theme";
import { BAR } from "../timing";

export const ENERGY_LEN = 10 * BAR;

const T = { dock: 3.9, nl: 4.3, tk: 11.1, nb: 15.5 };

const LANES: [keyof typeof iawe, string][] = [
  ["air_conditioner", "Air conditioner"],
  ["fridge", "Fridge"],
  ["washing_machine", "Washing machine"],
  ["television", "Television"],
  ["computer", "Computer"],
];
const X0 = 1130;
const X1 = 1800;
const MAINS = { top: 190, base: 330 };
const LANE0 = 400;
const LANE_H = 112;

export const Energy: React.FC = () => {
  const t = useT();
  const ch = chapter("energy");
  const b = (id: string) => beat("energy", id);

  const lines = useMemo(() => {
    const mains = resampleMax(iawe.mains as number[]);
    const mx = Math.max(...mains);
    const mainsPts = toPts(mains, { x0: X0, x1: X1, top: MAINS.top, base: MAINS.base }, 0, mx);
    const lanes = LANES.map(([key], i) => {
      const v = resampleMax(iawe[key] as number[]);
      const top = LANE0 + i * LANE_H;
      // start: the appliance at the mains' scale, sitting on the mains line; end: its own lane and scale
      const start = toPts(v, { x0: X0, x1: X1, top: MAINS.top, base: MAINS.base }, 0, mx);
      const end = toPts(v, { x0: X0, x1: X1, top: top + 18, base: top + LANE_H - 24 }, 0, Math.max(...v) || 1);
      return { start, end, top };
    });
    return { mainsPts, lanes };
  }, []);

  const panel = inOut(t, T.nl, T.tk - 0.3, 0.5, 0.4);
  const drawMains = pt(t, T.nl + 0.2, 1.6, E.inOut);

  return (
    <Chapter num={4} name={ch.name} headline={ch.headline} tone="dark" len={ENERGY_LEN} dock={T.dock}>
      {LANES.map((_, i) => (
        <Sfx key={i} at={T.nl + 2.0 + i * 0.32} name="zip" volume={0.45} />
      ))}
      <Sfx at={T.tk - 0.1} name="whoosh" volume={0.33} />
      <Sfx at={T.nb - 0.1} name="whoosh" volume={0.33} />
      <BeatText tone="dark" at={T.nl} out={T.tk - 0.42} title={b("nilm").title} text={b("nilm").text} tag={b("nilm").tag} />
      <BeatText tone="dark" at={T.tk + 0.05} out={T.nb - 0.42} title={b("nilmtk").title} tag={b("nilmtk").tag} />
      <BeatText tone="dark" at={T.nb + 0.05} title={b("nilmbench").title} tag={b("nilmbench").tag} />

      {/* disaggregation: the meter's line splits into appliance lanes */}
      <div style={{ position: "absolute", inset: 0, opacity: panel }}>
        <div style={{ position: "absolute", left: 930, top: MAINS.top + 4, fontFamily: FONT.mono, fontSize: 21, color: C.nightInk, letterSpacing: "0.04em" }}>ONE METER</div>
        <div style={{ position: "absolute", left: 930, top: MAINS.top + 34, fontFamily: FONT.mono, fontSize: 18, color: C.nightMuted }}>{iawe.date}</div>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <line x1={X0} x2={X1} y1={MAINS.base + 2} y2={MAINS.base + 2} stroke={C.nightRule} strokeWidth={1.5} />
          {lines.lanes.map((ln, i) => {
            const s = pt(t, T.nl + 2.0 + i * 0.32, 1.1, E.inOut);
            if (s <= 0) return null;
            const pts: Pt[] = morph(ln.start, ln.end, s);
            return (
              <g key={i}>
                <line x1={X0} x2={X1} y1={ln.top + LANE_H - 22} y2={ln.top + LANE_H - 22} stroke={C.nightRule} strokeWidth={1} opacity={s} />
                <SignalPath pts={pts} color={i === 0 ? C.pink : C.nightInk} width={2.4} tip={false} opacity={lerp(0.3, 1, s)} />
              </g>
            );
          })}
          <SignalPath pts={lines.mainsPts} draw={drawMains} color={C.signal} width={3} glow={0.8} />
          {[0, 6, 12, 18, 24].map((h) => {
            const x = X0 + ((X1 - X0) * h) / 24;
            return (
              <text key={h} x={x} y={LANE0 + LANES.length * LANE_H + 14} fill={C.nightMuted} fontFamily={FONT.mono} fontSize={18} textAnchor="middle" opacity={pt(t, T.nl + 3.4, 0.5)}>
                {String(h).padStart(2, "0")}:00
              </text>
            );
          })}
        </svg>
        {LANES.map(([, label], i) => (
          <div key={label} style={{ position: "absolute", left: 930, top: LANE0 + i * LANE_H + 34, fontFamily: FONT.body, fontSize: 23, color: i === 0 ? C.pink : C.nightInk, opacity: pt(t, T.nl + 2.5 + i * 0.32, 0.5) }}>
            {label}
          </div>
        ))}
      </div>

      {/* NILMTK and the Test-of-Time award */}
      <Reveal src={F.img.testoftime} at={T.tk - 0.15} out={T.nb - 0.2} x={1240} y={196} w={560} h={760} pos="50% 30%" />
      <Reveal src={F.img.nilmtk} at={T.tk + 0.3} out={T.nb - 0.25} x={900} y={760} w={316} h={196} fit="contain" bg="#ffffff" from="bottom" />

      {/* NILMBench2026 at BuildSys */}
      <Reveal src={F.img.nilmbench_award} at={T.nb - 0.2} x={900} y={250} w={900} h={487} fit="cover" />
      <div style={{ position: "absolute", left: 900, top: 760, fontFamily: FONT.mono, fontSize: 21, color: C.nightMuted, opacity: pt(t, T.nb + 0.9, 0.5) }}>
        ACM BuildSys 2026, Banff · Aayush Kuloor, Anurag Singh, Harsh Dhru
      </div>
    </Chapter>
  );
};
