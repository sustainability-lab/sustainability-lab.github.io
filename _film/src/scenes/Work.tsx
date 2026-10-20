import React from "react";
import { Sfx } from "../lib/sfx";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { F } from "../data";
import { Appear, E, Kicker, pt, Rise, Rule, useT, Words } from "../lib/motion";
import { C, FONT, M } from "../theme";
import { BAR, BEAT } from "../timing";

export const WORK_LEN = 8 * BAR;

// the red card lands on the downbeat of bar 58 (two bars before People)
// the wall (with award badges), then This quarter on the phrase boundary at bar 56
const T = { wall: 0, q: 4 * BAR };

// one cell per venue: the newest paper with a figure there
const wallCells = () => {
  const seen = new Set<string>();
  return F.work.wall.filter((w) => (seen.has(w.venue) ? false : (seen.add(w.venue), true))).slice(0, 8);
};

export const Work: React.FC = () => {
  const t = useT();
  const cells = wallCells();
  const wallOut = pt(t, T.q + 0.5, 0.3, E.inOut);
  const qIn = pt(t, T.q, 0.55, E.inOut);
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      {cells.map((_, i) => (
        <Sfx key={i} at={0.25 + i * BEAT} name="tick" volume={0.9} />
      ))}
      <Sfx at={4.6} name="ping" volume={0.3} />
      <Sfx at={T.q - 0.1} name="whoosh" volume={0.5} />
      <Sfx at={T.q} name="thump" volume={0.3} />

      {/* A: the venue wall, one cell per beat */}
      <AbsoluteFill style={{ opacity: 1 - wallOut }}>
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
                <div style={{ fontFamily: FONT.mono, fontSize: 24, color: C.muted, marginTop: 8, opacity: pt(t, at + 0.2, 0.4), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

      {/* C: this quarter, on the dark ground with red accents (full red is reserved for chapter cards) */}
      <div style={{ position: "absolute", inset: 0, background: C.night, clipPath: `inset(0 0 0 ${(1 - qIn) * 100}%)` }}>
        <div style={{ position: "absolute", left: M, top: 92 }}>
          <Rise at={T.q + 0.25}>
            <Kicker color={C.nightMuted} square={C.signal} size={24}>{F.edition}</Kicker>
          </Rise>
          <Words text={F.work.quarter_title} at={T.q + 0.35} style={{ marginTop: 16, fontFamily: FONT.head, fontWeight: 700, fontSize: 150, letterSpacing: "-0.055em", lineHeight: 0.95, color: C.nightInk }} />
        </div>
        <div style={{ position: "absolute", left: M, right: M, top: 420 }}>
          {F.work.quarter.map((q, i) => {
            const at = T.q + 0.75 + i * BEAT;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 30, padding: "26px 0", borderTop: `2px solid ${i === 0 ? C.signal : C.nightRule}` , opacity: pt(t, at, 0.3) }}>
                <Rise at={at}>
                  <span style={{ fontFamily: FONT.mono, fontSize: 30, color: C.signal }}>{q.when}</span>
                </Rise>
                <Appear at={at + 0.05} dy={16}>
                  <span style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 46, lineHeight: 1.2, color: C.nightInk, letterSpacing: "-0.01em" }}>{q.text}</span>
                </Appear>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
