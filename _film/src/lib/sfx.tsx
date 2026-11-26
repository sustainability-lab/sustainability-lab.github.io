import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { FPS } from "../theme";
import { flag } from "./env";

export type SfxName = "tick" | "ping" | "thump" | "whoosh" | "swell" | "rain_long" | "rain_short" | "typing" | "typing_fast" | "blip" | "zip" | "shimmer";

/** A sound effect at `at` seconds into the enclosing scene (files come from scripts/sfx.py). */
export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number; dur?: number }> = ({ at, name, volume = 0.4, dur = 5 }) =>
  !flag("sfx") ? null : (
  <Sequence from={Math.round(at * FPS)} durationInFrames={Math.round(dur * FPS)} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
