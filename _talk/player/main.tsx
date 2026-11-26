// The lab film, playing live in the browser: the film's own components (_film/src/Film.tsx) in a
// Remotion <Player>, so every word and line is drawn at screen resolution. The talk embeds this
// page in each slide and drives it with messages:
//   { type: "seek", frame }        show this frame, paused
//   { type: "play", from, to }     play from `from` and stop on `to`
// and hears back (each tagged source: "lab-film"):
//   { type: "ready" }              mounted, waiting for orders
//   { type: "shown", frame }       this frame is on screen, images loaded
//   { type: "rest", frame }        a play stopped on its last frame
// Build: node _talk/scripts/player.mjs

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Film, FILM_FRAMES } from "../../_film/src/Film";
import { FPS, H, W } from "../../_film/src/theme";

type Order = { type: "seek"; frame: number } | { type: "play"; from: number; to: number };

const tell = (m: Record<string, unknown>) => window.parent.postMessage({ source: "lab-film", ...m }, "*");
const nextPaint = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

const App = () => {
  const ref = useRef<PlayerRef>(null);

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    let target: number | null = null; // the frame a play stops on
    let buffering = false; // an <Img> or font is still loading
    let order = 0; // the newest order wins

    const settled = async (id: number) => {
      await nextPaint();
      while (buffering && id === order) await new Promise((r) => setTimeout(r, 30));
      return id === order;
    };
    const onFrame = (e: { detail: { frame: number } }) => {
      if (target === null || e.detail.frame < target) return;
      const stop = target;
      target = null;
      p.pause();
      p.seekTo(stop);
      tell({ type: "rest", frame: stop });
    };
    const onWaiting = () => (buffering = true);
    const onResume = () => (buffering = false);
    p.addEventListener("frameupdate", onFrame);
    p.addEventListener("waiting", onWaiting);
    p.addEventListener("resume", onResume);

    const onOrder = async (e: MessageEvent<Order>) => {
      const m = e.data;
      if (!m || typeof m !== "object" || !("type" in m)) return;
      const id = ++order;
      if (m.type === "seek") {
        target = null;
        p.pause();
        p.seekTo(m.frame);
        if (await settled(id)) tell({ type: "shown", frame: m.frame });
      } else if (m.type === "play") {
        target = null;
        p.pause();
        p.seekTo(m.from);
        if (!(await settled(id))) return;
        tell({ type: "shown", frame: m.from });
        target = m.to;
        p.play();
      }
    };
    window.addEventListener("message", onOrder);
    tell({ type: "ready" });
    return () => {
      window.removeEventListener("message", onOrder);
      p.removeEventListener("frameupdate", onFrame);
      p.removeEventListener("waiting", onWaiting);
      p.removeEventListener("resume", onResume);
    };
  }, []);

  return (
    <Player
      ref={ref}
      component={Film}
      durationInFrames={FILM_FRAMES}
      fps={FPS}
      compositionWidth={W}
      compositionHeight={H}
      style={{ width: "100%", height: "100%" }}
      initiallyMuted
      controls={false}
      clickToPlay={false}
      spaceKeyToPlayOrPause={false}
      doubleClickToFullscreen={false}
      moveToBeginningWhenEnded={false}
      acknowledgeRemotionLicense
    />
  );
};

createRoot(document.getElementById("root")!).render(<App />);
