import React from "react";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { AbsoluteFill, Audio, type CalculateMetadataFunction, Freeze, Sequence, staticFile } from "remotion";
import deck from "../slides/lab-talk/assets/deck.json";
import { design, PLAIN } from "../slides/lab-talk/pages";
import { Film } from "./Film";
import { OpenSlidePage } from "./talk/open-slide";
import { C, FPS } from "./theme";

// The lab talk as a video, made from the talk's own slide list (talk/cues.mjs, resolved into
// slides/lab-talk/assets/deck.json by talk/scripts/deck.mjs). The same list open-slide presents:
//   · a film slide plays its stretch of the film, music and all, with an optional `hold` at each rest;
//   · a plain page (slides/lab-talk/pages.tsx) is rendered by the open-slide stand-in, each build
//     revealed at the time talk/cues.mjs gives it, with its narration (if any) from public/.
// With no plain pages and no hold it is the film, frame for frame.
//
//   npx remotion render src/index.ts Talk out/talk.mp4
//   npx remotion render src/index.ts Talk out/talk.mp4 --props='{"hold":2}'   # rest 2 s on each stop

type Rest = { still: string; from: string | null };
type FilmSlide = { id: string; rests: Rest[] };
type PageSlide = { id: string; page: { steps: number[]; audio: string | null } };
type Slide = FilmSlide | PageSlide;
const frameOf = (name: string) => Number(name.slice(1)); // "f01234" is film frame 1234

type Part =
  | { kind: "film"; slide: string; from: number; to: number; hold: number }
  | { kind: "page"; slide: string; number: number; starts: number[]; frames: number; audio: string | null };

export type TalkTimeline = {
  parts: Part[];
  /** where each slide sits in the video, in frames; `end` is exclusive */
  slides: { id: string; start: number; end: number }[];
  frames: number;
};

export type TalkProps = { hold: number; timeline?: TalkTimeline };

/** Lay the slide list out in time. `audioSeconds` measures a plain page's narration. */
export const layOut = async (hold: number, fps: number, audioSeconds: (src: string) => Promise<number>): Promise<TalkTimeline> => {
  const slides = deck.slides as Slide[];
  const rest = Math.round(hold * fps);
  const parts: Part[] = [];
  const where: TalkTimeline["slides"] = [];
  let t = 0;
  for (const [i, s] of slides.entries()) {
    const start = t;
    if ("page" in s) {
      // parts of the page in frames; a narration longer than the page stretches its last part
      const lengths = s.page.steps.map((sec) => Math.round(sec * fps));
      const spoken = s.page.audio ? Math.ceil((await audioSeconds(staticFile(s.page.audio))) * fps) : 0;
      const shown = lengths.reduce((a, b) => a + b, 0);
      if (spoken > shown) lengths[lengths.length - 1] += spoken - shown;
      const starts = lengths.map((_, k) => lengths.slice(0, k).reduce((a, b) => a + b, 0));
      const frames = lengths.reduce((a, b) => a + b, 0);
      parts.push({ kind: "page", slide: s.id, number: i + 1, starts, frames, audio: s.page.audio });
      t += frames;
    } else {
      for (const r of s.rests) {
        if (!r.from) continue; // the cover: a still outside the running order
        parts.push({ kind: "film", slide: s.id, from: frameOf(r.from), to: frameOf(r.still), hold: rest });
        t += frameOf(r.still) - frameOf(r.from) + rest;
      }
    }
    if (t > start) where.push({ id: s.id, start, end: t });
  }
  return { parts, slides: where, frames: t };
};

export const calculateTalkMetadata: CalculateMetadataFunction<TalkProps> = async ({ props }) => {
  const timeline = await layOut(props.hold ?? 0, FPS, getAudioDurationInSeconds);
  return { durationInFrames: Math.max(1, timeline.frames), props: { ...props, timeline } };
};

export const Talk: React.FC<TalkProps> = ({ timeline }) => {
  if (!timeline) return null;
  const total = (deck.slides as Slide[]).length;
  let at = 0;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {timeline.parts.map((g, i) => {
        const start = at;
        if (g.kind === "page") {
          at += g.frames;
          const P = PLAIN[g.slide];
          return (
            <Sequence key={i} from={start} durationInFrames={g.frames} name={`${g.slide} · page`}>
              {P && <OpenSlidePage page={P} design={design} starts={g.starts} number={g.number} total={total} />}
              {g.audio && <Audio src={staticFile(g.audio)} />}
            </Sequence>
          );
        }
        const len = g.to - g.from;
        at += len + g.hold;
        return (
          <React.Fragment key={i}>
            <Sequence from={start} durationInFrames={len} name={`${g.slide} · ${g.from}–${g.to}`}>
              <Sequence from={-g.from} layout="none">
                <Film />
              </Sequence>
            </Sequence>
            {g.hold > 0 && (
              <Sequence from={start + len} durationInFrames={g.hold} name={`${g.slide} · rest`}>
                <Freeze frame={g.to}>
                  <Film />
                </Freeze>
              </Sequence>
            )}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
