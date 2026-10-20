import React, { useMemo } from "react";
import { Sfx } from "../lib/sfx";
import { AbsoluteFill } from "remotion";
import { F } from "../data";
import { E, pt, Rise, useT, lerp, inOut } from "../lib/motion";
import { N, Pt, breath, delhi, iawe, kilnProfile, morph, resample, resampleMax, sigmoidPts, SignalPath, smooth, toPts } from "../lib/signal";
import { C, FONT, H, M, W } from "../theme";
import { BAR, BEAT } from "../timing";

// Four words, four real signals, one red line that ends as the lab's sigmoid.
const BOX = { x0: M, x1: W - M, top: 470, base: 880 };

// accelerating cuts: 2 bars, then 1 bar each, then the logo
const T_AIR = 0.05;
const T_LAND = 2 * BAR;
const T_BREATH = 3 * BAR;
const T_POWER = 4 * BAR;
const T_LOGO = 5 * BAR;
const T_TAG = 6 * BAR;
export const HOOK_LEN = 8 * BAR;

// logo lockup geometry (logo units → px)
const S = 3.8;
const LEFT = (W - 1200) / 2;
const CX = LEFT + 30 * S; // the sigmoid's centre is at x = 120 units
const CY = 468;
const ux = (u: number) => CX + (u - 120) * S;
const uy = (u: number) => CY + (u - 60) * S;

const TICKS: { at: number; ticks: [number, string][] }[] = [
  { at: T_AIR, ticks: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((y, i) => [(i + 0.5) / 9, String(y)]) },
  {
    at: T_LAND,
    ticks: [
      [(75.6 - 73.5) / 17, "Punjab"],
      [(77.0 - 73.5) / 17, "Haryana"],
      [(80.8 - 73.5) / 17, "Uttar Pradesh"],
      [(85.4 - 73.5) / 17, "Bihar"],
      [(88.0 - 73.5) / 17, "West Bengal"],
    ],
  },
  { at: T_BREATH, ticks: [0, 5, 10, 15, 20, 25, 30].map((s) => [s / 30, `${s} s`]) },
  { at: T_POWER, ticks: [0, 4, 8, 12, 16, 20, 24].map((h) => [h / 24, `${String(h).padStart(2, "0")}:00`]) },
];

export const Hook: React.FC = () => {
  const t = useT();

  const lines = useMemo(() => {
    // Delhi: mean-pool the daily series into N bins so nothing is invented
    const per = delhi.length / N;
    const air = Array.from({ length: N }, (_, i) => {
      const a = Math.floor(i * per);
      const b = Math.max(a + 1, Math.floor((i + 1) * per));
      let s = 0;
      for (let j = a; j < b; j++) s += delhi[j];
      return s / (b - a);
    });
    const land = resample(kilnProfile());
    const br = breath();
    const pw = resampleMax(iawe.mains);
    return {
      air: toPts(air, BOX, 0),
      land: toPts(land, BOX, 0),
      breath: toPts(br, { ...BOX, top: BOX.top + 70, base: BOX.base - 70 }),
      power: toPts(pw, BOX, 0),
      powerSoft: toPts(smooth(pw, 28), BOX, 0, Math.max(...pw)),
      logo: sigmoidPts(CX, CY, S),
    };
  }, []);

  // which line, and how far through the morph
  const m1 = pt(t, T_LAND, 0.85, E.inOut);
  const m2 = pt(t, T_BREATH, 0.75, E.inOut);
  const m3 = pt(t, T_POWER, 0.75, E.inOut);
  const relax = pt(t, T_LOGO - 0.1, 0.45, E.inOut); // spikes settle before the line folds into the S
  const m4 = pt(t, T_LOGO + 0.2, 1.05, E.inOut);
  let pts: Pt[] = morph(lines.air, lines.land, m1);
  if (m2 > 0) pts = morph(lines.land, lines.breath, m2);
  if (m3 > 0) pts = morph(lines.breath, lines.power, m3);
  if (relax > 0) pts = morph(lines.power, lines.powerSoft, relax);
  if (m4 > 0) pts = morph(lines.powerSoft, lines.logo, m4);
  const draw = pt(t, T_AIR + 0.25, 2 * BAR - 0.6, E.inOut);
  const width = lerp(4, 3.5 * S, m4);

  // words: current one bright, earlier ones dim
  const words = F.hook.map((h) => h.word);
  const starts = [T_AIR + 0.3, T_LAND, T_BREATH, T_POWER];
  const current = starts.filter((s) => t >= s).length - 1;

  // logo
  const axis = pt(t, T_LOGO + 0.55, 0.8, E.inOut);
  const lockOut = pt(t, HOOK_LEN - 0.9, 0.85, E.in);

  return (
    <AbsoluteFill style={{ background: C.night }}>
      {/* the words */}
      <div style={{ position: "absolute", left: M, top: 118, display: "flex", gap: "0.3em", fontFamily: FONT.head, fontWeight: 700, fontSize: 132, letterSpacing: "-0.045em", lineHeight: 1 }}>
        {words.map((w, i) => (
          <Rise key={w} at={starts[i]} out={T_LOGO - 0.1 + i * 0.05} dur={0.6}>
            <span style={{ color: i === current ? C.nightInk : "#59615a", transition: "none" }}>{w}</span>
          </Rise>
        ))}
      </div>

      {/* caption for the current signal */}
      {F.hook.map((h, i) => {
        const end = i < 3 ? starts[i + 1] : T_LOGO;
        const o = inOut(t, starts[i] + 0.25, end - 0.15, 0.4, 0.2);
        return (
          <div key={i} style={{ position: "absolute", left: M + 4, top: 300, fontFamily: FONT.mono, fontSize: 28, letterSpacing: "0.01em", color: C.nightMuted, opacity: o }}>
            {h.caption}
          </div>
        );
      })}

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* baseline + ticks */}
        <g opacity={1 - pt(t, T_LOGO, 0.5)}>
          <line x1={BOX.x0} x2={BOX.x0 + (BOX.x1 - BOX.x0) * pt(t, 0.1, 1.6, E.inOut)} y1={BOX.base + 24} y2={BOX.base + 24} stroke={C.nightRule} strokeWidth={2} />
          {TICKS.map((g, gi) => {
            const end = gi < 3 ? TICKS[gi + 1].at : T_LOGO;
            const o = inOut(t, g.at + 0.2, end - 0.1, 0.4, 0.2);
            return (
              <g key={gi} opacity={o}>
                {g.ticks.map(([u, label]) => {
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
            );
          })}
        </g>

        {/* the logo's axes draw in once the line has become the S */}
        <g opacity={1 - lockOut}>
          <line x1={ux(110)} y1={uy(85)} x2={ux(110)} y2={lerp(uy(85), uy(35), axis)} stroke={C.nightMuted} strokeWidth={2 * S} strokeLinecap="round" opacity={axis > 0 ? 1 : 0} />
          <line x1={ux(110)} y1={uy(85)} x2={lerp(ux(110), ux(150), axis)} y2={uy(85)} stroke={C.nightMuted} strokeWidth={2 * S} strokeLinecap="round" opacity={axis > 0 ? 1 : 0} />
          <SignalPath pts={pts} draw={draw} color={C.signal} width={width} glow={1 - m4 * 0.7} tip={m4 === 0} />
        </g>
      </svg>

      {/* wordmark, as in images/brand/logo-light.svg */}
      <div style={{ position: "absolute", left: ux(165), top: uy(65) - 32 * S * 0.95, opacity: 1 - lockOut }}>
        <Rise at={T_LOGO + 0.75} dur={0.9}>
          <div style={{ fontFamily: FONT.logo, fontWeight: 400, fontSize: 32 * S, letterSpacing: 0.5 * S, color: C.nightInk, lineHeight: 1.05 }}>SUSTAINABILITY</div>
        </Rise>
        <Rise at={T_LOGO + 0.95} dur={0.9}>
          <div style={{ fontFamily: FONT.logo, fontWeight: 300, fontSize: 18 * S, letterSpacing: 3 * S, color: C.nightMuted, lineHeight: 1.05, marginTop: 2 }}>LAB</div>
        </Rise>
      </div>

      {/* tagline */}
      <div style={{ position: "absolute", left: ux(165), top: 660, opacity: 1 - lockOut }}>
        <Rise at={T_TAG} dur={0.8}>
          <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 46, color: C.nightInk, letterSpacing: "-0.01em" }}>{F.tagline}</div>
        </Rise>
        <Rise at={T_TAG + 0.35} dur={0.8}>
          <div style={{ fontFamily: FONT.mono, fontSize: 27, color: C.nightMuted, marginTop: 16, letterSpacing: "0.06em" }}>IIT GANDHINAGAR</div>
        </Rise>
      </div>
      {starts.map((s, i) => (
        <Sfx key={i} at={s} name="tick" volume={0.72} />
      ))}
      <Sfx at={T_LOGO + 0.25} name="shimmer" volume={0.36} />
      <Sfx at={HOOK_LEN - 0.75} name="whoosh" volume={0.33} />
      <BeatDebug />
    </AbsoluteFill>
  );
};

// set DEBUG_BEATS = true to flash a dot on every beat while timing a scene
const DEBUG_BEATS = false;
const BeatDebug: React.FC = () => {
  const t = useT();
  if (!DEBUG_BEATS) return null;
  const ph = (t % BEAT) / BEAT;
  return <div style={{ position: "absolute", right: 30, top: 30, width: 20, height: 20, borderRadius: 10, background: "#0f0", opacity: 1 - ph }} />;
};
