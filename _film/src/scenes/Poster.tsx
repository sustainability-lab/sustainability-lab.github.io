import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill } from "remotion";
import kilns from "../../data/kilns.json";
import { F } from "../data";
import { flat, indiaRings, ringsPath } from "../lib/geo";
import { sigmoidPts, SignalPath } from "../lib/signal";
import { C, FONT, H, M, W, DPR } from "../theme";

const K = kilns as unknown as { n: number; pts: [number, number, number][] };
const VIEW = { lon0: 81.6, lat0: 26.4, k: 68, cx: 1330, cy: 560 };

/**
 * Still frames: `full` (YouTube thumbnail) has the mark and headline; `web` is text-free for the
 * homepage, where the page already carries the headline and the player adds its own button.
 */
export const Poster: React.FC<{ variant?: "full" | "web" }> = ({ variant = "full" }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const web = variant === "web";
  const proj = useMemo(() => flat(web ? { lon0: 83.4, lat0: 25.6, k: 78, cx: 1010, cy: 500 } : VIEW), [web]);
  useLayoutEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";
    g.fillStyle = "rgba(230, 72, 60, 0.6)";
    for (const [lat, lon] of K.pts) {
      const [x, y] = proj(lon, lat);
      g.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
    }
  }, [proj]);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={ringsPath(indiaRings, proj)} fill={C.nightSoft} stroke={C.nightRule} strokeWidth={2} />
      </svg>
      <canvas ref={ref} width={W * DPR} height={H * DPR} style={{ position: "absolute", inset: 0, width: W, height: H, filter: "drop-shadow(0 0 6px rgba(230,72,60,.45))" }} />
      {web ? (
        <div style={{ position: "absolute", right: M, top: 70, fontFamily: FONT.mono, fontSize: 30, color: C.nightMuted, textAlign: "right" }}>
          {K.n.toLocaleString("en-US")} brick kilns, found from space
        </div>
      ) : (
        <Full />
      )}
    </AbsoluteFill>
  );
};

const Full: React.FC = () => {
  const S = 2.2;
  const cx = M + 30 * S;
  const cy = 160;
  const mark = useMemo(() => sigmoidPts(cx, cy, S, 160), [cx]);
  const ux = (u: number) => cx + (u - 120) * S;
  const uy = (u: number) => cy + (u - 60) * S;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${C.night} 0%, ${C.night} 34%, rgba(21,24,22,0) 62%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={ux(110)} y1={uy(85)} x2={ux(110)} y2={uy(35)} stroke={C.nightMuted} strokeWidth={2 * S} strokeLinecap="round" />
        <line x1={ux(110)} y1={uy(85)} x2={ux(150)} y2={uy(85)} stroke={C.nightMuted} strokeWidth={2 * S} strokeLinecap="round" />
        <SignalPath pts={mark} color={C.signal} width={3.5 * S} tip={false} />
      </svg>
      <div style={{ position: "absolute", left: ux(165), top: uy(65) - 32 * S * 0.95, fontFamily: FONT.logo, color: C.nightInk, lineHeight: 1.05 }}>
        <div style={{ fontSize: 32 * S, letterSpacing: 0.5 * S }}>SUSTAINABILITY</div>
        <div style={{ fontSize: 18 * S, fontWeight: 300, letterSpacing: 3 * S, color: C.nightMuted }}>LAB</div>
      </div>
      <div style={{ position: "absolute", left: M, top: 350, width: 820, fontFamily: FONT.head, fontWeight: 700, fontSize: 112, lineHeight: 1, letterSpacing: "-0.05em", color: C.nightInk }}>
        AI for a sustainable future.
      </div>
      <div style={{ position: "absolute", left: M, top: 740, display: "flex", alignItems: "center", gap: 16, fontFamily: FONT.mono, fontSize: 30, color: C.nightMuted, letterSpacing: "0.02em" }}>
        <span style={{ width: 14, height: 14, background: C.signal }} />
        IIT Gandhinagar · {F.edition}
      </div>
      <div style={{ position: "absolute", right: M, bottom: 70, fontFamily: FONT.mono, fontSize: 22, color: C.nightMuted, textAlign: "right" }}>
        {K.n.toLocaleString("en-US")} brick kilns found from space · SentinelKilnDB
      </div>
    </>
  );
};
