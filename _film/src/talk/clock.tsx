import { useIsActivePage } from "@open-slide/core";
import React, { type Context, createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { END, TimeContext, VideoContext } from "../lib/time";

// Clocks for the talk's slides in open-slide. A slide's motion is written against time, as the film's is
// (useT in src/lib/motion.tsx). In open-slide a page's clock starts when you arrive on it going forward, and a
// build's clock when → reveals it. A page you jump to, or come back to, shows its finished state, and so do
// thumbnails, the overview and printing. In the video, src/talk/open-slide.tsx sets the time from the frame
// instead, and these clocks step aside.

type Host = { isActivePage: boolean; entryDirection: "forward" | "backward" | "jump" } | null;
const NO_HOST = createContext<Host>(null);

/** open-slide's step host: is this the page on screen, and how did the presenter get here? */
const useHost = (): Host => {
  useIsActivePage(); // keeps @open-slide/core loaded, which creates the host context below
  const ctx = (globalThis as unknown as Record<string, Context<Host> | undefined>).__open_slide_step_host_context__;
  return useContext(ctx ?? NO_HOST);
};

/** Seconds since `on` became true, ticking every frame until `settle` seconds, then END. END while off. */
const useClock = (on: boolean, settle: number): number => {
  const [t, setT] = useState(END);
  useLayoutEffect(() => {
    if (!on) {
      setT(END);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const s = (performance.now() - t0) / 1000;
      if (s >= settle) return setT(END); // stop re-rendering once the motion is over, so editing is calm
      setT(s);
      raf = requestAnimationFrame(tick);
    };
    setT(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, settle]);
  return t;
};

/** The clock of one slide. <Frame> puts it around every page. */
export const PageClock: React.FC<{ settle?: number; children: React.ReactNode }> = ({ settle = 12, children }) => {
  const video = useContext(VideoContext);
  const host = useHost();
  const t = useClock(!video && !!host?.isActivePage && host.entryDirection === "forward", settle);
  if (video) return <>{children}</>;
  return <TimeContext.Provider value={t}>{children}</TimeContext.Provider>;
};

/** The clock of one build: 0 while hidden, running from the moment → reveals it. The kit's <Step> uses it. */
export const StepClock: React.FC<{ settle?: number; children: React.ReactNode }> = ({ settle = 10, children }) => {
  const video = useContext(VideoContext);
  const host = useHost();
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"pending" | "shown" | "live">("shown");
  useLayoutEffect(() => {
    if (video) return;
    const step = ref.current?.closest("[data-osd-step]");
    if (!step) return;
    const revealed = () => step.getAttribute("data-osd-step") === "revealed";
    setState(revealed() ? "shown" : "pending");
    const watch = new MutationObserver(() => setState((s) => (!revealed() ? "pending" : s === "pending" ? "live" : s)));
    watch.observe(step, { attributes: true, attributeFilter: ["data-osd-step"] });
    return () => watch.disconnect();
  }, [video]);
  const t = useClock(state === "live" && !!host?.isActivePage, settle);
  if (video) return <>{children}</>;
  return (
    <div ref={ref} style={{ display: "contents" }}>
      <TimeContext.Provider value={state === "pending" ? 0 : state === "live" ? t : END}>{children}</TimeContext.Provider>
    </div>
  );
};
