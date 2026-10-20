import React from "react";
import { Audio, getInputProps, Sequence, staticFile } from "remotion";
import { FPS } from "../theme";

export type SfxName = "tick" | "ping" | "thump" | "whoosh" | "swell" | "rain_long" | "rain_short" | "typing" | "typing_fast" | "blip" | "zip" | "shimmer";

const ON = (getInputProps() as { sfx?: boolean }).sfx !== false;

/** A sound effect at `at` seconds into the enclosing scene (files come from scripts/sfx.py). */
export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number; dur?: number }> = ({ at, name, volume = 0.4, dur = 5 }) =>
  !ON ? null : (
  <Sequence from={Math.round(at * FPS)} durationInFrames={Math.round(dur * FPS)} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
