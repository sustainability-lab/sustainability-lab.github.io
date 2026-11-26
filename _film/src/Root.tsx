import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "./theme";
import { Film, FILM_FRAMES } from "./Film";
import { Hook, HOOK_LEN } from "./scenes/Hook";
import { Place, PLACE_LEN } from "./scenes/Place";
import { Air, AIR_LEN } from "./scenes/Air";
import { Earth, EARTH_LEN } from "./scenes/Earth";
import { Health, HEALTH_LEN } from "./scenes/Health";
import { Energy, ENERGY_LEN } from "./scenes/Energy";
import { Work, WORK_LEN } from "./scenes/Work";
import { People, PEOPLE_LEN } from "./scenes/People";
import { Alumni, ALUMNI_LEN } from "./scenes/Alumni";
import { Join, JOIN_LEN } from "./scenes/Join";
import { Poster } from "./scenes/Poster";
import { Talk, talkFrames, type TalkProps } from "./Talk";

const f = (s: number) => Math.round(s * FPS);

export const Root: React.FC = () => (
  <>
    <Composition id="Poster" component={Poster} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{ variant: "full" as const }} />
    <Composition id="PosterWeb" component={Poster} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{ variant: "web" as const }} />
    <Composition id="LabFilm" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} />
    {/* the talk's slides as a video (src/Talk.tsx); hold = seconds to rest on each pause point */}
    <Composition
      id="Talk"
      component={Talk}
      durationInFrames={talkFrames({ hold: 0 }, FPS)}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ hold: 0 } as TalkProps}
      calculateMetadata={({ props }) => ({ durationInFrames: talkFrames(props as TalkProps, FPS) })}
    />
    <Composition id="Hook" component={Hook} durationInFrames={f(HOOK_LEN)} fps={FPS} width={W} height={H} />
    <Composition id="Work" component={Work} durationInFrames={f(WORK_LEN)} fps={FPS} width={W} height={H} />
    <Composition id="People" component={People} durationInFrames={f(PEOPLE_LEN)} fps={FPS} width={W} height={H} />
    <Composition id="Alumni" component={Alumni} durationInFrames={f(ALUMNI_LEN)} fps={FPS} width={W} height={H} />
    <Composition id="Join" component={Join} durationInFrames={f(JOIN_LEN)} fps={FPS} width={W} height={H} />
    <Composition id="Health" component={Health} durationInFrames={f(HEALTH_LEN)} fps={FPS} width={W} height={H} />
    <Composition id="Energy" component={Energy} durationInFrames={f(ENERGY_LEN)} fps={FPS} width={W} height={H} />
    <Composition id="Earth" component={Earth} durationInFrames={f(EARTH_LEN)} fps={FPS} width={W} height={H} />
    <Composition id="Air" component={Air} durationInFrames={f(AIR_LEN)} fps={FPS} width={W} height={H} />
    <Composition id="Place" component={Place} durationInFrames={f(PLACE_LEN)} fps={FPS} width={W} height={H} />
  </>
);
