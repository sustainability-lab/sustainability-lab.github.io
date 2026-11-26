import React, { useMemo } from "react";
import { Sfx } from "../lib/sfx";
import { beat, chapter, F } from "../data";
import { BeatText, Chapter, Finding, Reveal } from "../lib/chapter";
import { E, inOut, pt, useT } from "../lib/motion";
import { breath, SignalPath, toPts } from "../lib/signal";
import ppg from "../../data/ppg-window.json";
import { C, FONT } from "../theme";
import { BAR } from "../timing";

export const HEALTH_LEN = 32 * BAR;

// bars 34–37 of the score play twice (12–20 s here), which makes room for Signal Descriptors and the sleep work
const T = { dock: 3.9, je: 4.3, sp: 14.0, sd: 22.0, te: 32.0, ap: 42.0, sl: 50.0 };

export const Health: React.FC = () => {
  const t = useT();
  const ch = chapter("health");
  const b = (id: string) => beat("health", id);
  return (
    <Chapter num={3} name={ch.name} headline={ch.headline} tone="light" len={HEALTH_LEN} dock={T.dock}>
      <Sfx at={T.je + 1.6 + 0.3} name="tick" volume={0.65} />
      <Sfx at={T.je + 1.6 + 0.55} name="tick" volume={0.65} />
      <Sfx at={T.sp - 0.1} name="whoosh" volume={0.3} />
      <Sfx at={T.sd - 0.1} name="whoosh" volume={0.3} />
      <Sfx at={T.te - 0.1} name="whoosh" volume={0.3} />
      <Sfx at={T.ap - 0.1} name="whoosh" volume={0.3} />
      <Sfx at={T.sl - 0.1} name="whoosh" volume={0.3} />
      <BeatText tone="light" at={T.je} out={T.sp - 0.42} title={b("jouleseye").title} text={b("jouleseye").text} tag={b("jouleseye").tag} />
      <Finding tone="light" at={T.je + 4.5} out={T.sp} f={b("jouleseye").finding} top={750} />
      <Finding tone="light" at={T.sp + 3.5} out={T.sd} f={b("spiromask").finding} />
      <Finding tone="light" at={T.te + 3.5} out={T.ap} f={b("thermeval").finding} />
      <BeatText tone="light" at={T.sp + 0.05} out={T.sd - 0.42} title={b("spiromask").title} tag={b("spiromask").tag} />
      <BeatText tone="light" at={T.sd + 0.05} out={T.te - 0.42} title={b("descriptors").title} text={b("descriptors").text} tag={b("descriptors").tag} isNew={b("descriptors").new} />
      <BeatText tone="light" at={T.te + 0.05} out={T.ap - 0.42} title={b("thermeval").title} tag={b("thermeval").tag} />
      <BeatText tone="light" at={T.ap + 0.05} out={T.sl - 0.42} title={b("apneaeye").title} tag={b("apneaeye").tag} />
      <BeatText tone="light" at={T.sl + 0.05} title={b("sleep").title} text={b("sleep").text} tag={b("sleep").tag} isNew={b("sleep").new} />

      {/* JoulesEye: the rig, the thermal view, the breathing signal, and the result */}
      <Reveal src={F.img.je_bike} at={T.je + 0.15} out={T.sp - 0.2} x={900} y={196} w={520} h={760} pos="50% 60%" />
      <Reveal src={F.img.je_thermal} at={T.je + 0.55} out={T.sp - 0.25} x={1450} y={196} w={350} h={230} from="bottom" />
      <Breathing at={T.je + 0.9} out={T.sp - 0.3} />
      <ErrorBars at={T.je + 1.6} out={T.sp - 0.3} />

      {/* SpiroMask */}
      <Reveal src={F.img.spiro_use} at={T.sp - 0.2} out={T.sd - 0.2} x={900} y={196} w={600} h={494} fit="cover" />
      <Reveal src={F.img.spiro_mask} at={T.sp + 0.25} out={T.sd - 0.25} x={1530} y={196} w={270} h={253} fit="cover" from="bottom" />
      <div style={{ position: "absolute", left: 900, top: 708, fontFamily: FONT.mono, fontSize: 24, color: C.muted, opacity: inOut(t, T.sp + 0.6, T.sd - 0.3) }}>Forced breathing into SpiroMask</div>
      <div style={{ position: "absolute", left: 1530, top: 466, width: 270, fontFamily: FONT.mono, fontSize: 22, lineHeight: 1.3, color: C.muted, opacity: inOut(t, T.sp + 0.8, T.sd - 0.3) }}>The sensor, inside an N95</div>

      {/* Signal Descriptors: a real wrist-pulse window and its own descriptors */}
      <Descriptors at={T.sd} out={T.te} />

      {/* ThermEval */}
      <Reveal src={F.img.thermeval} at={T.te - 0.2} out={T.ap - 0.2} x={900} y={196} w={900} h={600} fit="cover" />

      {/* ApneaEye */}
      <Reveal src={F.img.apneaeye} at={T.ap - 0.2} out={T.sl - 0.2} x={900} y={250} w={900} h={450} fit="cover" />

      {/* interpretable sleep staging: the ten concepts (names only) and the paper's two scores */}
      <Sleep at={T.sl} />
    </Chapter>
  );
};

const Breathing: React.FC<{ at: number; out: number }> = ({ at, out }) => {
  const t = useT();
  const pts = useMemo(() => toPts(breath(240).map((v, i) => v), { x0: 1470, x1: 1780, top: 492, base: 600 }), []);
  const o = inOut(t, at, out, 0.4, 0.4);
  // the trace scrolls in like a live monitor
  const draw = pt(t, at + 0.2, 2.6, E.linear);
  return (
    <div style={{ position: "absolute", left: 1450, top: 446, width: 350, height: 190, background: C.ink, opacity: o }}>
      <div style={{ position: "absolute", left: 20, top: 14, fontFamily: FONT.mono, fontSize: 18, color: "#c9cdc4", letterSpacing: "0.04em" }}>BREATHING · NOSTRIL TEMPERATURE</div>
      <svg width={1920} height={1080} style={{ position: "absolute", left: -1450, top: -446 }}>
        <SignalPath pts={pts} draw={draw} color={C.signal} width={3} glow={0.6} />
      </svg>
    </div>
  );
};

const ErrorBars: React.FC<{ at: number; out: number }> = ({ at, out }) => {
  const t = useT();
  const o = inOut(t, at, out, 0.4, 0.4);
  // as the JoulesEye film words them: breathing from a chest belt with the camera's measured 2.1% error added,
  // against the Apple Watch's own estimate (IMWUT 2024, Fig. 9, Table 3)
  const rows: [string, number, string][] = [
    ["JoulesEye, from breathing", 5.8, C.red],
    ["Smartwatch's own estimate", 37.6, C.muted],
  ];
  return (
    <div style={{ position: "absolute", left: 1450, top: 662, width: 350, opacity: o }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.muted, letterSpacing: "0.04em", marginBottom: 14 }}>ERROR IN CALORIES BURNED</div>
      {rows.map(([name, v, col], i) => {
        const a = pt(t, at + 0.3 + i * 0.25, 1.1, E.out);
        return (
          <div key={name} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: 22, color: C.ink, marginBottom: 6 }}>
              <span>{name}</span>
              <span style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 30, color: col, fontVariantNumeric: "tabular-nums" }}>{(v * a).toFixed(1)}%</span>
            </div>
            <div style={{ height: 14, background: C.soft }}>
              <div style={{ height: "100%", width: `${(v / 40) * 100 * a}%`, background: col }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const P = ppg as unknown as { fs: number; hr_ecg: number; x: number[]; mean: number; sd: number; crossings: number[]; dominant_hz: number; spec_f: number[]; spec: number[] };

/** Signal Descriptors: the pulse is drawn, then its statistical, temporal and spectral descriptors light up. */
const Descriptors: React.FC<{ at: number; out: number }> = ({ at, out }) => {
  const t = useT();
  const on = inOut(t, at - 0.15, out - 0.3, 0.5, 0.4);
  if (on <= 0) return null;
  const box = { x0: 930, x1: 1790, top: 276, base: 540 };
  const lo = Math.min(...P.x) - 5, hi = Math.max(...P.x) + 16;
  const pts = toPts(P.x, box, lo, hi);
  const vy = (v: number) => box.base - ((v - lo) / (hi - lo)) * (box.base - box.top);
  const xs = (i: number) => box.x0 + ((box.x1 - box.x0) * i) / (P.x.length - 1);
  const draw = pt(t, at + 0.3, 1.6, E.inOut);
  const stat = pt(t, at + 2.3, 0.5);
  const temp = pt(t, at + 3.6, 0.5);
  const spec = pt(t, at + 4.9, 0.6);
  const sMax = Math.max(...P.spec);
  const fx = (f: number) => 930 + (f / 5) * 860;
  const sy = (v: number) => 860 - (v / sMax) * 170;
  const specD = P.spec_f.map((f, i) => `${i ? "L" : "M"}${fx(f).toFixed(1)},${sy(P.spec[i]).toFixed(1)}`).join("");
  const lab = (x: number, y: number, a: number, s: string, col = C.muted) => (
    <text x={x} y={y} fill={col} fontFamily={FONT.mono} fontSize={20} opacity={a}>{s}</text>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: on }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect x={box.x0} y={vy(P.mean + P.sd)} width={box.x1 - box.x0} height={vy(P.mean - P.sd) - vy(P.mean + P.sd)} fill={C.soft} opacity={stat} />
        <line x1={box.x0} x2={box.x1} y1={vy(P.mean)} y2={vy(P.mean)} stroke={C.ink} strokeWidth={2} strokeDasharray="7 6" opacity={stat} />
        <SignalPath pts={pts} draw={draw} color={C.red} width={3.4} />
        {P.crossings.map((i) => (
          <circle key={i} cx={xs(i)} cy={vy(P.mean)} r={6 * temp} fill={C.ink} />
        ))}
        {lab(box.x0, box.top - 20, stat, "statistical: mean and ±1 SD")}
        {lab(box.x0 + 420, box.top - 20, temp, "temporal: mean crossings", C.ink)}
        <line x1={930} x2={1790} y1={860} y2={860} stroke={C.rule} strokeWidth={2} opacity={spec} />
        <path d={specD} fill="none" stroke={C.ink} strokeWidth={2.4} opacity={spec} />
        <line x1={fx(P.dominant_hz)} x2={fx(P.dominant_hz)} y1={680} y2={860} stroke={C.red} strokeWidth={2.5} opacity={spec} />
        {lab(930, 668, spec, "spectral: its strongest rhythm")}
        {lab(fx(P.dominant_hz) + 12, 700, spec, `${P.dominant_hz.toFixed(2)} Hz = ${Math.round(P.dominant_hz * 60)} a minute (ECG: ${Math.round(P.hr_ecg)})`, C.red)}
      </svg>
      <div style={{ position: "absolute", left: 930, top: 902, fontFamily: FONT.mono, fontSize: 19, color: C.muted, opacity: pt(t, at + 0.8, 0.5) }}>
        8 s of wrist PPG while sitting · PPG-DaLiA (CC BY 4.0)
      </div>
    </div>
  );
};

const CONCEPTS = ["spindles", "K-complexes", "slow waves", "eye movements", "sigma power", "alpha power", "theta power", "delta power", "muscle tone", "muscle bursts"];

/** Interpretable sleep staging: ten named concepts feed the stage, and they score as well as raw signals. */
const Sleep: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  if (t < at - 0.3) return null;
  const on = pt(t, at - 0.2, 0.5, E.inOut);
  const bars: [string, number, string][] = [
    ["Raw signals", 0.77, C.muted],
    ["Ten concepts", 0.78, C.red],
  ];
  return (
    <div style={{ position: "absolute", left: 930, top: 220, width: 870, opacity: on }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 20, color: C.muted, marginBottom: 16 }}>Each 30-second epoch becomes</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {CONCEPTS.map((c, i) => {
          const a = pt(t, at + 0.4 + i * 0.12, 0.4, E.out);
          return (
            <div key={c} style={{ padding: "12px 10px", border: `2px solid ${i < 4 ? C.red : C.ink}`, fontFamily: FONT.body, fontSize: 21, color: C.ink, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>
              {c}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 22, opacity: pt(t, at + 2.0, 0.4) }}>
        <span style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 40, color: C.ink }}>↓</span>
        <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 30, color: C.ink }}>sleep stage</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 20, color: C.muted }}>wake · light · deep · REM</span>
      </div>
      <div style={{ marginTop: 40, fontFamily: FONT.mono, fontSize: 19, color: C.muted, marginBottom: 12, opacity: pt(t, at + 3.0, 0.4) }}>
        FOUR-CLASS STAGING · MACRO-F1
      </div>
      {bars.map(([name, v, col], i) => {
        const a = pt(t, at + 3.2 + i * 0.4, 0.9, E.out);
        return (
          <div key={name} style={{ display: "grid", gridTemplateColumns: "200px 1fr 80px", alignItems: "center", gap: 14, marginBottom: 12, opacity: a > 0 ? 1 : 0 }}>
            <span style={{ fontFamily: FONT.body, fontSize: 24, color: C.ink }}>{name}</span>
            <span style={{ height: 22, background: C.soft }}>
              <span style={{ display: "block", height: "100%", width: `${v * 100 * a}%`, background: col }} />
            </span>
            <span style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 30, color: col, textAlign: "right", fontVariantNumeric: "tabular-nums", opacity: pt(t, at + 3.2 + i * 0.4, 0.3) }}>{v.toFixed(2)}</span>
          </div>
        );
      })}
    </div>
  );
};
