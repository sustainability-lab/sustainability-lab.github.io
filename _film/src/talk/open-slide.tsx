import React, { Children, cloneElement, createContext, isValidElement, useContext } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// A stand-in for @open-slide/core, so slides written for open-slide render frame by frame in the
// video. The talk's pages (slides/lab-talk/pages.tsx) import "@open-slide/core"; when Remotion
// bundles them, webpack points that import here (talk/webpack.mjs). Builds that open-slide reveals
// on → are revealed here at the times the talk's timeline gives them (src/Talk.tsx).
//
// Covers what the talk's pages use: Steps and Step (fading in over `duration` ms), the page hooks,
// design tokens as CSS variables, and the type names. Motion should come from Steps or from
// time-driven components (src/lib/motion.tsx); CSS transitions and keyframes do not advance frame
// by frame and will not show in the video.

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
  return (
    <Clock.Provider value={clock}>
      <AbsoluteFill style={{ ...(designToCssVars(design) as React.CSSProperties), background: "var(--osd-bg)", color: "var(--osd-text)", fontFamily: "var(--osd-font-body)" }}>
        <P />
      </AbsoluteFill>
    </Clock.Provider>
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
  const o = clock ? interpolate(clock.frame, [at, at + fade], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <div data-osd-step={o > 0 ? "revealed" : "pending"} style={{ opacity: o, visibility: o > 0 ? "visible" : "hidden" }}>
      {children}
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
