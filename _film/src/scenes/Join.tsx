import React, { useMemo } from "react";
import { Sfx } from "../lib/sfx";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { F } from "../data";
import { Appear, E, lerp, pt, Rise, useT, Words } from "../lib/motion";
import { sigmoidPts, SignalPath } from "../lib/signal";
import { C, FONT, H, M, W } from "../theme";
import { BAR } from "../timing";

export const JOIN_LEN = 6 * BAR;

const T_END = 3.5 * BAR; // the closing lockup

export const Join: React.FC = () => {
  const t = useT();
  const toEnd = pt(t, T_END, 0.7, E.inOut);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {F.join.roles.map((_, i) => (
        <Sfx key={i} at={0.5 + i * 0.12} name="tick" volume={0.45} />
      ))}
      <Sfx at={T_END + 0.35} name="shimmer" volume={0.2} />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - toEnd }}>
        <Words text={F.join.title} at={0.05} stagger={0.08} style={{ position: "absolute", left: M - 8, top: 96, fontFamily: FONT.head, fontWeight: 700, fontSize: 250, letterSpacing: "-0.06em", lineHeight: 0.9, color: C.ink }} />
        <div style={{ position: "absolute", left: M, top: 400, display: "flex", gap: 46 }}>
          {F.join.roles.map((r, i) => (
            <Rise key={r} at={0.5 + i * 0.12}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT.body, fontWeight: 600, fontSize: 40, color: C.ink }}>
                <span style={{ width: 16, height: 16, background: C.red }} />
                {r}
              </div>
            </Rise>
          ))}
        </div>
        <Appear at={1.1} style={{ position: "absolute", left: M, top: 500, width: 1020 }}>
          <div style={{ fontFamily: FONT.body, fontSize: 38, lineHeight: 1.35, color: C.muted }}>{F.join.text}</div>
        </Appear>
        <Rise at={1.6} style={{ position: "absolute", left: M, top: 690 }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 40, color: C.red }}>{F.url}/join</div>
        </Rise>
        <Appear at={1.4} style={{ position: "absolute", right: M, top: 400 }}>
          <div style={{ border: `2px solid ${C.ink}`, padding: 22, background: "#fff" }}>
            <Img src={staticFile("img/qr-join.svg")} style={{ width: 236, height: 236, display: "block" }} />
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 20, color: C.muted, marginTop: 12, textAlign: "center" }}>Scan to apply</div>
        </Appear>
        <div style={{ position: "absolute", left: M, right: M, top: 840, borderTop: `1px solid ${C.rule}`, paddingTop: 26, opacity: pt(t, 2.0, 0.6) }}>
          <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 20, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 18 }}>Supported by</div>
          <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
            {F.funders.map((f, i) => (
              <Img key={f} src={staticFile(f)} style={{ height: 52, maxWidth: 150, objectFit: "contain", opacity: pt(t, 2.1 + i * 0.07, 0.4) }} />
            ))}
          </div>
        </div>
      </div>
      <EndCard at={T_END} />
    </AbsoluteFill>
  );
};

/** The closing lockup: the red sigmoid draws, the wordmark follows, then a quiet hold. */
const EndCard: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const S = 3.4;
  const left = (W - 1080) / 2;
  const cx = left + 30 * S;
  const cy = 470;
  const ux = (u: number) => cx + (u - 120) * S;
  const uy = (u: number) => cy + (u - 60) * S;
  const pts = useMemo(() => sigmoidPts(cx, cy, S, 200), [cx]);
  const draw = pt(t, at + 0.35, 1.1, E.inOut);
  const axis = pt(t, at + 0.2, 0.8, E.inOut);
  if (t < at) return null;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={ux(110)} y1={uy(85)} x2={ux(110)} y2={lerp(uy(85), uy(35), axis)} stroke="#444444" strokeWidth={2 * S} strokeLinecap="round" />
        <line x1={ux(110)} y1={uy(85)} x2={lerp(ux(110), ux(150), axis)} y2={uy(85)} stroke="#444444" strokeWidth={2 * S} strokeLinecap="round" />
        <SignalPath pts={pts} draw={draw} color={C.red} width={3.5 * S} tip={false} />
      </svg>
      <div style={{ position: "absolute", left: ux(165), top: uy(65) - 32 * S * 0.95 }}>
        <Rise at={at + 0.7} dur={0.9}>
          <div style={{ fontFamily: FONT.logo, fontWeight: 400, fontSize: 32 * S, letterSpacing: 0.5 * S, color: "#111111", lineHeight: 1.05 }}>SUSTAINABILITY</div>
        </Rise>
        <Rise at={at + 0.9} dur={0.9}>
          <div style={{ fontFamily: FONT.logo, fontWeight: 300, fontSize: 18 * S, letterSpacing: 3 * S, color: "#555555", lineHeight: 1.05, marginTop: 2 }}>LAB</div>
        </Rise>
      </div>
      <div style={{ position: "absolute", left: ux(165), top: 650 }}>
        <Rise at={at + 1.3}>
          <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 40, color: C.ink }}>IIT Gandhinagar</div>
        </Rise>
        <Rise at={at + 1.5} style={{ marginTop: 10 }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 28, color: C.red }}>{F.url}</div>
        </Rise>
      </div>
      <div style={{ position: "absolute", right: M, bottom: 56, fontFamily: FONT.mono, fontSize: 19, color: C.muted, opacity: pt(t, at + 2.0, 0.6) }}>{F.edition} edition</div>
    </AbsoluteFill>
  );
};
