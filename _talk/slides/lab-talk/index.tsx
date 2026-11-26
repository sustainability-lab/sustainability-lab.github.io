import { type DesignSystem, type Page, type SlideMeta, Step, Steps } from '@open-slide/core';
import { type Context, type CSSProperties, createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import deck from './assets/deck.json';

declare global {
  interface ImportMeta {
    readonly env: Record<string, string | boolean | undefined>;
    glob: (pattern: string, options: { eager: true; import: 'default' }) => Record<string, string>;
  }
}

// The talk plays the December 2026 lab film live: each slide embeds the film's own components in
// a Remotion player (_talk/player/, built by _talk/scripts/player.mjs), so every word and line is
// drawn by the browser at screen resolution. _talk/cues.mjs says where the film rests; deck.json
// (from _talk/scripts/deck.mjs) lists each slide's rests as film frames, with a still of each,
// frames/f01234.jpg, used only for thumbnails, the overview and the moment before the player is up.
// Arriving at a slide going forward plays the film into its first rest; each → plays on to the
// next rest; ← and jumps show the rest at once. Played end to end, the slides are the film.
const FRAMES = import.meta.glob('./assets/frames/*.jpg', { eager: true, import: 'default' });
const still = (name: string) => FRAMES[`./assets/frames/${name}.jpg`];
const frameOf = (name: string) => Number(name.slice(1)); // "f01234" is film frame 1234

// The live player: served from disk by the dev server; the published deck carries it in film/.
const PLAYER_DEV = '../../player-dist/index.html';
const PLAYER = import.meta.env.DEV ? new URL(PLAYER_DEV, import.meta.url).href : `${import.meta.env.BASE_URL}film/index.html`;

type Rest = { still: string; from: string | null }; // the film plays from `from` to `still`
type SlideSpec = { id: string; title: string; open: string | null; rests: Rest[] };

// open-slide keeps its step host on globalThis; it says whether this page is the live one and how
// the presenter reached it (forward, backward, or a jump from the overview).
type Host = { isActivePage: boolean; entryDirection: 'forward' | 'backward' | 'jump' } | null;
const HOST =
  (globalThis as unknown as Record<string, Context<Host> | undefined>).__open_slide_step_host_context__ ??
  createContext<Host>(null);

// The film's tokens (_film/src/theme.ts), kept here so the Design panel shows the lab's palette.
export const design: DesignSystem = {
  palette: { bg: '#151816', text: '#eeefe9', accent: '#b52d24' },
  fonts: {
    display: 'Arial, Helvetica, sans-serif',
    body: '"DM Sans", Arial, sans-serif',
  },
  typeScale: { hero: 160, body: 32 },
  radius: 0,
};

const ROOT: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  background: 'var(--osd-bg)',
};
const LAYER: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  objectFit: 'cover',
  border: 0,
};

const LiveSlide = ({ s }: { s: SlideSpec }) => {
  const host = useContext(HOST);
  const active = host?.isActivePage ?? false;
  const forward = host?.entryDirection === 'forward';
  const rests = s.rests.map((r) => r.still);
  const last = rests.length - 1;
  const root = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLIFrameElement>(null);
  const [n, setN] = useState(last); // build steps revealed (a hostless thumbnail shows them all)
  const nRef = useRef(last);
  const ready = useRef(false);
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

  const post = (m: Record<string, unknown>) => player.current?.contentWindow?.postMessage(m, '*');

  useEffect(() => {
    if (!active) return;
    ready.current = false;
    setLive(false);
    const onMessage = (e: MessageEvent) => {
      if (e.source !== player.current?.contentWindow || e.data?.source !== 'lab-film') return;
      if (e.data.type === 'ready') {
        ready.current = true;
        const k = nRef.current;
        at.current = k;
        const enter = s.rests[0].from;
        if (forward && k === 0 && enter) post({ type: 'play', from: frameOf(enter), to: frameOf(rests[0]) });
        else post({ type: 'seek', frame: frameOf(rests[k]) });
      } else if (e.data.type === 'shown' || e.data.type === 'rest') {
        setLive(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [active]);

  // each → plays the film on to the next rest; ← and jumps go straight to the rest
  useEffect(() => {
    if (!active || !ready.current || n === at.current) return;
    if (n === at.current + 1) post({ type: 'play', from: frameOf(rests[at.current]), to: frameOf(rests[n]) });
    else post({ type: 'seek', frame: frameOf(rests[n]) });
    at.current = n;
  }, [n, active]);

  const showing = !active ? rests[last] : forward && n === 0 && s.open && !live ? s.open : rests[n];
  return (
    <div ref={root} style={ROOT}>
      <img src={still(showing)} alt={s.title} draggable={false} style={LAYER} />
      {active && (
        <iframe
          ref={player}
          src={PLAYER}
          title={s.title}
          tabIndex={-1}
          allow="autoplay"
          style={{ ...LAYER, pointerEvents: 'none', opacity: live ? 1 : 0 }}
        />
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

const SLIDES = deck.slides as SlideSpec[];

const pages: Page[] = SLIDES.map((s) => {
  const P: Page = () => <LiveSlide s={s} />;
  P.displayName = s.id;
  return P;
});

export const meta: SlideMeta = {
  title: 'Sustainability Lab, IIT Gandhinagar (December 2026)',
  createdAt: '2026-11-26T06:07:33.297Z',
};

export default pages;

// Speaker notes by slide id (the ids in _talk/cues.mjs). Shown in the presenter view (press P).
// The public copy on the lab site is built with VITE_PUBLIC=1 and leaves them out.
const NOTES: Record<string, string> = {
  cover: `The lab's title card. Press → to start the film from its first frame.`,

  hook: `Air, land, breath and power: the four things we measure. Each → draws the next line. All are real data except breathing, which is illustrative.
Air is Delhi's daily PM2.5 from 2017 to 2025 (CPCB). Land is brick kilns along the Indo-Gangetic Plain by longitude (SentinelKilnDB). Power is one Delhi home over one day (iAWE).`,

  title: `Sustainability Lab, IIT Gandhinagar. We work on AI and sensing for clean air, Earth observation, health and energy.
These slides are the December 2026 lab film, cut where it pauses: each → plays the next moment of the film.`,

  place: `We are at IIT Gandhinagar, in Gujarat.
We build sensors, collect datasets and train models for these four areas, and we release them openly. NILMTK, AirDelhi and SentinelKilnDB are all public.`,

  air: `Part 1, clean air. India measures its air with a small number of government monitors, and most cities have very few of them.`,

  stations: `Each dot is a CPCB continuous monitoring station: 535 stations in 277 cities.
Of the 271 cities in India's daily air-quality bulletin, 215 have just one station, so one sensor stands for a whole city. (SIM-air, 2024: small monitoring networks are unreliable.)`,

  field: `Between the stations we estimate PM2.5 with Gaussian processes. The map is our 2024 annual mean for India.
In Beijing our Gaussian process had an error of 24.28 µg/m³, about half of distance weighting at 48.09, and the best of the six methods we compared (AAAI 2022, Table 2).
The model's uncertainty also tells us where a new monitor would help most. That is our AAAI 2026 sensor-placement paper. The red rings are eight such sites, chosen greedily on this map to illustrate the idea.`,

  airdelhi: `Fixed stations are few, so we put low-cost sensors on Delhi buses. As the buses run their routes we get PM2.5 street by street; the heat map shows the routes.
A $30 sensor tracked a $9,500 reference monitor to within 6.16% (hourly PM2.5, one sensor, July 2021; Fig. 2).
The data is out as AirDelhi, NeurIPS 2023 Datasets and Benchmarks.`,

  filmer: `FiLMeR is a network that emulates WRF, the regional weather model. The map starts as WRF's 2 m temperature for a morning neither model was trained on, 1 January 2025, and FiLMeR's version sweeps in. Its typical error against WRF over India is 1.7 °C.
A 10-day forecast takes 281 minutes of WRF on CPUs and 6.5 seconds of FiLMeR on one GPU.
In review, so no venue. Confirm these numbers with Balbir or Deena before showing this slide outside the lab: the timings are from the submission (Table 14), and the map error is our own recomputation from the arrays.`,

  talk: `We also study how people talk about air pollution: 17,400 news articles in Samachar (two English dailies, 2010 to 2021) and 1.2 million tweets about Delhi in Vartalaap.
The chart is Delhi, redrawn from Samachar: black is air-quality articles a week, pink is PM2.5, and the dashed line is India's limit. Coverage jumps at the end of each year, when smog is visible.
Vartalaap: Delhi's tweets follow its PM2.5 only from October to December, though its air was above the WHO limit 92% of the time in 2016 to 2019 (Fig. 10, section 5.2.1).
→ The finding: the news covers big cities, not the worst air. Varanasi, averaging 114 µg/m³, got 51 stories in 2010 to 2021; Mumbai, at 49, got 647 (Samachar, Tables 3 and 4). Samachar is COMPASS 2022; Vartalaap is CSCW 2021.`,

  vayuchat: `VayuChat answers questions about air-quality data in plain language. An LLM writes the pandas code, runs it on the CPCB data and replies with the numbers.
The question here: which city had the worst air in December 2024? Byrnihat, in Assam, at 196 µg/m³, ahead of Delhi at 170.
VayuBench tests how well LLMs handle such questions by running the code they write. Both are at CODS 2025.`,

  earth: `Part 2, Earth observation. Brick kilns pollute the air across the Indo-Gangetic Plain, and they are spread over an area too large to survey on the ground.`,

  kilns: `So we find them in satellite images. The map shows 30,638 kilns across five states: Punjab, Haryana, Uttar Pradesh, Bihar and West Bengal.
SentinelKilnDB (NeurIPS 2025 Datasets and Benchmarks) has 62,671 hand-validated kilns in four countries, over 2.8 million km² of Sentinel-2 imagery.`,

  policy: `With every kiln on the map, we can check each one against the siting rules.
Over 70% break at least one rule, and 30.7 million people live within 800 m of a kiln. These numbers cover 30,638 kilns in five states (Space to Policy, ACM JCSS 2025).`,

  flowsat: `We also go the other way, from a description to a satellite image. FlowSat takes metadata, such as the kind of place and the ground resolution, and generates the image. Every image here is generated.
On image quality (FID, lower is better), FlowSat with 20 steps scores 31.10, the best of the six generators in Table 2. DiffusionSat with 100 steps scores 35.27. BMVC 2026.
The next → keeps the description and the noise fixed and turns one number, the ground resolution, from 0.30 to 1.00 m per pixel.`,

  aperture: `Aperture gets a vision-language model to read a satellite image with no training. It asks about one part at a time, each at its own scale. Here the question is "Is a tall, narrow chimney stack visible?", and each → narrows the view by one quadrant, from 4096 px down to 512 px.
Macro-F1 is 80.2%, against 69.8% for the best training-free method. Preprint, 2026.`,

  health: `Part 3, health. Measuring lung function or calories burned usually needs a clinic. We try to measure them with a phone, a mask or a camera.`,

  jouleseye: `JoulesEye adds a small thermal camera to a phone. The camera sees the nostrils warm and cool with each breath, and we estimate calories burned from the breathing rate.
Calorie error is 5.8% from breathing, against 37.6% for the smartwatch's own estimate. For overweight users the watch's error rises to 51.8%; JoulesEye's stays at 6.9% (IMWUT 2024, Table 3). With Carnegie Mellon.
If asked: the 5.8% uses chest-belt breathing with the camera's measured 2.1% breathing error added (Fig. 9). The breathing trace on the slide is illustrative, not a recording.`,

  spiromask: `SpiroMask puts a microphone inside an N95 mask. You breathe out hard, as in a clinic spirometry test, and we estimate lung function from the sound.
Mean error against a clinical spirometer, with the N95: PEF 6.3%, FEV1 5.8%, FVC 6.0%, so within 5 to 7%. It is not a medical device. ACM Transactions on Computing for Healthcare.`,

  descriptors: `Wearable data has few labels, so we train on targets the signal gives us for free: its mean and spread, how often it crosses its mean, and its spectrum. Each → adds one of them.
In this 8-second wrist PPG window the strongest rhythm is 1.56 Hz, which is 94 beats a minute; the chest ECG also says 94. Data: PPG-DaLiA. IEEE DSAA 2026.`,

  thermeval: `ThermEval tests whether vision-language models can read thermal images. Ask which of two people has the hotter forehead, nose or chest: people are right 84% of the time, the best model 74%, and 22 of 25 models do no better than a coin flip (Table 4).
KDD 2026. Ayush Shrivastava won first prize for oral presentations at ConfAI 2026 for this work.`,

  apneaeye: `ApneaEye screens for sleep apnea with a thermal camera on a stand by the bed, so nothing touches the sleeper. Patent filed in 2025.`,

  sleep: `Our sleep-staging model first measures ten things a sleep technician looks for, such as spindles, K-complexes and muscle tone, and then picks the stage from those. A clinician can check each step.
It matches a model trained on raw signals: Macro-F1 0.78 against 0.77 for four-class staging.
In review and double-blind: do not name the venue or the paper, and do not show any MESA or NSRR data.`,

  energy: `Part 4, energy. A bill tells you how much a home used, not what used it.`,

  nilm: `Energy disaggregation splits one meter's signal into appliances. This is one Delhi home on 28 July 2013, from our iAWE dataset. The → splits the meter into the air conditioner, fridge, washing machine, television and computer.`,

  nilmtk: `NILMTK is the open-source toolkit for this problem. It came out in 2014 and won the Test-of-Time Award at ACM e-Energy 2025.
It has 965 GitHub stars, 489 forks and 37 contributors, and 552 papers cite it (GitHub and Semantic Scholar, 14 Nov 2026).`,

  nilmbench: `NILMBench2026 was led by second-year undergraduates: Aayush Kuloor, Anurag Singh and Harsh Dhru. It won Best Paper Runner-Up at ACM BuildSys 2026.
It asks whether models still work in a home they never saw in training. Averaged over 15 models on UK-DALE, switch-on F1 is 0.73 for the fridge, 0.24 for the kettle and 0.15 for the microwave (Table 11).`,

  venues: `We publish at NeurIPS, KDD, AAAI, WWW, IMWUT, BMVC, BuildSys and e-Energy. Each tile is our most recent paper with a figure at that venue.`,

  people: `Life in the lab. Each → is the next photo: our PhD students with Dr. Zeel (2026), a showcase of our work at IIT Gandhinagar, the MTech graduation (2025), the alumni meet (December 2024), and the lab together (2025).`,

  alumni: `Our two PhD graduates so far: Dr. Rishiraj Adhikary, now a postdoc at the University of Cambridge with Prof. Cecilia Mascolo and a Fulbright-Nehru Fellow, and Dr. Zeel B Patel, now a postdoc at Microsoft Research India, who received the Microsoft Research India PhD Award.
Other alumni are at universities such as Cambridge, ETH Zurich, Carnegie Mellon, Johns Hopkins and IISc, and at companies such as Apple, Microsoft and Qualcomm. In all: 2 PhD graduates and 13 MTech alumni.`,

  join: `Openings: PhD, postdoc, research associate and internship. We look for people who like building things that work outside the lab; no sustainability background is needed.
Details and how to apply: sustainability-lab.github.io/join, or scan the code. One more → plays the film's closing card.`,
};

export const notes: (string | undefined)[] = import.meta.env.VITE_PUBLIC ? [] : SLIDES.map((s) => NOTES[s.id]);
