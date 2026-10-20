#!/usr/bin/env bash
# A lighter 1080p encode of the master for the website (the `film` release asset).
#   scripts/web.sh out/lab-film.mp4 out/web
set -euo pipefail
in=$1
dir=$2
mkdir -p "$dir"
ffmpeg -hide_banner -loglevel error -y -i "$in" -c:v libx264 -preset slow -crf 23 -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 160k -movflags +faststart "$dir/lab-film.mp4"
ls -la "$dir/lab-film.mp4"
