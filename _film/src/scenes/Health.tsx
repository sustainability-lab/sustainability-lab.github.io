import React, { useMemo } from "react";
import { Sfx } from "../lib/sfx";
import { beat, chapter, F } from "../data";
import { BeatText, Chapter, Reveal } from "../lib/chapter";
import { E, inOut, pt, useT } from "../lib/motion";
import { breath, SignalPath, toPts } from "../lib/signal";
import { C, FONT } from "../theme";
import { BAR } from "../timing";

export const HEALTH_LEN = 10 * BAR;

const T = { dock: 3.9, je: 4.3, sp: 9.9, te: 13.6, ap: 17.0 };

export const Health: React.FC = () => {
  const t = useT();
  const ch = chapter("health");
  const b = (id: string) => beat("health", id);
  return (
    <Chapter num={3} name={ch.name} headline={ch.headline} tone="light" len={HEALTH_LEN} dock={T.dock}>
      <Sfx at={T.je + 1.6 + 0.3} name="tick" volume={0.65} />
      <Sfx at={T.je + 1.6 + 0.55} name="tick" volume={0.65} />
      <Sfx at={T.sp - 0.1} name="whoosh" volume={0.3} />
      <Sfx at={T.te - 0.1} name="whoosh" volume={0.3} />
      <Sfx at={T.ap - 0.1} name="whoosh" volume={0.3} />
      <BeatText tone="light" at={T.je} out={T.sp - 0.42} title={b("jouleseye").title} tag={b("jouleseye").tag} />
      <BeatText tone="light" at={T.sp + 0.05} out={T.te - 0.42} title={b("spiromask").title} tag={b("spiromask").tag} />
      <BeatText tone="light" at={T.te + 0.05} out={T.ap - 0.42} title={b("thermeval").title} tag={b("thermeval").tag} />
      <BeatText tone="light" at={T.ap + 0.05} title={b("apneaeye").title} tag={b("apneaeye").tag} />

      {/* JoulesEye: the rig, the thermal view, the breathing signal, and the result */}
      <Reveal src={F.img.je_bike} at={T.je + 0.15} out={T.sp - 0.2} x={900} y={196} w={520} h={760} pos="50% 60%" />
      <Reveal src={F.img.je_thermal} at={T.je + 0.55} out={T.sp - 0.25} x={1450} y={196} w={350} h={230} from="bottom" />
      <Breathing at={T.je + 0.9} out={T.sp - 0.3} />
      <ErrorBars at={T.je + 1.6} out={T.sp - 0.3} />

      {/* SpiroMask */}
      <Reveal src={F.img.spiro_use} at={T.sp - 0.2} out={T.te - 0.2} x={900} y={196} w={600} h={494} fit="cover" />
      <Reveal src={F.img.spiro_mask} at={T.sp + 0.25} out={T.te - 0.25} x={1530} y={196} w={270} h={253} fit="cover" from="bottom" />
      <div style={{ position: "absolute", left: 900, top: 708, fontFamily: FONT.mono, fontSize: 24, color: C.muted, opacity: inOut(t, T.sp + 0.6, T.te - 0.3) }}>Forced breathing into SpiroMask</div>
      <div style={{ position: "absolute", left: 1530, top: 466, width: 270, fontFamily: FONT.mono, fontSize: 22, lineHeight: 1.3, color: C.muted, opacity: inOut(t, T.sp + 0.8, T.te - 0.3) }}>The sensor, inside an N95</div>

      {/* ThermEval */}
      <Reveal src={F.img.thermeval} at={T.te - 0.2} out={T.ap - 0.2} x={900} y={196} w={900} h={600} fit="cover" />

      {/* ApneaEye */}
      <Reveal src={F.img.apneaeye} at={T.ap - 0.2} x={900} y={250} w={900} h={450} fit="cover" />
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
  const rows: [string, number, string][] = [
    ["JoulesEye", 5.8, C.red],
    ["Heart-rate smartwatch", 37.6, C.muted],
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
