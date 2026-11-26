import React, { useMemo } from "react";
import filmer from "../../../data/filmer.json";
import wrfPng from "../../../data/filmer-wrf-t2.png";
import predPng from "../../../data/filmer-pred-t2.png";
import field from "../../../data/pm-field.json";
import fieldPng from "../../../data/pm-field.png";
import samachar from "../../../data/samachar.json";
import stations from "../../../data/stations.json";
import { IndiaMap } from "../../lib/IndiaMap";
import { E, lerp, pt, useT } from "../../lib/motion";
import { C, FONT } from "../../theme";

// Drawings for the clean-air slides, made from the film's data (data/*.json, data/*.png) exactly as the film
// draws them (src/scenes/Air.tsx). They hold no words: labels and sources are written in the slide file.
// Each is wrapped in <Layer>, which lets clicks through, so a drawing over a slide's words never stops the
// editor from picking those words.

const Layer: React.FC<{
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ style, children }) => (
  <div
    style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }}
  >
    {children}
  </div>
);

const VIEW = { lon0: 82.6, lat0: 22.2, k: 26.5, cx: 1345, cy: 586 };
const DELHI: [number, number] = [77.21, 28.61];
type Station = [number, number, number, number | null];

/** Colours of a legend ramp, left to right. */
export const RAMP = {
  pm: (field.stops as [number, string][])
    .filter(([v]) => v <= 100)
    .map(([, c]) => c),
  temp: (filmer.stops as [number, string][]).map(([, c]) => c),
};

/** A legend's colour bar. Put the numbers under it in the slide file. */
export const Ramp: React.FC<{ colors: string[]; width?: number }> = ({
  colors,
  width = 300,
}) => (
  <div
    style={{
      width,
      height: 14,
      background: `linear-gradient(90deg, ${colors.join(",")})`,
    }}
  />
);

/**
 * India with the CPCB's continuous monitoring stations. `draw`: when the outline draws on (omit: already drawn).
 * `dots`: when the stations appear, west to east by first year of data (omit: already there). `small`: the
 * stations shrink back so a layer on top can be read. `field`: when the 2024 PM2.5 field spreads out from Delhi.
 */
export const AirMap: React.FC<{
  draw?: number;
  dots?: number;
  small?: boolean;
  field?: number;
}> = ({ draw, dots, small, field: fieldAt }) => {
  const t = useT();
  const pts = useMemo(() => {
    const s = (stations as unknown as { pts: Station[] }).pts.slice();
    s.sort((a, c) => a[2] - c[2] || a[1] - c[1]);
    return s;
  }, []);
  const outline = draw === undefined ? 1 : pt(t, draw + 0.1, 1.1, E.inOut);
  const [dx, dy] = [
    VIEW.cx +
      (DELHI[0] - VIEW.lon0) * Math.cos((VIEW.lat0 * Math.PI) / 180) * VIEW.k,
    VIEW.cy - (DELHI[1] - VIEW.lat0) * VIEW.k,
  ];
  const r =
    fieldAt === undefined ? 0 : pt(t, fieldAt + 0.4, 1.6, E.inOut) * 1400;
  const shrink = small
    ? lerp(1, 0.62, fieldAt === undefined ? 1 : pt(t, fieldAt, 0.6))
    : 1;
  return (
    <Layer>
      <IndiaMap
        view={VIEW}
        stroke={C.ink}
        fill={C.soft}
        draw={outline}
        raster={
          fieldAt === undefined
            ? undefined
            : {
                url: fieldPng,
                bounds: field.bounds as [number, number, number, number],
                reveal: `circle(${r}px at ${dx}px ${dy}px)`,
                opacity: 0.95,
              }
        }
      >
        {(proj) =>
          pts.map(([lat, lon], i) => {
            const a =
              dots === undefined
                ? 1
                : pt(t, dots + 0.2 + (i / pts.length) * 2.4, 0.35, E.out);
            if (a <= 0) return null;
            const [x, y] = proj(lon, lat);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={4.6 * shrink * (a < 1 ? 1 + 0.6 * (1 - a) : 1)}
                fill={C.ink}
                opacity={a}
              />
            );
          })
        }
      </IndiaMap>
    </Layer>
  );
};

/** Eight sites for new monitors, picked greedily on the field (the sensor-placement idea), pulsing. */
export const NextSites: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT();
  return (
    <Layer>
      <IndiaMap view={VIEW} stroke="none" fill="none">
        {(proj) =>
          (field.next_sites as [number, number][]).map(([lat, lon], i) => {
            const a = pt(t, at + 0.45 + i * 0.16, 0.5);
            if (a <= 0) return null;
            const [x, y] = proj(lon, lat);
            const pulse = ((((t - at - i * 0.16) * 0.8) % 1) + 1) % 1;
            return (
              <g key={i} opacity={a}>
                <circle
                  cx={x}
                  cy={y}
                  r={14 + 26 * pulse}
                  fill="none"
                  stroke={C.red}
                  strokeWidth={2}
                  opacity={1 - pulse}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={13 * a}
                  fill={C.paper}
                  stroke={C.red}
                  strokeWidth={4}
                />
                <circle cx={x} cy={y} r={4.5} fill={C.red} />
              </g>
            );
          })
        }
      </IndiaMap>
    </Layer>
  );
};

/** WRF's 2 m temperature for a held-out morning, then FiLMeR's emulation sweeping in behind a red divider. */
export const FilmerMap: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT();
  const on = pt(t, at - 0.2, 0.7);
  const sweep = pt(t, at + 0.9, 1.7, E.inOut);
  const bounds = filmer.bounds as [number, number, number, number];
  const x = lerp(983, 1707, sweep);
  return (
    <Layer style={{ opacity: on }}>
      <IndiaMap
        view={VIEW}
        stroke={C.ink}
        fill={C.soft}
        raster={{ url: wrfPng, bounds, reveal: "inset(0 0 0 0)", opacity: 1 }}
      />
      <IndiaMap
        view={VIEW}
        stroke={C.ink}
        fill="none"
        raster={{
          url: predPng,
          bounds,
          reveal: `inset(0 ${(1 - sweep) * 100}% 0 0)`,
          opacity: 1,
        }}
      />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <line
          x1={x}
          x2={x}
          y1={190}
          y2={960}
          stroke={C.red}
          strokeWidth={4}
          opacity={sweep > 0 && sweep < 1 ? 1 : 0}
        />
      </svg>
    </Layer>
  );
};

/** Delhi's air-quality articles a week (black) against its PM2.5 a week (pink), 2010–2021, redrawn from Samachar Fig. 5. */
export const NewsChart: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const t = useT();
  const draw = pt(t, at + 0.3, 2.0, E.inOut);
  const X0 = 930,
    X1 = 1790,
    Y0 = 820,
    Y1 = 330;
  const y0 = 2010,
    y1 = 2021.5;
  const px = (yr: number) => X0 + ((yr - y0) / (y1 - y0)) * (X1 - X0);
  const pp = (v: number) => Y0 - (v / 450) * (Y0 - Y1); // PM2.5, 0–450 µg/m³
  const pa = (v: number) => Y0 - (v / 100) * (Y0 - Y1); // articles, 0–100 a week
  const line = (pts: number[][], f: (v: number) => number) =>
    pts
      .map(
        ([yr, v], i) =>
          `${i ? "L" : "M"}${px(yr).toFixed(1)},${f(v).toFixed(1)}`,
      )
      .join("");
  const S = samachar as unknown as {
    pm25: number[][];
    articles: number[][];
    limit: number;
  };
  return (
    <svg
      width={1920}
      height={1080}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: pt(t, at - 0.1, 0.5),
      }}
    >
      <defs>
        <clipPath id="newsdraw">
          <rect
            x={X0}
            y={Y1 - 20}
            width={(X1 - X0) * draw}
            height={Y0 - Y1 + 40}
          />
        </clipPath>
      </defs>
      <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke={C.rule} strokeWidth={2} />
      <line
        x1={X0}
        x2={X1}
        y1={pp(S.limit)}
        y2={pp(S.limit)}
        stroke={C.red}
        strokeWidth={2}
        strokeDasharray="8 7"
        opacity={0.7}
      />
      <g clipPath="url(#newsdraw)">
        <path
          d={line(S.pm25, pp)}
          fill="none"
          stroke={C.pink}
          strokeWidth={2.6}
        />
        <path
          d={line(S.articles, pa)}
          fill="none"
          stroke={C.ink}
          strokeWidth={2.6}
        />
      </g>
      {[2010, 2012, 2014, 2016, 2018, 2020].map((yr) => (
        <text
          key={yr}
          x={px(yr)}
          y={Y0 + 34}
          fill={C.muted}
          fontFamily={FONT.mono}
          fontSize={20}
          textAnchor="middle"
        >
          {yr}
        </text>
      ))}
    </svg>
  );
};

/** VayuChat's window: a frame that wipes open, with a header row. Put its words inside, in the slide file. */
export const ChatWindow: React.FC<{
  at?: number;
  head: React.ReactNode;
  children: React.ReactNode;
}> = ({ at = 0, head, children }) => {
  const t = useT();
  const on = pt(t, at - 0.1, 0.6, E.inOut);
  return (
    <div
      style={{
        position: "absolute",
        left: 900,
        top: 170,
        width: 900,
        height: 800,
        background: C.paper,
        border: `2px solid ${C.ink}`,
        clipPath: on < 1 ? `inset(0 ${(1 - on) * 100}% 0 0)` : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 30px",
          borderBottom: `1px solid ${C.rule}`,
        }}
      >
        {head}
      </div>
      <div
        style={{
          padding: "30px 30px 0",
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {children}
      </div>
    </div>
  );
};
