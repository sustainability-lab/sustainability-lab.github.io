import { Step, Steps } from '@open-slide/core';
import { Player, type PlayerRef } from '@remotion/player';
import { type Context, type CSSProperties, createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Film, FILM_FRAMES } from '../../src/Film';
import { FPS, H, W } from '../../src/theme';

declare global {
  interface ImportMeta {
    readonly env: Record<string, string | boolean | undefined>;
    glob: (pattern: string, options: { eager: true; import: 'default' }) => Record<string, string>;
  }
}

// Film slides in open-slide: the film's own components (src/Film.tsx) run in a Remotion player
// inside the page, so every word and line is drawn at screen resolution. The slide stops at its
// rests (talk/cues.mjs → assets/deck.json): arriving going forward plays the film into the first
// rest, each → plays on to the next, and ← or a jump shows the rest at once. Stills of each rest
// (assets/frames/) stand in for thumbnails, the overview and the moment before the player is up.
// This module is open-slide only (Vite); the video renders the film directly (src/Talk.tsx).

const FRAMES = import.meta.glob('./assets/frames/*.jpg', { eager: true, import: 'default' });
const still = (name: string) => FRAMES[`./assets/frames/${name}.jpg`];
const frameOf = (name: string) => Number(name.slice(1)); // "f01234" is film frame 1234

// staticFile() in the film reads the film's public/ folder: from disk in development, from film/
// next to the published deck (talk/scripts/publish.sh copies it there).
const PUBLIC_DEV = '../../public';
(window as unknown as { remotion_staticBase?: string }).remotion_staticBase = import.meta.env.DEV
  ? new URL(PUBLIC_DEV, import.meta.url).pathname.replace(/\/$/, '')
  : `${import.meta.env.BASE_URL}film`;

export type Rest = { still: string; from: string | null }; // the film plays from `from` to `still`
export type FilmSpec = { id: string; title: string; open: string | null; rests: Rest[] };

// open-slide keeps its step host on globalThis; it says whether this page is the live one and how
// the presenter reached it (forward, backward, or a jump from the overview).
type Host = { isActivePage: boolean; entryDirection: 'forward' | 'backward' | 'jump' } | null;
const HOST =
  (globalThis as unknown as Record<string, Context<Host> | undefined>).__open_slide_step_host_context__ ??
  createContext<Host>(null);

const LAYER: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  objectFit: 'cover',
  border: 0,
};

const nextPaint = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const FilmSlide = ({ s }: { s: FilmSpec }) => {
  const host = useContext(HOST);
  const active = host?.isActivePage ?? false;
  const forward = host?.entryDirection === 'forward';
  const rests = s.rests.map((r) => r.still);
  const last = rests.length - 1;
  const root = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const go = useRef<((from: number, to: number, play: boolean) => void) | null>(null);
  const [n, setN] = useState(last); // build steps revealed (a hostless thumbnail shows them all)
  const nRef = useRef(last);
  const at = useRef(last); // the rest the player was last sent to
  const [live, setLive] = useState(false); // the player is drawing; the still can go

  // count the → presses: one hidden <Step> per rest after the first
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const count = () => el.querySelectorAll('[data-osd-step="revealed"]').length;
    const sync = () => {
      nRef.current = count();
      setN(nRef.current);
    };
    sync();
    const watch = new MutationObserver(sync);
    watch.observe(el, { attributes: true, subtree: true, attributeFilter: ['data-osd-step'] });
    return () => watch.disconnect();
  }, [active]);

  // drive the player: seek, or play from one frame and stop exactly on another
  useEffect(() => {
    const p = player.current;
    if (!active || !p) return;
    let alive = true;
    let order = 0;
    let target: number | null = null;
    let buffering = false; // an image or font is still loading
    const onFrame = (e: { detail: { frame: number } }) => {
      if (target === null || e.detail.frame < target) return;
      const stop = target;
      target = null;
      p.pause();
      p.seekTo(stop);
    };
    const onWaiting = () => (buffering = true);
    const onResume = () => (buffering = false);
    p.addEventListener('frameupdate', onFrame);
    p.addEventListener('waiting', onWaiting);
    p.addEventListener('resume', onResume);
    go.current = async (from, to, play) => {
      const id = ++order;
      target = null;
      p.pause();
      p.seekTo(play ? from : to);
      await nextPaint();
      while (alive && buffering && id === order) await sleep(30);
      if (!alive || id !== order) return;
      setLive(true);
      if (play) {
        target = to;
        p.play();
      }
    };
    const k = nRef.current;
    at.current = k;
    const enter = s.rests[0].from;
    if (forward && k === 0 && enter) go.current(frameOf(enter), frameOf(rests[0]), true);
    else go.current(0, frameOf(rests[k]), false);
    return () => {
      alive = false;
      go.current = null;
      p.removeEventListener('frameupdate', onFrame);
      p.removeEventListener('waiting', onWaiting);
      p.removeEventListener('resume', onResume);
    };
  }, [active]);

  // each → plays the film on to the next rest; ← and jumps go straight to the rest
  useEffect(() => {
    if (!active || !go.current || n === at.current) return;
    if (n === at.current + 1) go.current(frameOf(rests[at.current]), frameOf(rests[n]), true);
    else go.current(0, frameOf(rests[n]), false);
    at.current = n;
  }, [n, active]);

  const showing = !active ? rests[last] : forward && n === 0 && s.open && !live ? s.open : rests[n];
  return (
    <div ref={root} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#151816' }}>
      <img src={still(showing)} alt={s.title} draggable={false} style={LAYER} />
      {active && (
        <div style={{ ...LAYER, pointerEvents: 'none', opacity: live ? 1 : 0 }}>
          <Player
            ref={player}
            component={Film}
            durationInFrames={FILM_FRAMES}
            fps={FPS}
            compositionWidth={W}
            compositionHeight={H}
            style={{ width: '100%', height: '100%' }}
            initialFrame={frameOf(s.open ?? rests[last])}
            initiallyMuted
            controls={false}
            clickToPlay={false}
            spaceKeyToPlayOrPause={false}
            doubleClickToFullscreen={false}
            moveToBeginningWhenEnded={false}
            acknowledgeRemotionLicense
          />
        </div>
      )}
      {last > 0 && (
        <Steps>
          {rests.slice(1).map((r) => (
            <Step key={r} duration={0}>
              <span />
            </Step>
          ))}
        </Steps>
      )}
    </div>
  );
};
