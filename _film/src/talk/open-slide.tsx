import React, { Children, cloneElement, createContext, isValidElement, useContext, useLayoutEffect, useRef } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TimeContext, VideoContext } from "../lib/time";

// A stand-in for @open-slide/core, so the talk's slides (slides/lab-talk/index.tsx) render frame by frame in
// the video. When Remotion bundles them, webpack points "@open-slide/core" here (talk/webpack.mjs). Builds that
// open-slide reveals on → are revealed here at the times the page gives (page(id, P, seconds) in the slide
// file), and the time is set from the frame: the page's time for the page, the build's time inside a build,
// so the kit's animations (src/talk/kit.tsx) play exactly as they do in open-slide.
//
// Covers what the slides use: Steps and Step, the page hooks, design tokens as CSS variables, and the type
// names. CSS transitions and keyframes do not advance frame by frame and will not show in the video.

export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

export type Page = React.ComponentType & { transition?: unknown };
export type SlideMeta = { title?: string; theme?: string; createdAt?: string };
export type DesignSystem = {
  palette: { bg: string; text: string; accent: string };
  fonts: { display: string; body: string };
  typeScale: { hero: number; body: number };
  radius: number;
};

type PageClock = {
  frame: number;
  fps: number;
  /** frame at which each part of the page begins: 0 for the page itself, then one per → build */
  starts: number[];
  number: number;
  total: number;
  /** hands out step numbers in document order, across all <Steps> blocks on the page */
  counter: { next: number };
};
const Clock = createContext<PageClock | null>(null);

// open-slide draws slides inside its app, under Tailwind's base styles (preflight): no default margins or
// padding, border-box sizing, line-height 1.5, headings that inherit their size and weight, block images.
// The video has none of these by default, so they are given here, scoped to the slide, to make a slide in
// the video lay out exactly as it does in open-slide's editor.
const BASE = `
:where(.osd-video), :where(.osd-video) *, :where(.osd-video) ::before, :where(.osd-video) ::after { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; }
:where(.osd-video) { line-height: 1.5; -webkit-text-size-adjust: 100%; tab-size: 4; }
:where(.osd-video) :is(h1, h2, h3, h4, h5, h6) { font-size: inherit; font-weight: inherit; }
:where(.osd-video) a { color: inherit; text-decoration: inherit; }
:where(.osd-video) :is(b, strong) { font-weight: bolder; }
:where(.osd-video) small { font-size: 80%; }
:where(.osd-video) :is(ol, ul, menu) { list-style: none; }
:where(.osd-video) :is(img, svg, video, canvas, audio, iframe, embed, object) { display: block; vertical-align: middle; }
:where(.osd-video) :is(img, video) { max-width: 100%; height: auto; }
`;

export const designToCssVars = (d: DesignSystem): Record<string, string> => ({
  "--osd-bg": d.palette.bg,
  "--osd-text": d.palette.text,
  "--osd-accent": d.palette.accent,
  "--osd-font-display": d.fonts.display,
  "--osd-font-body": d.fonts.body,
  "--osd-size-hero": `${d.typeScale.hero}px`,
  "--osd-size-body": `${d.typeScale.body}px`,
  "--osd-radius": `${d.radius}px`,
});

/** One open-slide page in the video: its builds reveal at `starts` (frames from the page's start). */
export const OpenSlidePage: React.FC<{ page: Page; design: DesignSystem; starts: number[]; number: number; total: number }> = ({
  page: P,
  design,
  starts,
  number,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clock: PageClock = { frame, fps, starts, number, total, counter: { next: 0 } };
  const root = useRef<HTMLDivElement>(null);
  // every build needs a time in the video, and every time a build: page(id, Slide, [slide, build 1, …])
  useLayoutEffect(() => {
    const builds = clock.counter.next;
    if (builds !== starts.length - 1) {
      const id = (P as { id?: string }).id ?? `slide ${number}`;
      throw new Error(
        `Slide "${id}" has ${builds} build${builds === 1 ? "" : "s"} but ${starts.length} time${starts.length === 1 ? "" : "s"} in page('${id}', …, [${starts.length} numbers]): ` +
          `give it ${builds + 1} numbers, the slide's seconds and then one per build.`,
      );
    }
  });
  // a frame is taken only once the page's pictures have loaded
  useLayoutEffect(() => {
    const waiting = Array.from(root.current?.querySelectorAll("img") ?? []).filter((img) => !img.complete);
    if (waiting.length === 0) return;
    const handle = delayRender(`pictures on slide ${number}`);
    let left = waiting.length;
    const done = () => {
      left -= 1;
      if (left === 0) continueRender(handle);
    };
    for (const img of waiting) {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  });
  return (
    <VideoContext.Provider value={true}>
      <TimeContext.Provider value={frame / fps}>
        <Clock.Provider value={clock}>
          <AbsoluteFill ref={root} className="osd-video" style={{ ...(designToCssVars(design) as React.CSSProperties), background: "var(--osd-bg)", color: "var(--osd-text)", fontFamily: "var(--osd-font-body)" }}>
            <style>{BASE}</style>
            <P />
          </AbsoluteFill>
        </Clock.Provider>
      </TimeContext.Provider>
    </VideoContext.Provider>
  );
};

type StepProps = { children?: React.ReactNode; duration?: number; _index?: number };

export const Steps: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const clock = useContext(Clock);
  return (
    <>
      {Children.toArray(children).map((child) =>
        isValidElement<StepProps>(child) && child.type === Step ? cloneElement(child, { _index: clock ? clock.counter.next++ : 0 }) : child,
      )}
    </>
  );
};

export const Step: React.FC<StepProps> = ({ children, duration = 180, _index = 0 }) => {
  const clock = useContext(Clock);
  // the k-th build appears when part k + 1 of the page begins
  const at = clock ? clock.starts[_index + 1] ?? Number.POSITIVE_INFINITY : 0;
  const fade = clock ? Math.max(1, (duration / 1000) * clock.fps) : 1;
  const o = !clock ? 1 : duration <= 0 ? (clock.frame >= at ? 1 : 0) : interpolate(clock.frame, [at, at + fade], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // inside a build, time runs from the moment it is revealed (negative before)
  const t = clock ? (Number.isFinite(at) ? (clock.frame - at) / clock.fps : 0) : 0;
  return (
    <div data-osd-step={o > 0 ? "revealed" : "pending"} style={{ opacity: o, visibility: o > 0 ? "visible" : "hidden" }}>
      <TimeContext.Provider value={t}>{children}</TimeContext.Provider>
    </div>
  );
};

export const useIsActivePage = () => true;
export const useSlidePageNumber = () => {
  const clock = useContext(Clock);
  return { current: clock?.number ?? 1, total: clock?.total ?? 1 };
};

export const MorphElement: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
export const ImagePlaceholder: React.FC<{ hint?: string; width?: number; height?: number }> = ({ hint, width, height }) => (
  <div style={{ width, height, border: "2px dashed currentColor", opacity: 0.4, display: "grid", placeItems: "center", fontSize: 24 }}>{hint}</div>
);
