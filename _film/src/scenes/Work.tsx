import React from "react";
import { Sfx } from "../lib/sfx";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { F } from "../data";
import { Appear, E, Kicker, pt, Rise, Rule, useT, Words } from "../lib/motion";
import { C, FONT, M } from "../theme";
import { BAR, BEAT } from "../timing";

export const WORK_LEN = 7 * BAR;

// the red card lands on the downbeat of bar 58 (two bars before People)
// the wall (with award badges), then This quarter on the phrase boundary at bar 56
// (This quarter was dropped in December 2026: the wall alone, then Life in the lab on movement two's peak)

// one cell per venue: the newest paper with a figure there
const wallCells = () => {
  const seen = new Set<string>();
  return F.work.wall.filter((w) => (seen.has(w.venue) ? false : (seen.add(w.venue), true))).slice(0, 8);
};

export const Work: React.FC = () => {
  const t = useT();
  const cells = wallCells();
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      {cells.map((_, i) => (
        <Sfx key={i} at={0.25 + i * BEAT} name="tick" volume={0.9} />
      ))}
      <Sfx at={4.6} name="ping" volume={0.3} />

      {/* A: the venue wall, one cell per beat */}
      <AbsoluteFill>
        <div style={{ position: "absolute", left: M, top: 70 }}>
          <Rise at={0.05}>
            <Kicker size={24}>{F.work.kicker}</Kicker>
          </Rise>
        </div>
        <Rule at={0.1} style={{ position: "absolute", left: M, right: M, top: 122 }} />
        <div style={{ position: "absolute", left: M, top: 160, right: M, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "44px 34px" }}>
          {cells.map((c, i) => {
            const at = 0.25 + i * BEAT;
            const a = pt(t, at, 0.5, E.out);
            return (
              <div key={c.venue} style={{ opacity: a > 0 ? 1 : 0 }}>
                <div style={{ height: 282, background: "#ffffff", border: `1px solid ${C.rule}`, overflow: "hidden", clipPath: `inset(${(1 - a) * 100}% 0 0 0)` }}>
                  <Img src={staticFile(c.figure)} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 10 }} />
                </div>
                <div style={{ overflow: "hidden", marginTop: 12 }}>
                  <div style={{ transform: `translateY(${(1 - a) * 100}%)`, fontFamily: FONT.head, fontWeight: 700, fontSize: 62, letterSpacing: "-0.04em", lineHeight: 1.02, color: C.ink }}>{c.venue}</div>
                </div>
                <div style={{ fontFamily: FONT.mono, fontSize: 24, color: C.muted, marginTop: 8, lineHeight: 1.3, opacity: pt(t, at + 0.2, 0.4), display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {c.year} · {c.title}
                </div>
                {F.work.badges?.[c.venue] && (
                  <div style={{ marginTop: 10, display: "inline-block", fontFamily: FONT.body, fontWeight: 700, fontSize: 21, letterSpacing: "0.06em", textTransform: "uppercase", color: C.paper, background: C.red, padding: "5px 10px", transform: `scale(${pt(t, 4.6, 0.4, E.out)})`, transformOrigin: "left center" }}>
                    {F.work.badges[c.venue]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
