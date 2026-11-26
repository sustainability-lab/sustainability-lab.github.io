import React from "react";
import { AbsoluteFill, Freeze, Sequence } from "remotion";
import deck from "../../_talk/slides/lab-talk/assets/deck.json";
import { Film } from "./Film";
import { C } from "./theme";

// The lab talk as a video, made from the talk's own slide list (_talk/cues.mjs, resolved into
// _talk/slides/lab-talk/assets/deck.json by _talk/scripts/deck.mjs): every slide's stretch of the
// film, in the deck's order, with an optional hold on each rest. With no hold it is the film,
// music and all; drop or reorder a slide in the deck and the video follows.
//
//   npx remotion render src/index.ts Talk out/talk.mp4                      # = the film
//   npx remotion render src/index.ts Talk out/talk.mp4 --props='{"hold":2}' # rest 2 s on each pause (silent while resting)

type Rest = { still: string; from: string | null };
type Slide = { id: string; rests: Rest[] };
const frameOf = (name: string) => Number(name.slice(1)); // "f01234" is film frame 1234

/** The film's frames in deck order: one segment per rest, from the previous rest to this one. */
export const segments = (deck.slides as Slide[]).flatMap((s) =>
  s.rests.filter((r) => r.from).map((r) => ({ slide: s.id, from: frameOf(r.from as string), to: frameOf(r.still) })),
);

export type TalkProps = { hold: number }; // seconds to rest on each pause point

export const talkFrames = ({ hold }: TalkProps, fps: number) =>
  segments.reduce((n, g) => n + (g.to - g.from) + Math.round(hold * fps), 0);

export const Talk: React.FC<TalkProps & { fps?: number }> = ({ hold, fps = 30 }) => {
  const rest = Math.round(hold * fps);
  let at = 0;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {segments.map((g, i) => {
        const start = at;
        const len = g.to - g.from;
        at += len + rest;
        return (
          <React.Fragment key={i}>
            <Sequence from={start} durationInFrames={len} name={`${g.slide} · ${g.from}–${g.to}`}>
              <Sequence from={-g.from} layout="none">
                <Film />
              </Sequence>
            </Sequence>
            {rest > 0 && (
              <Sequence from={start + len} durationInFrames={rest} name={`${g.slide} · rest`}>
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
