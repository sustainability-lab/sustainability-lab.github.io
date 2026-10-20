import React from "react";
import { Sfx } from "./sfx";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { E, lerp, pt, Rise, useT, Words } from "./motion";
import { C, FONT, H, M, Tone, tone, W } from "../theme";

export const CHAPTER_KEYS = ["air", "earth", "health", "energy"];

/**
 * Shell for a research chapter: a hard cut to red with the chapter number on the downbeat,
 * a wipe that reveals the chapter, the problem headline that then docks into the header,
 * and a four-part progress bar.
 */
export const Chapter: React.FC<{
  num: number;
  name: string;
  headline: string;
  tone: Tone;
  len: number;
  dock: number; // when the headline moves up into the header
  children: React.ReactNode;
}> = ({ num, name, headline, tone: tn, len, dock, children }) => {
  const t = useT();
  const k = tone(tn);
  const wipe = pt(t, 1.05, 0.55, E.inOut);
  const numIn = pt(t, 0.0, 0.5);
  const d = pt(t, dock, 0.85, E.inOut);
  const label = `${String(num).padStart(2, "0")}`;

  return (
    <AbsoluteFill style={{ background: k.bg, overflow: "hidden" }}>
      <Sfx at={0} name="thump" volume={0.39} />
      <Sfx at={0.95} name="whoosh" volume={0.48} />
      {children}

      {/* header */}
      <div style={{ position: "absolute", left: M, right: M, top: 58, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: pt(t, 1.3, 0.6) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT.body, fontWeight: 600, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: k.muted }}>
          <span style={{ width: 10, height: 10, background: k.red }} />
          <span style={{ color: k.ink }}>{label}</span>
          <span>{name}</span>
        </div>
        <div style={{ fontFamily: FONT.logo, fontSize: 20, letterSpacing: "0.14em", color: k.muted }}>SUSTAINABILITY LAB · IIT GANDHINAGAR</div>
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: 104, height: 1, background: k.rule, transform: `scaleX(${pt(t, 1.3, 1.0, E.inOut)})`, transformOrigin: "left" }} />

      {/* headline: big first, then docked small under the header */}
      <div
        style={{
          position: "absolute",
          left: M,
          top: lerp(360, 126, d),
          width: lerp(1300, 1300 * 2.4, d),
          transform: `scale(${lerp(1, 1 / 2.4, d)})`,
          transformOrigin: "left top",
          fontFamily: FONT.head,
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 1.02,
          letterSpacing: "-0.045em",
          color: d > 0.5 ? k.muted : k.ink,
        }}
      >
        <Words text={headline} at={1.45} stagger={0.06} style={{ textWrap: "balance" }} />
      </div>

      {/* progress: four chapters */}
      <div style={{ position: "absolute", left: M, bottom: 54, display: "flex", gap: 10, opacity: pt(t, 1.5, 0.6) }}>
        {CHAPTER_KEYS.map((_, i) => (
          <div key={i} style={{ width: 64, height: 4, background: k.rule, overflow: "hidden" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                background: i + 1 < num ? k.muted : k.red,
                transform: `scaleX(${i + 1 < num ? 1 : i + 1 === num ? pt(t, 0, len, E.linear) : 0})`,
                transformOrigin: "left",
              }}
            />
          </div>
        ))}
      </div>

      {/* the red card */}
      <div style={{ position: "absolute", inset: 0, background: C.red, transform: `translateX(${-wipe * 101}%)` }}>
        <div style={{ position: "absolute", left: M, bottom: 96, color: C.paper, fontFamily: FONT.head, fontWeight: 700, lineHeight: 0.84, letterSpacing: "-0.06em" }}>
          <div style={{ fontSize: 420, transform: `translateY(${(1 - numIn) * 60}px)`, opacity: numIn }}>{label}</div>
          <div style={{ fontSize: 120, letterSpacing: "-0.045em", marginTop: 28, opacity: pt(t, 0.12, 0.5), transform: `translateY(${(1 - pt(t, 0.12, 0.5)) * 40}px)` }}>{name}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Left-column text for one beat: title, optional line, and the paper/project tag. */
export const BeatText: React.FC<{
  at: number;
  out?: number;
  title: string;
  text?: string;
  tag?: string;
  isNew?: boolean;
  tone: Tone;
  top?: number;
  width?: number;
  size?: number;
}> = ({ at, out, title, text, tag, isNew, tone: tn, top = 300, width = 700, size = 64 }) => {
  const k = tone(tn);
  return (
    <div style={{ position: "absolute", left: M, top, width }}>
      <Words text={title} at={at} out={out} stagger={0.04} style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: size, lineHeight: 1.05, letterSpacing: "-0.035em", color: k.ink, textWrap: "balance" }} />
      {text && (
        <Rise at={at + 0.35} out={out} style={{ marginTop: 26 }}>
          <div style={{ fontFamily: FONT.body, fontSize: 34, lineHeight: 1.3, color: k.muted }}>{text}</div>
        </Rise>
      )}
      {tag && (
        <Rise at={at + 0.5} out={out} style={{ marginTop: 34 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.35, color: k.red, letterSpacing: "0.01em" }}>
            <span style={{ width: 22, height: 2, background: k.red, flex: "none", marginTop: "0.66em" }} />
            <span>
              {tag.split(" | ").map((line) => (
                <div key={line}>{line}</div>
              ))}
            </span>
            {isNew && <span style={{ flex: "none",  fontFamily: FONT.body, fontWeight: 700, fontSize: 18, letterSpacing: "0.1em", color: tn === "light" ? C.paper : C.night, background: k.red, padding: "3px 9px" }}>NEW</span>}
          </div>
        </Rise>
      )}
    </div>
  );
};

/** An image that is revealed by a moving edge, with a slow push-in. */
export const Reveal: React.FC<{
  src: string;
  at: number;
  out?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  fit?: "cover" | "contain";
  from?: "left" | "bottom" | "right";
  zoom?: number;
  bg?: string;
  pos?: string;
  border?: string;
  style?: React.CSSProperties;
}> = ({ src, at, out, x, y, w, h, fit = "cover", from = "left", zoom = 0.06, bg, pos = "center", border, style }) => {
  const t = useT();
  const a = pt(t, at, 0.9, E.inOut);
  const b = out === undefined ? 0 : pt(t, out, 0.6, E.inOut);
  const clip =
    from === "left"
      ? `inset(0 ${(1 - a) * 100}% 0 ${b * 100}%)`
      : from === "right"
        ? `inset(0 ${b * 100}% 0 ${(1 - a) * 100}%)`
        : `inset(${(1 - a) * 100}% 0 ${b * 100}% 0)`;
  const s = 1 + zoom * (1 - pt(t, at, 6, E.soft));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, clipPath: clip, overflow: "hidden", background: bg, outline: border ? `1px solid ${border}` : undefined, ...style }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: pos, transform: `scale(${s})` }} />
    </div>
  );
};

export const frameSize = { W, H, M };
