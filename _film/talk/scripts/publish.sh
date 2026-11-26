#!/usr/bin/env bash
# Build the public copy of the talk into a site checkout's talk/ folder.
#
#   bash _film/talk/scripts/publish.sh /path/to/a/checkout/of/main
#   cd /path/to/a/checkout/of/main && git add talk && git commit -m "Update the lab talk" && git push
#
# The site serves talk/ as it is (_quarto.yml → resources), so the push to main redeploys it.
# The public copy has no speaker notes (VITE_PUBLIC=1). GitHub Pages has no rewrites, so the app
# shell is also copied to talk/s/lab-talk/, and talk/index.html redirects there. The film slides
# draw the film live and read its images through staticFile(), from talk/film/.
set -euo pipefail

SITE="${1:?usage: publish.sh <checkout of main>}"
FILM="$(cd "$(dirname "$0")/../.." && pwd)" # _film/talk/scripts → _film
OUT="$SITE/talk"

[ -f "$FILM/public/film.json" ] || { echo "no public/film.json: run uv run _film/scripts/prep.py" >&2; exit 1; }
rm -rf "$OUT"
(cd "$FILM" && OPEN_SLIDE_BASE=/talk/ VITE_PUBLIC=1 npx open-slide build --out-dir "$OUT")
mkdir -p "$OUT/s/lab-talk"
cp "$OUT/index.html" "$OUT/s/lab-talk/index.html"
cat > "$OUT/index.html" <<'HTML'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Sustainability Lab, IIT Gandhinagar: lab talk</title>
<meta http-equiv="refresh" content="0; url=/talk/s/lab-talk/">
<link rel="canonical" href="/talk/s/lab-talk/">
<script>location.replace("/talk/s/lab-talk/" + location.search + location.hash);</script>
</head>
<body><p><a href="/talk/s/lab-talk/">Open the lab talk</a></p></body>
</html>
HTML
# the film's images, for staticFile() in the live film slides (no audio: the talk plays silent)
mkdir -p "$OUT/film"
cp -R "$FILM/public/img" "$OUT/film/img"
if grep -rqs "Balbir" "$OUT"; then echo "speaker notes leaked into the public copy" >&2; exit 1; fi
du -sh "$OUT"
