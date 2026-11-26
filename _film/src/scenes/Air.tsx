import React, { useMemo } from "react";
import { Sfx } from "../lib/sfx";
import { AbsoluteFill } from "remotion";
import stations from "../../data/stations.json";
import field from "../../data/pm-field.json";
import filmer from "../../data/filmer.json";
import samachar from "../../data/samachar.json";
import { beat, chapter, F } from "../data";
import { BeatText, Chapter, Finding, Reveal } from "../lib/chapter";
import { IndiaMap } from "../lib/IndiaMap";
import { Appear, E, inOut, lerp, pt, Rise, Typed, useT } from "../lib/motion";
import { C, FONT, M } from "../theme";
import { BAR } from "../timing";

export const AIR_LEN = 32 * BAR;

const DELHI: [number, number] = [77.21, 28.61];
const VIEW = { lon0: 82.6, lat0: 22.2, k: 26.5, cx: 1345, cy: 586 };

// beat timings (s from chapter start)
// beats land on bars of the score (2 s); the field arrives with the strings at bar 16.
// The strings' four-bar phrase plays twice (18–26 s), which makes room for FiLMeR and the news beat.
const T = { dock: 3.55, st: 3.95, fi: 14.0, pl: 18.0, ad: 30.0, fm: 38.0, tk: 48.0, vc: 56.0 };

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
      <Finding tone="light" at={T.st + 4.0} out={T.fi} f={b("stations").finding} />
      <Finding tone="light" at={T.fi + 3.5} out={T.ad} f={b("field").finding} />
      <Finding tone="light" at={T.ad + 3.5} out={T.fm} f={b("airdelhi").finding} />
      <Finding tone="light" at={T.tk + 2.6} out={T.vc} f={b("talk").finding} top={724} />
      <BeatText tone="light" at={T.fi} out={T.ad - 0.42} title={b("field").title} tag={b("field").tag} />
      <BeatText tone="light" at={T.ad} out={T.fm - 0.42} title={b("airdelhi").title} tag={b("airdelhi").tag} />
      <BeatText tone="light" at={T.fm} out={T.tk - 0.42} title={b("filmer").title} text={b("filmer").text} tag={b("filmer").tag} isNew={b("filmer").new} />
      <BeatText tone="light" at={T.tk} out={T.vc - 0.42} title={b("talk").title} text={b("talk").text} tag={b("talk").tag} />
      <BeatText tone="light" at={T.vc} title={b("vayuchat").title} tag={b("vayuchat").tag} />

      {/* AirDelhi: the sensor on a bus, and the street-level map from the paper */}
      <Reveal src={F.img.bus} at={T.ad - 0.3} out={T.fm - 0.3} x={900} y={170} w={600} h={800} pos="40% 50%" />
      <Reveal src={F.img.airdelhi} at={T.ad + 0.15} out={T.fm - 0.3} x={1530} y={330} w={270} h={480} pos="88% 50%" bg={C.paper} from="bottom" />
      <div style={{ position: "absolute", left: 1530, top: 822, width: 270, fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.3, color: C.muted, opacity: inOut(t, T.ad + 0.8, T.fm - 0.4) }}>
        PM2.5 along bus routes, Delhi
      </div>

      <Filmer at={T.fm} out={T.tk} />
      <Talk at={T.tk} out={T.vc} />

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

/** FiLMeR: WRF's 2 m temperature for one held-out morning, a red divider that swaps in FiLMeR's emulation,
 *  then the cost of a 10-day forecast, to scale. Maps: scripts/filmer_layer.py; timings: the paper's Table 14. */
const Filmer: React.FC<{ at: number; out: number }> = ({ at, out }) => {
  const t = useT();
  if (t < at - 0.5 || t > out + 0.5) return null;
  const race = at + 4.0;
  const mapOn = inOut(t, at - 0.2, out - 0.3, 0.7, 0.45);
  const sweep = pt(t, at + 0.9, 1.7, E.inOut);
  const bounds = filmer.bounds as [number, number, number, number];
  const ramp = (filmer.stops as [number, string][]).map(([, c]) => c).join(",");
  const raster = (src: string, reveal: string) => ({ src, bounds, reveal, opacity: 1 });
  const x = lerp(983, 1707, sweep);
  return (
    <>
      <AbsoluteFill style={{ opacity: mapOn }}>
        <IndiaMap view={VIEW} stroke={C.ink} fill={C.soft} raster={raster("img/geo/filmer-wrf-t2.png", "inset(0 0 0 0)")} />
        <IndiaMap view={VIEW} stroke={C.ink} fill="none" raster={raster("img/geo/filmer-pred-t2.png", `inset(0 ${(1 - sweep) * 100}% 0 0)`)} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <line x1={x} x2={x} y1={190} y2={960} stroke={C.red} strokeWidth={4} opacity={sweep > 0 && sweep < 1 ? 1 : 0} />
        </svg>
        <div style={{ position: "absolute", left: 1500, top: 170, width: 300, fontFamily: FONT.mono, fontSize: 20, color: C.muted }}>
          <div style={{ marginBottom: 10 }}>2 m temperature · °C</div>
          <div style={{ height: 14, background: `linear-gradient(90deg, ${ramp})` }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 19 }}>
            <span>−20</span>
            <span>8</span>
            <span>35</span>
          </div>
          <div style={{ marginTop: 18, lineHeight: 1.35 }}>1 Jan 2025, 11:30 IST · held out</div>
          <div style={{ marginTop: 18, lineHeight: 1.35, color: C.red, opacity: pt(t, at + 2.4, 0.4) }}>
            Typical error over India: {filmer.india.mae.toFixed(1)} °C
          </div>
        </div>
        <div style={{ position: "absolute", left: 900, top: 880, fontFamily: FONT.body, fontWeight: 700, fontSize: 30, color: C.ink, opacity: 1 - pt(t, at + 0.9, 0.5) }}>WRF</div>
        <div style={{ position: "absolute", left: 900, top: 880, fontFamily: FONT.body, fontWeight: 700, fontSize: 30, color: C.red, opacity: pt(t, at + 2.4, 0.4) }}>FiLMeR</div>
      </AbsoluteFill>
      <Race at={race} out={out} />
      <Sfx at={at + 0.9} name="whoosh" volume={0.3} />
    </>
  );
};

/** The cost of one 10-day forecast, to scale, in the left column's FINDING slot (the map stays on the right). */
const Race: React.FC<{ at: number; out: number }> = ({ at, out }) => {
  const t = useT();
  const on = inOut(t, at, out - 0.25, 0.4, 0.35);
  if (on <= 0) return null;
  const stages: [number, string][] = [[41, C.muted], [28, C.muted], [212, C.ink]];
  const total = 281;
  const shown = pt(t, at + 0.3, 1.3, E.inOut) * total;
  let acc = 0;
  const row = (label: string, col: string, bar: React.ReactNode, value: string, op = 1) => (
    <div style={{ display: "grid", gridTemplateColumns: "230px 1fr 130px", alignItems: "center", gap: 14, height: 46, opacity: op }}>
      <span style={{ fontFamily: FONT.body, fontSize: 23, color: C.ink }}>{label}</span>
      <span style={{ height: 18, background: C.soft, display: "flex" }}>{bar}</span>
      <span style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 28, color: col, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
  const wrf = stages.map(([m, c], i) => {
    const w = (Math.max(0, Math.min(m, shown - acc)) / total) * 100;
    acc += m;
    return <span key={i} style={{ width: `${w}%`, height: "100%", background: c, borderRight: w > 0 ? `2px solid ${C.paper}` : undefined }} />;
  });
  return (
    <div style={{ position: "absolute", left: M, top: 690, width: 700, opacity: on }}>
      <div style={{ height: 2, background: C.red, width: `${pt(t, at, 0.7, E.inOut) * 100}%` }} />
      <div style={{ display: "flex", gap: 10, marginTop: 14, fontFamily: FONT.mono, fontSize: 19, letterSpacing: "0.06em", color: C.red }}>
        <span>FINDING</span>
        <span style={{ color: C.muted, letterSpacing: "0.02em" }}>· one 10-day forecast, to scale</span>
      </div>
      <div style={{ marginTop: 14 }}>
        {row("WRF on CPUs", C.ink, wrf, `${Math.round(shown)} min`)}
        {row("FiLMeR on one GPU", C.red, <span style={{ width: 3, height: "100%", background: C.red }} />, "6.5 s", pt(t, at + 1.6, 0.4))}
      </div>
      <div style={{ marginTop: 12, fontFamily: FONT.mono, fontSize: 18, lineHeight: 1.4, color: C.muted, opacity: pt(t, at + 1.9, 0.5) }}>
        WRF: ungrib 41 + metgrid 28 + model 212 min · FiLMeR, Table 14
      </div>
      <Sfx at={at + 0.3} name="tick" volume={0.4} />
    </div>
  );
};

/** How Delhi's news covers its air: weekly articles against weekly PM2.5, 2010–2021, redrawn from Samachar Fig. 5. */
const Talk: React.FC<{ at: number; out: number }> = ({ at, out }) => {
  const t = useT();
  const on = inOut(t, at - 0.1, out - 0.3, 0.5, 0.4);
  if (on <= 0) return null;
  const draw = pt(t, at + 0.3, 2.0, E.inOut);
  const X0 = 930, X1 = 1790, Y0 = 820, Y1 = 330;
  const y0 = 2010, y1 = 2021.5;
  const px = (yr: number) => X0 + ((yr - y0) / (y1 - y0)) * (X1 - X0);
  const pp = (v: number) => Y0 - (v / 450) * (Y0 - Y1);   // PM2.5, 0–450 µg/m³
  const pa = (v: number) => Y0 - (v / 100) * (Y0 - Y1);   // articles, 0–100 a week
  const line = (pts: number[][], f: (v: number) => number) =>
    pts.map(([yr, v], i) => `${i ? "L" : "M"}${px(yr).toFixed(1)},${f(v).toFixed(1)}`).join("");
  const S = samachar as unknown as { pm25: number[][]; articles: number[][]; limit: number };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: on }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="talkdraw">
            <rect x={X0} y={Y1 - 20} width={(X1 - X0) * draw} height={Y0 - Y1 + 40} />
          </clipPath>
        </defs>
        <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke={C.rule} strokeWidth={2} />
        <line x1={X0} x2={X1} y1={pp(S.limit)} y2={pp(S.limit)} stroke={C.red} strokeWidth={2} strokeDasharray="8 7" opacity={0.7} />
        <g clipPath="url(#talkdraw)">
          <path d={line(S.pm25, pp)} fill="none" stroke={C.pink} strokeWidth={2.6} />
          <path d={line(S.articles, pa)} fill="none" stroke={C.ink} strokeWidth={2.6} />
        </g>
        {[2010, 2012, 2014, 2016, 2018, 2020].map((yr) => (
          <text key={yr} x={px(yr)} y={Y0 + 34} fill={C.muted} fontFamily={FONT.mono} fontSize={20} textAnchor="middle">
            {yr}
          </text>
        ))}
      </svg>
      <div style={{ position: "absolute", left: X0, top: Y1 - 92, fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.5 }}>
        <div style={{ color: C.ink }}>— air-quality articles a week, Delhi</div>
        <div style={{ color: "#c0675c" }}>— PM2.5 a week · dashed: India's limit</div>
      </div>
      <div style={{ position: "absolute", left: X0, top: Y0 + 62, fontFamily: FONT.mono, fontSize: 19, color: C.muted, opacity: pt(t, at + 1.6, 0.5) }}>
        Redrawn from Samachar (Fig. 5) · TOI and The Hindu, 2010–2021
      </div>
    </div>
  );
};
