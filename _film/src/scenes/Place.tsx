import React from "react";
import { Sfx } from "../lib/sfx";
import { AbsoluteFill } from "remotion";
import { F } from "../data";
import { DotGlobe } from "../lib/DotGlobe";
import { GN, ortho } from "../lib/geo";
import { Appear, E, Kicker, lerp, pt, Rise, useT, Words } from "../lib/motion";
import { C, FONT, H, M, W } from "../theme";
import { BAR } from "../timing";

export const PLACE_LEN = 4 * BAR;

// The globe turns from the Atlantic to India and settles on Gandhinagar.
export const Place: React.FC = () => {
  const t = useT();
  const spin = pt(t, 0, 3.6, E.inOut);
  const rotLon = lerp(-38, GN[0] - 9, spin) + 0.6 * Math.max(0, t - 3.6); // keeps turning, slowly
  const rotLat = lerp(8, GN[1] - 4, spin);
  const r = lerp(330, 470, pt(t, 0, 4.2, E.inOut));
  const cx = lerp(W / 2, 1350, pt(t, 0.4, 3.2, E.inOut));
  const cy = 548;
  const fadeIn = pt(t, 0, 0.9);
  const out = pt(t, PLACE_LEN - 0.55, 0.5, E.in);

  const proj = ortho(rotLon, rotLat, r, cx, cy);
  const p = proj(GN) ?? [cx, cy];
  const pin = pt(t, 2.6, 0.6);
  const pulse = (t * 0.9) % 1;

  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Sfx at={0.15} name="whoosh" volume={0.36} />
      <Sfx at={2.6} name="ping" volume={0.46} />
      <div style={{ position: "absolute", inset: 0, opacity: fadeIn * (1 - out), transform: `scale(${1 + 0.05 * out})` }}>
        <DotGlobe rotLon={rotLon} rotLat={rotLat} r={r} cx={cx} cy={cy} land="#7d867d" india={C.nightInk} indiaMix={pt(t, 1.8, 1.2)} outline={C.nightRule} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <g opacity={pin}>
            {[0, 0.5].map((o) => {
              const k = (pulse + o) % 1;
              return <circle key={o} cx={p[0]} cy={p[1]} r={8 + 46 * k} fill="none" stroke={C.signal} strokeWidth={2} opacity={1 - k} />;
            })}
            <circle cx={p[0]} cy={p[1]} r={9} fill={C.signal} />
            <line x1={p[0]} y1={p[1]} x2={p[0] - 120} y2={p[1] - 120} stroke={C.nightMuted} strokeWidth={1.5} />
            <text x={p[0] - 128} y={p[1] - 132} fill={C.nightInk} fontFamily={FONT.mono} fontSize={24} textAnchor="end" letterSpacing="0.06em">
              GANDHINAGAR
            </text>
          </g>
        </svg>
      </div>

      <div style={{ position: "absolute", left: M, top: 300, width: 720, opacity: 1 - out }}>
        <Appear at={1.2}>
          <Kicker color={C.nightMuted} square={C.signal} size={24}>
            {F.place.kicker}
          </Kicker>
        </Appear>
        <Rise at={1.45} style={{ marginTop: 18 }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 26, color: C.nightMuted, letterSpacing: "0.04em" }}>{F.place.coords}</div>
        </Rise>
        <Words
          text={F.place.statement}
          at={2.3}
          stagger={0.05}
          style={{ marginTop: 46, fontFamily: FONT.body, fontWeight: 500, fontSize: 54, lineHeight: 1.18, letterSpacing: "-0.015em", color: C.nightInk }}
        />
        <Words text={F.place.coda} at={4.6} stagger={0.06} style={{ marginTop: 26, fontFamily: FONT.body, fontWeight: 500, fontSize: 54, lineHeight: 1.18, color: C.signal }} />
      </div>
    </AbsoluteFill>
  );
};
