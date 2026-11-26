import React from "react";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { AbsoluteFill, Audio, type CalculateMetadataFunction, interpolate, Sequence, staticFile } from "remotion";
import pages, { design } from "../slides/lab-talk/index";
import { F } from "./data";
import type { TalkPage } from "./talk/kit";
import { OpenSlidePage } from "./talk/open-slide";
import { C, FPS } from "./theme";
import { crossfade, scoreParts } from "./talk/score";

// The lab talk as a video, made from the talk's slides (the deck's index.tsx), the same pages open-slide
// presents. Each slide is drawn by the stand-in for open-slide (src/talk/open-slide.tsx) for the seconds its
// page(id, Slide, [seconds…]) gives: the first number is the slide before any build, then one per build, and
// each build is revealed at its time. The film's score plays underneath (src/talk/score.ts) and fades out at the end.
//
//   npx remotion render src/index.ts Talk out/talk/talk.mp4
//   npx remotion render src/index.ts Talk out/talk/talk.mp4 --props='{"music":false}'

export type TalkTimeline = {
  /** where each slide sits in the video, in frames, and when each of its builds is revealed (from its start) */
  slides: { id: string; start: number; frames: number; starts: number[] }[];
  frames: number;
  /** length of the score, in frames (0: no music) */
  music: number;
};

export type TalkProps = { music: boolean; timeline?: TalkTimeline };

const SCORE = F.music || null; // a path in public/, as the film uses it

/** Lay the slides out in time. */
export const layOut = (fps: number): Omit<TalkTimeline, "music"> => {
  let t = 0;
  const slides = (pages as TalkPage[]).map((P) => {
    const lengths = (P.video?.length ? P.video : [5]).map((s) => Math.max(1, Math.round(s * fps)));
    const starts = lengths.map((_, k) => lengths.slice(0, k).reduce((a, b) => a + b, 0));
    const frames = lengths.reduce((a, b) => a + b, 0);
    const slide = { id: P.id, start: t, frames, starts };
    t += frames;
    return slide;
  });
  return { slides, frames: t };
};

/** Length of the score in frames. A missing score stops the render: a talk video without its music is a mistake. */
const scoreFrames = async (): Promise<number> => {
  if (!SCORE) throw new Error("The talk's video asks for music, but film.yml names no score (music:). Add one, or render with --props='{\"music\":false}'.");
  try {
    return Math.floor((await getAudioDurationInSeconds(staticFile(SCORE))) * FPS);
  } catch (e) {
    throw new Error(`The talk's music, public/${SCORE}, could not be read (${(e as Error).message}). Run uv run scripts/prep.py to stage it, or render with --props='{"music":false}'.`);
  }
};

export const calculateTalkMetadata: CalculateMetadataFunction<TalkProps> = async ({ props }) => {
  const music = props.music === false ? 0 : await scoreFrames();
  const timeline = { ...layOut(FPS), music };
  return { durationInFrames: Math.max(1, timeline.frames), props: { ...props, timeline } };
};

const FADE = crossfade(FPS);

export const Talk: React.FC<TalkProps> = ({ timeline }) => {
  if (!timeline) return null;
  const list = pages as TalkPage[];
  const parts = scoreParts(timeline.frames, timeline.music, FPS);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {timeline.slides.map((s, i) => (
        <Sequence key={s.id} from={s.start} durationInFrames={s.frames} name={s.id}>
          <OpenSlidePage page={list[i]} design={design} starts={s.starts} number={i + 1} total={list.length} />
        </Sequence>
      ))}
      {SCORE &&
        parts.map(({ at, from, len }, i) => {
          const last = i === parts.length - 1;
          // each piece runs FADE frames into the next, fading out as the next fades in; the last fades with the
          // talk. A piece never runs past the end of the score.
          const dur = Math.min(last ? len : len + FADE, timeline.music - from);
          const fadeIn = i === 0 ? 0 : FADE;
          const fadeOut = last ? 2 * FPS : FADE;
          return (
            <Sequence key={i} from={at} durationInFrames={dur} name={`score ${i + 1}`}>
              <Audio
                src={staticFile(SCORE)}
                trimBefore={from}
                volume={(f) =>
                  Math.min(
                    fadeIn ? interpolate(f, [0, fadeIn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1,
                    interpolate(f, [dur - fadeOut, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  )
                }
              />
            </Sequence>
          );
        })}
    </AbsoluteFill>
  );
};
