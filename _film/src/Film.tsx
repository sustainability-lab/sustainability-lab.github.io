import React from "react";
import { AbsoluteFill, Audio, Easing, getInputProps, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
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

// Scenes in bars of the score. Change a length here and in the scene's *_LEN together.
export const SCENES: { id: string; bars: number; C: React.FC }[] = [
  { id: "hook", bars: 8, C: Hook }, //       0:00 solo piano
  { id: "place", bars: 4, C: Place }, //     0:16 the pulse enters
  { id: "air", bars: 10, C: Air }, //        0:24 strings swell at 0:32
  { id: "earth", bars: 10, C: Earth }, //    0:44 the beat drops at 0:48
  { id: "health", bars: 10, C: Health }, //  1:04 breakdown
  { id: "energy", bars: 10, C: Energy }, //  1:24 build
  { id: "work", bars: 8, C: Work }, //       1:44 climax
  { id: "people", bars: 3, C: People }, //   2:00
  { id: "alumni", bars: 6, C: Alumni }, //   2:06
  { id: "join", bars: 6, C: Join }, //       2:18 outro, final chord
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
    {F.music && (getInputProps() as { music?: boolean }).music !== false && (
      <Audio
        src={staticFile(F.music)}
        volume={(f) => interpolate(f, [FILM_FRAMES - 45, FILM_FRAMES - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    )}
  </AbsoluteFill>
);
