import React from "react";
import { Sfx } from "../lib/sfx";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { F } from "../data";
import { useT } from "../lib/motion";
import { C, FONT, M } from "../theme";
import { BAR, BEAT } from "../timing";

export const PEOPLE_LEN = 3 * BAR;

// Life in the lab: real photos, full frame, one every two beats, each pushing in.
export const People: React.FC = () => {
  const t = useT();
  const photos = F.people.photos.slice(0, 6);
  const per = 2 * BEAT;
  const cur = Math.min(photos.length - 1, Math.floor(t / per));
  const z = 1.06 + 0.08 * ((t - cur * per) / per);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {photos.map((_, i) => (
        <Sfx key={i} at={i * per} name="tick" volume={0.55} />
      ))}
      {/* every photo stays mounted so none has to load on its cut */}
      {photos.map((p, i) => (
        <Img
          key={p.src}
          src={staticFile(p.src)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: i === cur ? 1 : 0,
            transform: i === cur ? `scale(${z}) translateX(${(i % 2 ? 1 : -1) * (z - 1) * 120}px)` : undefined,
          }}
        />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 280, background: "linear-gradient(transparent, rgba(16,18,17,.8))" }} />
      <div style={{ position: "absolute", left: M, bottom: 70, display: "flex", alignItems: "baseline", gap: 34 }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 104, letterSpacing: "-0.05em", lineHeight: 1, color: C.paper }}>{F.people.title}</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 30, color: "#f6c2ba" }}>{photos[cur].year}</div>
      </div>
      <div style={{ position: "absolute", right: M, bottom: 82, display: "flex", gap: 8 }}>
        {photos.map((_, k) => (
          <span key={k} style={{ width: 34, height: 4, background: k <= cur ? C.signal : "rgba(255,254,250,.35)" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
