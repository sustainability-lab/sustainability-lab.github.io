import { type DesignSystem, type Page, Step as OSStep, Steps as OSSteps } from "@open-slide/core";
import React, { Children, cloneElement, type CSSProperties, isValidElement, type ReactElement, type ReactNode } from "react";
import { E, lerp, pt, useT } from "../lib/motion";
import { END, TimeContext } from "../lib/time";
import { C, FONT, M } from "../theme";
import { PageClock, StepClock } from "./clock";

// The talk's slide kit: layout and motion for slides/lab-talk/index.tsx, in the film's look.
//
// The rule that makes the slides editable in open-slide: the kit never holds words. Every word on a slide is
// written in the slide file inside an ordinary element (<h2>, <p>, <span>, <b>), which open-slide's editor can
// click and change. Kit components wrap those elements to place and animate them. Pictures are <img> elements
// in the slide file too, imported from the deck's assets/ folder. Drawings made from data (maps, charts) are
// components in src/talk/visuals/.
//
// Motion is written against time (useT), so the same slide animates in open-slide and renders frame by frame
// in the video. Times are seconds from the start of the slide, or of the build (<Step>) the element is in.

type El = ReactElement<{ children?: ReactNode; style?: CSSProperties }>;

const only = (children: ReactNode): El | null => {
  const list = Children.toArray(children);
  return list.length === 1 && isValidElement(list[0]) ? (list[0] as El) : null;
};
const withStyle = (el: El, style: CSSProperties) => cloneElement(el, { style: { ...style, ...el.props.style } });
const textOf = (node: ReactNode): string =>
  typeof node === "string" || typeof node === "number"
    ? String(node)
    : Array.isArray(node)
      ? node.map(textOf).join("")
      : isValidElement<{ children?: ReactNode }>(node)
        ? textOf(node.props.children)
        : "";

// ---------------------------------------------------------------------------------------------------------------
// Tokens

/** Colours per tone, as CSS variables, so slide text says var(--ink) and the editor can still recolour it. */
const TONES = {
  light: { "--bg": C.paper, "--ink": C.ink, "--muted": C.muted, "--rule": C.rule, "--soft": C.soft, "--red": C.red },
  dark: { "--bg": C.night, "--ink": C.nightInk, "--muted": C.nightMuted, "--rule": C.nightRule, "--soft": C.nightSoft, "--red": C.signal },
  red: { "--bg": C.red, "--ink": C.paper, "--muted": "#f4d5d0", "--rule": "#cf6a60", "--soft": C.redDeep, "--red": C.paper },
} as const;
export type SlideTone = keyof typeof TONES;

/** Text styles, from the film. Use as style={{ ...S.title }} so the editor can add to them. */
export const S = {
  hero: { fontFamily: FONT.head, fontWeight: 700, fontSize: 104, lineHeight: 1.02, letterSpacing: "-0.045em", color: "var(--ink)", margin: 0, textWrap: "balance" },
  title: { fontFamily: FONT.head, fontWeight: 700, fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.035em", color: "var(--ink)", margin: 0, textWrap: "balance" },
  body: { fontFamily: FONT.body, fontSize: 34, lineHeight: 1.3, color: "var(--muted)", margin: 0 },
  tag: { fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.35, letterSpacing: "0.01em", color: "var(--red)", margin: 0 },
  kicker: { fontFamily: FONT.mono, fontSize: 19, letterSpacing: "0.06em", color: "var(--red)", margin: 0 },
  line: { fontFamily: FONT.body, fontWeight: 600, fontSize: 32, lineHeight: 1.25, color: "var(--ink)", margin: 0 },
  note: { fontFamily: FONT.mono, fontSize: 18, lineHeight: 1.4, color: "var(--muted)", margin: 0 },
  caption: { fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.3, color: "var(--muted)", margin: 0 },
  label: { fontFamily: FONT.body, fontSize: 23, color: "var(--ink)" },
  value: { fontFamily: FONT.head, fontWeight: 700, fontSize: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" },
  mono: { fontFamily: FONT.mono },
  muted: { color: "var(--muted)" },
  red: { color: "var(--red)" },
} satisfies Record<string, CSSProperties>;

export { C, FONT, M };

/** The film's tokens as open-slide's design system (var(--osd-bg) and so on). */
export const design: DesignSystem = {
  palette: { bg: C.paper, text: C.ink, accent: C.red },
  fonts: { display: FONT.head, body: FONT.body },
  typeScale: { hero: 104, body: 32 },
  radius: 0,
};

// ---------------------------------------------------------------------------------------------------------------
// Pages

export type TalkPage = Page & { id: string; video: number[] };

/** Name a page and give its timing in the video: seconds before the first build, then for each build. */
export const page = (id: string, P: Page, seconds: number[] = [5]): TalkPage => Object.assign(P, { id, video: seconds });

/** The page itself: a 1920 × 1080 sheet in one of the film's tones, with the page's clock. */
export const Frame: React.FC<{ tone?: SlideTone; settle?: number; children: ReactNode }> = ({ tone = "light", settle, children }) => (
  <PageClock settle={settle}>
    <div
      style={{
        ...(TONES[tone] as CSSProperties),
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: FONT.body,
      }}
    >
      {children}
    </div>
  </PageClock>
);

/**
 * A chapter's header: red square, number and name, the lab's name, a rule; under it, the chapter's question
 * (docked small, as in the film); at the foot, the four-part progress bar. Children: the name as a <span> and,
 * optionally, the question as a <p>. `done` is how far through the chapter this slide is (0–1).
 */
export const Head: React.FC<{ n: number; done?: number; at?: number; children: ReactNode }> = ({ n, done = 1, at, children }) => {
  const t = useT();
  const [name, question] = Children.toArray(children).filter(isValidElement) as El[];
  const on = at === undefined ? 1 : pt(t, at, 0.6);
  const rule = at === undefined ? 1 : pt(t, at, 1.0, E.inOut);
  return (
    <>
      <div style={{ position: "absolute", left: M, right: M, top: 58, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: on }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT.body, fontWeight: 600, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>
          {/* a div, so the editor picks the chapter's name on its own rather than this whole row */}
          <div style={{ width: 10, height: 10, background: "var(--red)" }} />
          <span style={{ color: "var(--ink)" }}>{String(n).padStart(2, "0")}</span>
          {name}
        </div>
        <div style={{ fontFamily: FONT.logo, fontSize: 20, letterSpacing: "0.14em", color: "var(--muted)" }}>SUSTAINABILITY LAB · IIT GANDHINAGAR</div>
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: 104, height: 1, background: "var(--rule)", transform: `scaleX(${rule})`, transformOrigin: "left" }} />
      {question &&
        withStyle(question, {
          position: "absolute",
          left: M,
          top: 126,
          width: 1300,
          margin: 0,
          fontFamily: FONT.head,
          fontWeight: 700,
          fontSize: 43,
          lineHeight: 1.02,
          letterSpacing: "-0.045em",
          color: "var(--muted)",
          opacity: on,
        })}
      <div style={{ position: "absolute", left: M, bottom: 54, display: "flex", gap: 10, opacity: on }}>
        {[1, 2, 3, 4].map((k) => (
          <div key={k} style={{ width: 64, height: 4, background: "var(--rule)", overflow: "hidden" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                background: k < n ? "var(--muted)" : "var(--red)",
                transform: `scaleX(${k < n ? 1 : k === n ? done : 0})`,
                transformOrigin: "left",
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

/** A chapter's opening: the red card with the number and name, wiped away to show the question, big. */
export const ChapterCard: React.FC<{ n: number; children: ReactNode }> = ({ n, children }) => {
  const t = useT();
  const [name, question] = Children.toArray(children).filter(isValidElement) as El[];
  const wipe = pt(t, 1.05, 0.55, E.inOut);
  const numIn = pt(t, 0, 0.5);
  const label = String(n).padStart(2, "0");
  return (
    <>
      <Head n={n} done={0} at={1.3}>
        {name && cloneElement(name, { key: "name" })}
      </Head>
      {question && (
        <div style={{ position: "absolute", left: M, top: 360, width: 1300 }}>
          <Words at={1.45} stagger={0.06}>
            {withStyle(question, S.hero)}
          </Words>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: C.red, transform: `translateX(${-wipe * 101}%)` }}>
        <div style={{ position: "absolute", left: M, bottom: 96, color: C.paper, fontFamily: FONT.head, fontWeight: 700, lineHeight: 0.84, letterSpacing: "-0.06em" }}>
          <div style={{ fontSize: 420, transform: `translateY(${(1 - numIn) * 60}px)`, opacity: numIn }}>{label}</div>
          <div style={{ fontSize: 120, letterSpacing: "-0.045em", marginTop: 28, opacity: pt(t, 0.12, 0.5), transform: `translateY(${(1 - pt(t, 0.12, 0.5)) * 40}px)` }}>
            {name ? textOf(name) : null}
          </div>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Placing

/** A column of text at the film's left margin. */
export const Col: React.FC<{ top?: number; left?: number; width?: number; gap?: number; children: ReactNode }> = ({ top = 300, left = M, width = 700, gap = 30, children }) => (
  <div style={{ position: "absolute", left, top, width, display: "flex", flexDirection: "column", gap }}>{children}</div>
);

/** Anything placed at film coordinates. */
export const Box: React.FC<{ x: number; y: number; w?: number; h?: number; style?: CSSProperties; children: ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);

/** Shift time for what is inside: its animations start `t` seconds later. */
export const At: React.FC<{ t: number; children: ReactNode }> = ({ t: delay, children }) => {
  const t = useT();
  return <TimeContext.Provider value={t >= END / 2 ? END : t - delay}>{children}</TimeContext.Provider>;
};

// ---------------------------------------------------------------------------------------------------------------
// Motion (each wraps one element written in the slide file)

/** Words that rise one after another (titles). Once they have risen, the element is shown exactly as written. */
export const Words: React.FC<{ at?: number; stagger?: number; dur?: number; children: ReactNode }> = ({ at = 0, stagger = 0.045, dur = 0.7, children }) => {
  const t = useT();
  const el = only(children);
  if (!el) return <>{children}</>;
  const text = el.props.children;
  if (typeof text !== "string") return <Rise at={at}>{el}</Rise>;
  // Each word rises in its own box, broken again after any hyphen or dash, so the rising title can wrap
  // exactly where the finished one will ("open-" | "source"), and nothing moves when it settles.
  const words = text.split(/\s+/).filter(Boolean);
  const pieces = words.flatMap((w, i) => {
    const parts = w.split(/(?<=[-‐–—])/);
    return parts.map((s, j) => ({ s, space: j === parts.length - 1 && i < words.length - 1 }));
  });
  if (t >= at + pieces.length * stagger + dur) return el;
  // the spaces sit between the words' boxes, not inside them, where a line would swallow them
  return cloneElement(
    el,
    undefined,
    pieces.flatMap(({ s, space }, i) => {
      const a = pt(t, at + i * stagger, dur);
      const word = (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.14em", marginBottom: "-0.14em" }}>
          <span style={{ display: "inline-block", transform: `translateY(${(1 - a) * 110}%)` }}>{s}</span>
        </span>
      );
      return space ? [word, " "] : [word];
    }),
  );
};

/** A line that slides up from behind a mask. */
export const Rise: React.FC<{ at?: number; dur?: number; children: ReactNode; style?: CSSProperties }> = ({ at = 0, dur = 0.75, children, style }) => {
  const t = useT();
  const a = pt(t, at, dur);
  return (
    <div style={{ overflow: a < 1 ? "hidden" : undefined, paddingBottom: "0.14em", marginBottom: "-0.14em", ...style }}>
      <div style={{ transform: a < 1 ? `translateY(${(1 - a) * 110}%)` : undefined }}>{children}</div>
    </div>
  );
};

/** Fade in with a slight lift; fade out at `out` if given. */
export const Appear: React.FC<{ at?: number; out?: number; dur?: number; dy?: number; children: ReactNode; style?: CSSProperties }> = ({
  at = 0,
  out,
  dur = 0.7,
  dy = 24,
  children,
  style,
}) => {
  const t = useT();
  const a = pt(t, at, dur);
  const b = out === undefined ? 0 : pt(t, out, 0.4, E.in);
  return <div style={{ opacity: a * (1 - b), transform: a < 1 || b > 0 ? `translateY(${(1 - a) * dy - b * dy * 0.5}px)` : undefined, ...style }}>{children}</div>;
};

/** Text typed out from left to right, with a block cursor while it types. */
export const TypeIn: React.FC<{ at?: number; cps?: number; cursor?: string; children: ReactNode }> = ({ at = 0, cps = 40, cursor = C.red, children }) => {
  const t = useT();
  const len = textOf(children).length || 1;
  const p = Math.max(0, Math.min(1, (t - at) * (cps / len)));
  const typing = p > 0 && p < 1;
  return (
    <div style={{ position: "relative", width: "fit-content", maxWidth: "100%" }}>
      <div style={{ clipPath: p < 1 ? `inset(0 ${(1 - p) * 100}% 0 0)` : undefined, opacity: p > 0 ? 1 : 0 }}>{children}</div>
      {typing && <span style={{ position: "absolute", top: "0.12em", left: `${p * 100}%`, width: "0.55em", height: "1.05em", background: cursor }} />}
    </div>
  );
};

/** A number that counts up to the one written in the element, then shows the element as written. */
export const Count: React.FC<{ at?: number; dur?: number; children: ReactNode }> = ({ at = 0, dur = 1.6, children }) => {
  const t = useT();
  const el = only(children);
  const text = el ? textOf(el) : "";
  const m = text.match(/[\d,]+(\.\d+)?/);
  if (!el || !m || t >= at + dur) return <>{children}</>;
  const target = Number(m[0].replace(/,/g, ""));
  const decimals = m[1] ? m[1].length - 1 : 0;
  const v = target * pt(t, at, dur, E.soft);
  const shown = v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: m[0].includes(",") });
  return cloneElement(el, undefined, text.replace(m[0], shown));
};

/** A picture (an <img> written in the slide file) revealed by a moving edge, with a slow push-in. */
export const Reveal: React.FC<{
  at?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  from?: "left" | "right" | "bottom";
  fit?: "cover" | "contain";
  pos?: string;
  zoom?: number;
  bg?: string;
  border?: string;
  children: ReactNode;
}> = ({ at = 0, x, y, w, h, from = "left", fit = "cover", pos = "center", zoom = 0.06, bg, border, children }) => {
  const t = useT();
  const a = pt(t, at, 0.9, E.inOut);
  const clip = from === "left" ? `inset(0 ${(1 - a) * 100}% 0 0)` : from === "right" ? `inset(0 0 0 ${(1 - a) * 100}%)` : `inset(${(1 - a) * 100}% 0 0 0)`;
  const s = 1 + zoom * (1 - pt(t, at, 6, E.soft));
  const img = only(children);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, clipPath: a < 1 ? clip : undefined, overflow: "hidden", background: bg, outline: border ? `1px solid ${border}` : undefined }}>
      {img ? withStyle(img, { display: "block", width: "100%", height: "100%", objectFit: fit, objectPosition: pos, transform: s > 1.0005 ? `scale(${s})` : undefined }) : children}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Blocks

/** The red paper-or-project line under a title: a short rule, then the lines (<p>), and a NEW badge if asked. */
export const Tag: React.FC<{ isNew?: boolean; children: ReactNode }> = ({ isNew, children }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.35 }}>
    <span style={{ width: 22, height: 2, background: "var(--red)", flex: "none", marginTop: "0.66em" }} />
    <div>{Children.map(children, (c) => (isValidElement(c) ? withStyle(c as El, S.tag) : c))}</div>
    {isNew && (
      <span style={{ flex: "none", fontFamily: FONT.body, fontWeight: 700, fontSize: 18, letterSpacing: "0.1em", color: "var(--bg)", background: "var(--red)", padding: "3px 9px" }}>NEW</span>
    )}
  </div>
);

/**
 * A result, as in the film: a red rule draws, then each child appears in turn (a kicker <p>, a line <p>, <Bars>,
 * a source <p>). Children animate on the finding's own time, so put <Bars at={0.35}> inside, not outside.
 */
export const Finding: React.FC<{ at?: number; top?: number; left?: number; width?: number; children: ReactNode }> = ({ at = 0, top = 690, left = M, width = 700, children }) => {
  const t = useT();
  const items = Children.toArray(children);
  return (
    <div style={{ position: "absolute", left, top, width, opacity: pt(t, at, 0.5), transform: `translateY(${(1 - pt(t, at, 0.6, E.out)) * 16}px)` }}>
      <div style={{ height: 2, background: "var(--red)", width: `${pt(t, at, 0.7, E.inOut) * 100}%` }} />
      <At t={at}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          {items.map((c, i) => (
            <Appear key={i} at={0.1 + i * 0.25} dur={0.5} dy={8}>
              {c}
            </Appear>
          ))}
        </div>
      </At>
    </div>
  );
};

type BarProps = { hi?: boolean; value?: number; children: ReactNode; _max?: number; _at?: number; _cols?: string };

/** One row of <Bars>: a label (<span>) and a value (<b>). The bar's length comes from the value as written, or from `value`. */
export const Bar: React.FC<BarProps> = ({ hi, value, children, _max = 1, _at = 0, _cols = "250px 1fr 90px" }) => {
  const t = useT();
  const [label, num] = Children.toArray(children).filter(isValidElement) as El[];
  const v = value ?? (Number(textOf(num).replace(/[^\d.]/g, "")) || 0);
  const a = pt(t, _at, 0.9, E.out);
  const col = hi ? "var(--red)" : "var(--muted)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: _cols, alignItems: "center", gap: 14, height: 40 }}>
      {label && withStyle(label, S.label)}
      {/* divs, not spans: the editor treats a row of inline elements as one block of text, and this row's
          label and value must each be picked on their own */}
      <div style={{ height: 16, background: "var(--soft)" }}>
        <div style={{ height: "100%", width: `${Math.max(0, (v / _max) * 100 * a)}%`, minWidth: v > 0 && a > 0.05 ? 3 : 0, background: col }} />
      </div>
      {num && withStyle(num, { ...S.value, color: col, opacity: pt(t, _at, 0.3) })}
    </div>
  );
};

/** Bars to scale, growing one after another. */
export const Bars: React.FC<{ at?: number; label?: number; num?: number; children: ReactNode }> = ({ at = 0.35, label = 250, num = 90, children }) => {
  const rows = Children.toArray(children).filter(isValidElement) as ReactElement<BarProps>[];
  const values = rows.map((r) => {
    const parts = Children.toArray(r.props.children).filter(isValidElement) as El[];
    return r.props.value ?? Number(textOf(parts[1]).replace(/[^\d.]/g, ""));
  });
  const max = Math.max(...values.filter((v) => Number.isFinite(v)), 1e-9);
  return <div>{rows.map((r, i) => cloneElement(r, { key: i, _max: max, _at: at + i * 0.3, _cols: `${label}px 1fr ${num}px` }))}</div>;
};

// ---------------------------------------------------------------------------------------------------------------
// Builds

/** One build: revealed by →, and its animations start then. Use inside <Steps>. */
export const Step: React.FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

/** open-slide's builds, with a clock per build so what is inside animates when it is revealed. */
export const Steps: React.FC<{ children: ReactNode }> = ({ children }) => (
  <OSSteps>
    {Children.toArray(children).map((c, i) =>
      isValidElement<{ children?: ReactNode }>(c) && c.type === Step ? (
        <OSStep key={c.key ?? i} duration={0}>
          <StepClock>{c.props.children}</StepClock>
        </OSStep>
      ) : (
        c
      ),
    )}
  </OSSteps>
);

export { lerp, pt, E, useT };
