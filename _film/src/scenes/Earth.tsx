import React, { useLayoutEffect, useRef } from "react";
import { Sfx } from "../lib/sfx";
import { AbsoluteFill, Img, staticFile } from "remotion";
import kilns from "../../data/kilns.json";
import tiles from "../../data/kiln-tiles.json";
import { beat, chapter, F } from "../data";
import { BeatText, Chapter, Reveal } from "../lib/chapter";
import { flat, indiaRings, ringsPath } from "../lib/geo";
import { Count, E, inOut, lerp, pt, useT } from "../lib/motion";
import { C, FONT, H, W, DPR } from "../theme";
import { BAR } from "../timing";

export const EARTH_LEN = 10 * BAR;

const T = { dock: 3.9, kl: 4.3, sk: 9.1, po: 13.4, fs: 16.6 };
const SWEEP = 3.6; // seconds for all kilns to appear
const VIEW = { lon0: 82.2, lat0: 26.6, k: 60, cx: 1330, cy: 560 };

const K = kilns as unknown as { n: number; pts: [number, number, number][] };
const TILES = tiles as unknown as { name: string; lat: number; lon: number; boxes: number[][] }[];
const COUNTRY: Record<string, string> = {
  "25.8467_80.6397": "India",
  "27.7644_77.7249": "India",
  "32.2541_74.1851": "Pakistan",
  "23.6261_89.8530": "Bangladesh",
};

const KilnLayer: React.FC<{ t: number; view: typeof VIEW; opacity: number }> = ({ t, view, opacity }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.clearRect(0, 0, W, H);
    const proj = flat(view);
    const shown = Math.floor(K.n * pt(t, T.kl + 0.3, SWEEP, E.linear));
    const per = SWEEP / K.n;
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < shown; i++) {
      const [lat, lon] = K.pts[i];
      const [x, y] = proj(lon, lat);
      const age = t - (T.kl + 0.3 + i * per);
      const fresh = Math.max(0, 1 - age / 0.5);
      g.fillStyle = fresh > 0 ? `rgba(255, ${Math.round(120 + 110 * fresh)}, ${Math.round(100 + 120 * fresh)}, ${0.55 + 0.45 * fresh})` : "rgba(230, 72, 60, 0.55)";
      const r = 1.5 + 2.2 * fresh;
      g.fillRect(x - r / 2, y - r / 2, r, r);
    }
  }, [t, view]);
  return <canvas ref={ref} width={W * DPR} height={H * DPR} style={{ position: "absolute", inset: 0, width: W, height: H, opacity }} />;
};

/** A Sentinel-2 tile whose oriented kiln boxes draw on one by one. */
const Tile: React.FC<{ i: number; at: number; out: number; x: number; y: number; s: number }> = ({ i, at, out, x, y, s }) => {
  const t = useT();
  const tile = TILES[i];
  const a = pt(t, at, 0.7, E.inOut);
  const o = 1 - pt(t, out, 0.5, E.inOut);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: s, opacity: o }}>
      <div style={{ position: "relative", width: s, height: s, clipPath: `inset(${(1 - a) * 100}% 0 0 0)` }}>
        <Img src={staticFile(F.img[`tile_${tile.name}`])} style={{ width: s, height: s, display: "block" }} />
        <svg width={s} height={s} style={{ position: "absolute", inset: 0 }}>
          {tile.boxes.map((b, j) => {
            const d = pt(t, at + 0.6 + j * 0.05, 0.45, E.out);
            const pts = [0, 1, 2, 3].map((q) => `${b[q * 2] * s},${b[q * 2 + 1] * s}`).join(" ");
            return <polygon key={j} points={pts} fill="none" stroke="#ffffff" strokeWidth={2.4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />;
          })}
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: FONT.mono, fontSize: 19, color: C.nightMuted, opacity: a }}>
        <span>
          {tile.lat.toFixed(2)}°N {tile.lon.toFixed(2)}°E
        </span>
        <span style={{ color: C.nightInk }}>{COUNTRY[tile.name]}</span>
      </div>
    </div>
  );
};

export const Earth: React.FC = () => {
  const t = useT();
  const ch = chapter("earth");
  const b = (id: string) => beat("earth", id);
  const mapOn = pt(t, T.dock + 0.1, 1.1, E.inOut);
  const mapOut = pt(t, T.sk - 0.3, 0.6, E.inOut);
  const drift = 1 + 0.04 * pt(t, T.dock, 6, E.linear);
  const view = { ...VIEW, k: lerp(VIEW.k * drift, VIEW.k * 1.5, mapOut), cx: lerp(VIEW.cx, VIEW.cx + 160, mapOut) };
  const proj = flat(view);
  const outline = ringsPath(indiaRings, proj);
  const shown = K.n * pt(t, T.kl + 0.3, SWEEP, E.linear);

  return (
    <Chapter num={2} name={ch.name} headline={ch.headline} tone="dark" len={EARTH_LEN} dock={T.dock}>
      <AbsoluteFill style={{ opacity: mapOn * (1 - mapOut) }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path d={outline} fill={C.nightSoft} stroke={C.nightRule} strokeWidth={2} />
        </svg>
        <KilnLayer t={t} view={view} opacity={1} />
        <div style={{ position: "absolute", left: 1450, top: 150, textAlign: "right", width: 350 }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 21, color: C.nightMuted, letterSpacing: "0.06em" }}>KILNS FOUND</div>
          <div style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 92, letterSpacing: "-0.04em", color: C.signal, lineHeight: 1.05 }}>
            {Math.round(shown).toLocaleString("en-US")}
          </div>
        </div>
        <div style={{ position: "absolute", left: 930, top: 920, fontFamily: FONT.mono, fontSize: 20, color: C.nightMuted, opacity: inOut(t, T.kl + 1.5, T.sk - 0.4) }}>
          Punjab · Haryana · Uttar Pradesh · Bihar · West Bengal
        </div>
      </AbsoluteFill>

      <Sfx at={T.kl + 0.3} name="rain_long" volume={0.98} />
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} at={T.sk + i * 0.2} name="tick" volume={0.91} />
      ))}
      <Sfx at={T.po - 0.1} name="whoosh" volume={0.33} />
      <Sfx at={T.fs - 0.1} name="whoosh" volume={0.33} />
      <BeatText tone="dark" at={T.kl} out={T.sk - 0.42} title={b("kilns").title} text={b("kilns").text} tag={b("kilns").tag} />
      <BeatText tone="dark" at={T.sk + 0.05} out={T.po - 0.42} title={b("sentinelkilndb").title} text={b("sentinelkilndb").text} tag={b("sentinelkilndb").tag} />
      <BeatText tone="dark" at={T.po + 0.05} out={T.fs - 0.42} title={b("policy").title} tag={b("policy").tag} />
      <BeatText tone="dark" at={T.fs + 0.05} title={b("flowsat").title} tag={b("flowsat").tag} isNew={b("flowsat").new} />

      {/* SentinelKilnDB: four Sentinel-2 tiles, boxes drawn from the paper's annotations */}
      {[0, 1, 2, 3].map((i) => (
        <Tile key={i} i={i} at={T.sk + i * 0.2} out={T.po - 0.3} x={960 + (i % 2) * 430} y={196 + Math.floor(i / 2) * 420} s={380} />
      ))}

      {/* Space to Policy: the paper's detections */}
      <Reveal src={F.img.policy} at={T.po - 0.15} out={T.fs - 0.25} x={1030} y={196} w={790} h={768} fit="contain" from="bottom" bg={C.night} />

      {/* FlowSat: generated satellite images */}
      <FlowSatGrid at={T.fs - 0.05} />
    </Chapter>
  );
};

const FLOWSAT = ["airport", "stadium", "solar farm", "dam"];

/** FlowSat: four generated satellite images, large enough to read. */
const FlowSatGrid: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  if (t < at - 0.05) return null;
  const s = 372;
  return (
    <div style={{ position: "absolute", left: 1000, top: 186 }}>
      {FLOWSAT.map((name, i) => {
        const a = pt(t, at + i * 0.12, 0.7, E.inOut);
        const x = (i % 2) * (s + 24);
        const y = Math.floor(i / 2) * (s + 56);
        return (
          <div key={name} style={{ position: "absolute", left: x, top: y, width: s }}>
            <div style={{ width: s, height: s, overflow: "hidden", clipPath: `inset(${(1 - a) * 100}% 0 0 0)` }}>
              <Img src={staticFile(F.img[`flowsat_${name.replace(" ", "_")}`])} style={{ width: s, height: s, display: "block", transform: `scale(${1.08 - 0.08 * pt(t, at, 3.5, E.soft)})` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: FONT.mono, fontSize: 23, color: C.nightInk, opacity: pt(t, at + 0.4 + i * 0.12, 0.4) }}>
              <span>{name}</span>
              <span style={{ color: C.signal }}>generated</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
