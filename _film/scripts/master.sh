#!/usr/bin/env bash
# Master the rendered film: loudness to -14 LUFS (web/YouTube), true peak <= -1.5 dBTP, video untouched.
#   scripts/master.sh out/lab-film-raw.mp4 out/lab-film.mp4
set -euo pipefail
in=$1
out=$2
target="I=-14:TP=-1.5:LRA=16"
json=$(ffmpeg -hide_banner -nostats -i "$in" -af "loudnorm=$target:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { python3 -c "import json,sys; print(json.loads(sys.argv[1])['$1'])" "$json"; }
ffmpeg -hide_banner -loglevel error -y -i "$in" -c:v copy \
  -af "loudnorm=$target:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 256k -movflags +faststart "$out"
ffmpeg -hide_banner -nostats -i "$out" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|Peak:" | tr -s ' '
