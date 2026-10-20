import React, { useLayoutEffect, useRef } from "react";
import { globe, isFront, ortho } from "./geo";
import { W, H } from "../theme";

type Props = {
  rotLon: number;
  rotLat: number;
  r: number;
  cx: number;
  cy: number;
  land: string; // dot colour
  india: string; // highlighted dots
  indiaMix?: number; // 0..1 how strongly India stands out
  dot?: number; // dot radius at the centre of the disc
  outline?: string;
  opacity?: number;
};

/** An orthographic globe made of evenly spaced land dots, drawn on canvas. */
export const DotGlobe: React.FC<Props> = ({ rotLon, rotLat, r, cx, cy, land, india, indiaMix = 1, dot = 1.9, outline, opacity = 1 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, W, H);
    const proj = ortho(rotLon, rotLat, r, cx, cy);
    if (outline) {
      g.strokeStyle = outline;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
    }
    const lam0 = (rotLon * Math.PI) / 180;
    const phi0 = (rotLat * Math.PI) / 180;
    const sp0 = Math.sin(phi0);
    const cp0 = Math.cos(phi0);
    for (const [lat, lon, ind] of globe) {
      // cosine of the angle from the view centre: >0 means the dot faces us
      const phi = (lat * Math.PI) / 180;
      const lam = (lon * Math.PI) / 180;
      const cosc = sp0 * Math.sin(phi) + cp0 * Math.cos(phi) * Math.cos(lam - lam0);
      if (cosc <= 0.02) continue;
      const p = proj([lon, lat]);
      if (!p) continue;
      const s = dot * (0.45 + 0.55 * Math.sqrt(cosc)) * (r / 420);
      const isInd = ind === 1 && indiaMix > 0;
      g.globalAlpha = (0.35 + 0.65 * cosc) * (isInd ? 1 : 0.75);
      g.fillStyle = isInd ? india : land;
      g.beginPath();
      g.arc(p[0], p[1], isInd ? s * (1 + 0.25 * indiaMix) : s, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }, [rotLon, rotLat, r, cx, cy, land, india, indiaMix, dot, outline]);
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0, opacity }} />;
};

export { isFront };
