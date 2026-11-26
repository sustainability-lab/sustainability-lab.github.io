// Webpack settings for rendering the talk with Remotion: slide modules import "@open-slide/core",
// which here means the stand-in in src/talk/open-slide.tsx. Used by remotion.config.ts (CLI and
// studio, which pass process.cwd(), the _film folder) and by the scripts in talk/scripts (Node API),
// so all of them bundle the slides the same way. No import.meta here: Remotion compiles its config
// to CommonJS.
//
// TALK_DECK=<folder in slides/> renders another deck in place of the talk (a draft, say):
//   TALK_DECK=draft-earth node talk/scripts/stills.mjs --ids
import path from "node:path";
import webpack from "webpack";

const DECK = /slides[\\/]lab-talk[\\/]index(\.tsx)?$/;

export const talkWebpack = (filmDir) => (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      "@open-slide/core$": path.join(filmDir, "src", "talk", "open-slide.tsx"),
    },
  },
  plugins: [
    ...(config.plugins ?? []),
    ...(process.env.TALK_DECK
      ? [new webpack.NormalModuleReplacementPlugin(DECK, path.join(filmDir, "slides", process.env.TALK_DECK, "index.tsx"))]
      : []),
  ],
});
