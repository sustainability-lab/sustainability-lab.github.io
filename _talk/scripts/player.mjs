// Build the live film player that the talk embeds: _talk/player/ → _talk/player-dist/.
//
//   node _talk/scripts/player.mjs
//
// It bundles the film's own source (_film/src) with the film's own packages, so React and Remotion
// exist once, and copies the film's images (public/img) next to the page for staticFile().
// Audio is left out: the talk plays the film silent.

import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TALK = path.resolve(HERE, "..");
const FILM = path.resolve(TALK, "../_film");
const OUT = path.join(TALK, "player-dist");
const fromFilm = createRequire(path.join(FILM, "package.json"));
const esbuild = fromFilm("esbuild");
const pkg = (name) => path.dirname(fromFilm.resolve(`${name}/package.json`));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const result = await esbuild.build({
  entryPoints: [path.join(TALK, "player", "main.tsx")],
  outfile: path.join(OUT, "player.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  minify: true,
  sourcemap: true,
  metafile: true,
  // one React and one Remotion, the film's, for the film and for @remotion/player alike
  alias: { react: pkg("react"), "react-dom": pkg("react-dom"), remotion: pkg("remotion") },
  nodePaths: [path.join(TALK, "node_modules")], // @remotion/player lives in _talk
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});
fs.copyFileSync(path.join(TALK, "player", "index.html"), path.join(OUT, "index.html"));
fs.cpSync(path.join(FILM, "public", "img"), path.join(OUT, "img"), { recursive: true });

const js = fs.statSync(path.join(OUT, "player.js")).size / 1e6;
const img = fs.readdirSync(path.join(OUT, "img"), { recursive: true }).length;
const remotions = Object.keys(result.metafile.inputs).filter((f) => /node_modules\/remotion\/dist\/esm\/index/.test(f));
console.log(`player-dist: player.js ${js.toFixed(2)} MB, ${img} image files; remotion copies bundled: ${remotions.length}`);
