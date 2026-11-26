import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { F } from "./data";
import { Hook } from "./scenes/Hook";
import { Place } from "./scenes/Place";
import { Air } from "./scenes/Air";
import { Earth } from "./scenes/Earth";
import { Health } from "./scenes/Health";
import { Energy } from "./scenes/Energy";
import { Work } from "./scenes/Work";
import { People } from "./scenes/People";
import { Alumni } from "./scenes/Alumni";
import { Join } from "./scenes/Join";
import { C, FPS } from "./theme";
import { CHAPTER_KEYS } from "./lib/chapter";
import { bar } from "./timing";
import { flag } from "./lib/env";

// Scenes in bars of the score. Change a length here and in the scene's *_LEN together.
export const SCENES: { id: string; bars: number; C: React.FC }[] = [
  // December 2026: two Lyria movements (scripts/two_movements.py), each stretched from 124 to 120 BPM
  { id: "hook", bars: 12, C: Hook }, //      0:00 movement one: felt piano, no drums
  { id: "place", bars: 4, C: Place }, //     0:24
  { id: "air", bars: 32, C: Air }, //        0:32 groove A; A2 at 1:02 under AirDelhi
  { id: "earth", bars: 22, C: Earth }, //    1:36 darker groove B, quiet close from 2:08
  { id: "health", bars: 32, C: Health }, //  2:20 movement two: piano, breathing pads
  { id: "energy", bars: 17, C: Energy }, //  3:24 the build, with kick
  { id: "work", bars: 7, C: Work }, //       3:58 breakdown and riser under the venue wall
  { id: "people", bars: 10, C: People }, //  4:12 the peak
  { id: "alumni", bars: 6, C: Alumni }, //   4:32 peak
  { id: "join", bars: 6, C: Join }, //       4:44 the final chord
];

const starts = SCENES.reduce<number[]>((acc, s, i) => [...acc, acc[i] + s.bars], [0]);
const frameAt = (b: number) => Math.max(0, Math.round(bar(b) * FPS));
export const FILM_FRAMES = frameAt(starts[SCENES.length]) + Math.round(1.0 * FPS);

const WIPE = 9; // frames

const RedWipe: React.FC<{ color?: string }> = ({ color = C.red }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, WIPE], [100, 0], { easing: Easing.bezier(0.7, 0, 0.3, 1), extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: color, transform: `translateX(${x}%)` }} />;
};

export const Film: React.FC = () => (
  <AbsoluteFill style={{ background: C.night }}>
    {SCENES.map((s, i) => {
      const from = frameAt(starts[i]);
      const to = i === SCENES.length - 1 ? FILM_FRAMES : frameAt(starts[i + 1]);
      return (
        <Sequence key={s.id} from={from} durationInFrames={to - from} name={s.id}>
          <s.C />
        </Sequence>
      );
    })}
    <Sequence from={frameAt(starts[SCENES.findIndex((s) => s.id === "work")]) - WIPE} durationInFrames={WIPE} name="wipe:work">
      <RedWipe color={C.paper} />
    </Sequence>
    {SCENES.map((s, i) =>
      CHAPTER_KEYS.includes(s.id) ? (
        <Sequence key={`wipe-${s.id}`} from={frameAt(starts[i]) - WIPE} durationInFrames={WIPE} name={`wipe:${s.id}`}>
          <RedWipe />
        </Sequence>
      ) : null,
    )}
    {F.music && flag("music") && (
      <Audio
        src={staticFile(F.music)}
        volume={(f) => interpolate(f, [FILM_FRAMES - 45, FILM_FRAMES - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    )}
  </AbsoluteFill>
);
