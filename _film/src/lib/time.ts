import { createContext } from "react";

/** Seconds since the enclosing slide or build began. Unset (null) in the film, which runs on Remotion's frame clock. */
export const TimeContext = createContext<number | null>(null);

/** True while the video renders the talk's slides frame by frame (src/talk/open-slide.tsx sets it). */
export const VideoContext = createContext(false);

/** A time after every animation has finished: what a slide shows when you jump to it or come back to it. */
export const END = 1e5;
