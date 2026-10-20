import React from "react";
import { Img, staticFile } from "remotion";
import { Flat, flat, indiaRings, ringsPath } from "./geo";
import { W, H } from "../theme";

export type Proj = (lon: number, lat: number) => [number, number];

/** India (Survey of India outline) in a flat projection, with optional raster and any SVG layers. */
export const IndiaMap: React.FC<{
  view: Flat;
  stroke: string;
  fill: string;
  draw?: number; // outline draw-on 0..1
  opacity?: number;
  raster?: { src: string; bounds: [number, number, number, number]; reveal: string; opacity?: number };
  children?: (proj: Proj) => React.ReactNode;
  under?: (proj: Proj) => React.ReactNode;
}> = ({ view, stroke, fill, draw = 1, opacity = 1, raster, children, under }) => {
  const proj = flat(view);
  const d = ringsPath(indiaRings, proj);
  let rasterEl: React.ReactNode = null;
  if (raster) {
    const [x0, y0, x1, y1] = raster.bounds;
    const [px0, py0] = proj(x0, y1);
    const [px1, py1] = proj(x1, y0);
    rasterEl = (
      <div style={{ position: "absolute", inset: 0, clipPath: `path('${d}')`, opacity: raster.opacity ?? 1 }}>
        <div style={{ position: "absolute", inset: 0, clipPath: raster.reveal }}>
          <Img src={staticFile(raster.src)} style={{ position: "absolute", left: px0, top: py0, width: px1 - px0, height: py1 - py0 }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={d} fill={fill} opacity={draw} />
        {under?.(proj)}
      </svg>
      {rasterEl}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={d} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        {children?.(proj)}
      </svg>
    </div>
  );
};
