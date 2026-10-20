import React, { useMemo } from "react";
import { Sfx } from "../lib/sfx";
import { AbsoluteFill } from "remotion";
import stations from "../../data/stations.json";
import field from "../../data/pm-field.json";
import { beat, chapter, F } from "../data";
import { BeatText, Chapter, Reveal } from "../lib/chapter";
import { IndiaMap } from "../lib/IndiaMap";
import { Appear, E, inOut, lerp, pt, Rise, Typed, useT } from "../lib/motion";
import { C, FONT, M } from "../theme";
import { BAR } from "../timing";

export const AIR_LEN = 10 * BAR;

const DELHI: [number, number] = [77.21, 28.61];
const VIEW = { lon0: 82.6, lat0: 22.2, k: 26.5, cx: 1345, cy: 586 };

// beat timings (s from chapter start)
// beats land on bars of the score (2 s); the field arrives with the strings at bar 16
const T = { dock: 3.55, st: 3.95, fi: 7.6, pl: 9.9, ad: 12.0, vc: 14.9 };

type Station = [number, number, number, number | null];

export const Air: React.FC = () => {
  const t = useT();
  const ch = chapter("air");
  const b = (id: string) => beat("air", id);
  const pts = useMemo(() => {
    const s = (stations as unknown as { pts: Station[] }).pts.slice();
    // reveal in order of first year of data, west to east within a year
    s.sort((a, c) => a[2] - c[2] || a[1] - c[1]);
    return s;
  }, []);

  // the map zooms towards Delhi and fades as the bus photo arrives
  const z = pt(t, T.ad - 0.55, 0.9, E.in);
  const drift = 1 + 0.035 * pt(t, T.dock, AIR_LEN - T.dock, E.linear); // a slow push-in keeps the map alive
  const view = { ...VIEW, lon0: lerp(VIEW.lon0, DELHI[0], z), lat0: lerp(VIEW.lat0, DELHI[1], z), k: lerp(VIEW.k * drift, 150, z) };
  const mapOn = pt(t, T.dock + 0.1, 1.1, E.inOut);
  const mapFade = 1 - pt(t, T.ad - 0.3, 0.4);
  const fieldR = pt(t, T.fi + 0.4, 1.6, E.inOut) * 1400;
  const [dx, dy] = [VIEW.cx + (DELHI[0] - VIEW.lon0) * Math.cos((VIEW.lat0 * Math.PI) / 180) * VIEW.k, VIEW.cy - (DELHI[1] - VIEW.lat0) * VIEW.k];

  const top = F.dec2024.slice(0, 5);
  const maxv = top[0]?.[1] ?? 1;

  return (
    <Chapter num={1} name={ch.name} headline={ch.headline} tone="light" len={AIR_LEN} dock={T.dock}>
      <AbsoluteFill style={{ opacity: mapFade }}>
        <IndiaMap
          view={view}
          stroke={C.ink}
          fill={C.soft}
          draw={mapOn}
          raster={{ src: "img/geo/pm-field.png", bounds: field.bounds as [number, number, number, number], reveal: `circle(${fieldR}px at ${dx}px ${dy}px)`, opacity: 0.95 }}
        >
          {(proj) => (
            <>
              {pts.map(([lat, lon], i) => {
                const a = pt(t, T.st + 0.2 + (i / pts.length) * 2.4, 0.35, E.out);
                if (a <= 0) return null;
                const [x, y] = proj(lon, lat);
                const shrink = lerp(1, 0.62, pt(t, T.fi, 0.6));
                return <circle key={i} cx={x} cy={y} r={4.6 * shrink * (a < 1 ? 1 + 0.6 * (1 - a) : 1)} fill={C.ink} opacity={a} />;
              })}
              {(field.next_sites as [number, number][]).map(([lat, lon], i) => {
                const a = pt(t, T.pl + 0.45 + i * 0.16, 0.5);
                if (a <= 0) return null;
                const [x, y] = proj(lon, lat);
                const pulse = ((t - T.pl - i * 0.16) * 0.8) % 1;
                return (
                  <g key={`n${i}`} opacity={a}>
                    <circle cx={x} cy={y} r={14 + 26 * pulse} fill="none" stroke={C.red} strokeWidth={2} opacity={1 - pulse} />
                    <circle cx={x} cy={y} r={13 * a} fill={C.paper} stroke={C.red} strokeWidth={4} />
                    <circle cx={x} cy={y} r={4.5} fill={C.red} />
                  </g>
                );
              })}
            </>
          )}
        </IndiaMap>

        {/* legend for the field */}
        <div style={{ position: "absolute", left: 1500, top: 170, width: 300, opacity: inOut(t, T.fi + 0.8, T.ad - 0.3) }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 20, color: C.muted, marginBottom: 10 }}>PM2.5 · {field.year} mean · µg/m³</div>
          <div style={{ height: 14, background: `linear-gradient(90deg, ${(field.stops as [number, string][]).filter(([v]) => v <= 100).map(([, c]) => c).join(",")})` }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.mono, fontSize: 19, color: C.muted, marginTop: 6 }}>
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </AbsoluteFill>

      <Sfx at={T.st + 0.2} name="rain_short" volume={0.55} />
      <Sfx at={T.fi + 0.4 - 1.8} name="swell" volume={0.2} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Sfx key={i} at={T.pl + 0.45 + i * 0.16} name="ping" volume={0.22} />
      ))}
      <Sfx at={T.ad - 0.45} name="whoosh" volume={0.42} />
      <BeatText tone="light" at={T.st} out={T.fi - 0.42} title={b("stations").title} tag={b("stations").tag} />
      <BeatText tone="light" at={T.fi} out={T.ad - 0.42} title={b("field").title} tag={b("field").tag} />
      <BeatText tone="light" at={T.ad} out={T.vc - 0.42} title={b("airdelhi").title} tag={b("airdelhi").tag} />
      <BeatText tone="light" at={T.vc} title={b("vayuchat").title} tag={b("vayuchat").tag} />

      {/* AirDelhi: the sensor on a bus, and the street-level map from the paper */}
      <Reveal src={F.img.bus} at={T.ad - 0.3} out={T.vc - 0.25} x={900} y={170} w={600} h={800} pos="40% 50%" />
      <Reveal src={F.img.airdelhi} at={T.ad + 0.15} out={T.vc - 0.2} x={1530} y={330} w={270} h={480} pos="88% 50%" bg={C.paper} from="bottom" />
      <div style={{ position: "absolute", left: 1530, top: 822, width: 270, fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.3, color: C.muted, opacity: inOut(t, T.ad + 0.8, T.vc - 0.3) }}>
        PM2.5 along bus routes, Delhi
      </div>

      {/* VayuChat: a question, the code the agent writes, the answer */}
      <VayuChat at={T.vc + 0.05} question={b("vayuchat").question ?? ""} top={top} maxv={maxv} />
    </Chapter>
  );
};

const VayuChat: React.FC<{ at: number; question: string; top: [string, number][]; maxv: number }> = ({ at, question, top, maxv }) => {
  const t = useT();
  const on = pt(t, at - 0.1, 0.6, E.inOut);
  const tq = at + 0.35;
  const tc = tq + question.length / 62 + 0.25;
  const ta = tc + 0.5;
  const [first, second] = top;
  const sfx = (
    <>
      <Sfx at={tq} name="typing" volume={0.75} />
      <Sfx at={tc} name="typing_fast" volume={0.5} />
      <Sfx at={ta} name="blip" volume={0.34} />
    </>
  );
  return (
    <div style={{ position: "absolute", left: 900, top: 170, width: 900, height: 800, background: C.paper, border: `2px solid ${C.ink}`, clipPath: `inset(0 ${(1 - on) * 100}% 0 0)` }}>
      {sfx}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 30px", borderBottom: `1px solid ${C.rule}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.body, fontWeight: 700, fontSize: 28, color: C.ink }}>
          <span style={{ width: 12, height: 12, background: C.red }} />
          VayuChat
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 20, color: C.muted }}>CPCB data · LLM agent</div>
      </div>
      <div style={{ padding: "30px 30px 0" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: C.soft, padding: "16px 22px", maxWidth: 640, fontFamily: FONT.body, fontSize: 30, lineHeight: 1.3, color: C.ink, opacity: pt(t, tq - 0.2, 0.3) }}>
            <Typed text={question} at={tq} cps={62} />
          </div>
        </div>
        <div style={{ marginTop: 26, background: C.ink, color: "#e9ebe4", padding: "16px 22px", fontFamily: FONT.mono, fontSize: 22, lineHeight: 1.5, whiteSpace: "nowrap", opacity: pt(t, tc - 0.15, 0.3) }}>
          <Typed text={'df[df.month == "2024-12"].groupby("city").pm25.mean()'} at={tc} cps={150} cursor={C.signal} />
        </div>
        <Appear at={ta} dy={14}>
          <div style={{ marginTop: 28, fontFamily: FONT.body, fontSize: 30, lineHeight: 1.35, color: C.ink }}>
            <b>{first?.[0]}, Assam</b> had the worst air: {Math.round(first?.[1] ?? 0)} µg/m³, ahead of {second?.[0]} at {Math.round(second?.[1] ?? 0)}.
          </div>
        </Appear>
        <div style={{ marginTop: 24 }}>
          {top.map(([city, v], i) => {
            const a = pt(t, ta + 0.25 + i * 0.1, 0.8, E.out);
            return (
              <div key={city} style={{ display: "grid", gridTemplateColumns: "190px 1fr 70px", alignItems: "center", gap: 14, height: 36, opacity: a > 0 ? 1 : 0 }}>
                <span style={{ fontFamily: FONT.body, fontSize: 22, color: C.ink }}>{city}</span>
                <span style={{ height: 18, background: i === 0 ? C.red : C.muted, width: `${(v / maxv) * 100 * a}%` }} />
                <span style={{ fontFamily: FONT.mono, fontSize: 20, color: C.muted, textAlign: "right" }}>{Math.round(v * a)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
