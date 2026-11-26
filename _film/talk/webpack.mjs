// Webpack settings for rendering the talk with Remotion: slide modules import "@open-slide/core",
// which here means the stand-in in src/talk/open-slide.tsx. Used by remotion.config.ts (CLI and
// studio, which pass process.cwd(), the _film folder) and by talk/scripts/deck.mjs (Node API), so
// both bundle the slides the same way. No import.meta here: Remotion compiles its config to CommonJS.
import path from "node:path";

export const talkWebpack = (filmDir) => (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      "@open-slide/core$": path.join(filmDir, "src", "talk", "open-slide.tsx"),
    },
  },
});
