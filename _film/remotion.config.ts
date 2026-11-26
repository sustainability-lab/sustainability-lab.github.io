import { Config } from "@remotion/cli/config";
// slides import "@open-slide/core"; in renders that is the stand-in src/talk/open-slide.tsx
import { talkWebpack } from "./talk/webpack.mjs";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setConcurrency(8);
Config.setChromiumOpenGlRenderer("angle");
Config.overrideWebpackConfig(talkWebpack(process.cwd())); // run from _film
