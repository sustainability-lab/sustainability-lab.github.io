// The talk is the lab film (_film/), cut at its rest points. This file says where.
//
// A cue is a frame the presenter rests on: the last frame before the film's next motion starts.
// The deck plays the film from one cue to the next, so together the segments are the whole film,
// frame for frame. Each slide is a run of cues:
//   · arriving at a slide going forward plays the film from the previous slide's last cue to this
//     slide's first cue (the film's own transition) by itself;
//   · each → then plays the film to the slide's next cue and rests there;
//   · a slide reached by ←, a jump or a thumbnail shows its last cue.
//
// Write a cue as "<scene>@<time>": seconds into a scene of _film/src/Film.tsx (SCENES). For the
// chapter scenes, <time> can start from a beat key of the scene's `const T = {…}` table, so a cue
// moves with its beat when the film is retimed: "air@st+3.95", "air@fi-0.5". "end" is the scene's
// last moment. Slide ids that match film.yml beats are checked against it. `cover` shows one
// frame outside the running order; `from` starts a slide's opening segment at a given cue; a slide
// that follows a plain page opens from the start of its scene.
//
// After editing: node _film/talk/scripts/deck.mjs (renders every segment and rest still from the film).

export const DECK = [
  // The cover: the film's title card, shown outside the running order. A deck opens on its first
  // slide fully built, so the film starts from the slide after it: → plays the film from its first
  // frame to "Air.", and each → after that draws the next line.
  { id: "cover", title: "Sustainability Lab, IIT Gandhinagar. AI for a sustainable future.", cover: "hook@23.05" },
  { id: "hook", title: "Air. Land. Breath. Power.", from: "hook@0", cues: ["hook@3.95", "hook@7.95", "hook@11.95", "hook@15.85"] },
  { id: "title", title: "Sustainability Lab, IIT Gandhinagar. AI for a sustainable future.", cues: ["hook@23.05"], pdf: false },
  { id: "place", title: "IIT Gandhinagar. We build sensors, datasets and machine learning, and we release them openly.", cues: ["place@4.55", "place@7.6"] },

  // A plain open-slide page (slides/lab-talk/pages.tsx), not a stretch of the film. `steps` are its
  // lengths in the video, in seconds: the page as it opens, then each → build in turn. `audio` (optional)
  // is a narration file under public/; the page then lasts at least as long as its narration.
  { id: "agenda", title: "Four problems.", page: true, steps: [2.5, 2, 2, 2, 3.5] },

  // 01 Clean air
  { id: "air", title: "01 Clean Air. Most Indian cities have few air monitors.", cues: ["air@1.0", "air@dock-0.05"] },
  { id: "stations", title: "535 government monitors cover 277 cities.", cues: ["air@st+3.95", "air@fi-0.5"] },
  { id: "field", title: "Our models fill the gaps, and pick where the next monitor should go.", cues: ["air@fi+3.45", "air@ad-0.6"] },
  { id: "airdelhi", title: "Sensors on Delhi's buses map its air, street by street.", cues: ["air@ad+3.45", "air@fm-0.5"] },
  { id: "filmer", title: "A network stands in for India's weather model.", cues: ["air@fm+3.95", "air@tk-0.5"] },
  { id: "talk", title: "And we read how India talks about its air.", cues: ["air@tk+2.55", "air@vc-0.5"] },
  { id: "vayuchat", title: "Anyone can ask the data a question.", cues: ["air@vc+1.15", "air@end-0.4"] },

  // 02 Earth observation
  { id: "earth", title: "02 Earth Observation. Brick kilns are spread over areas too large to survey.", cues: ["earth@1.0", "earth@dock-0.05"] },
  { id: "kilns", title: "So we find them from space: 30,638 kilns across five states.", cues: ["earth@sk-0.5"] },
  { id: "policy", title: "Then check each one against siting rules.", cues: ["earth@po+2.95", "earth@fs-0.5"] },
  { id: "flowsat", title: "And generate satellite images from metadata.", cues: ["earth@fs+2.95", "earth@fs+4.38", "earth@ap-0.5"] },
  { id: "aperture", title: "And make satellite models say what they see.", cues: ["earth@ap+2.0", "earth@ap+4.6", "earth@ap+7.2", "earth@end-0.4"] },

  // 03 Health sensing
  { id: "health", title: "03 Health Sensing. Measuring lung function or calories burned usually needs a clinic.", cues: ["health@1.0", "health@dock-0.05"] },
  { id: "jouleseye", title: "A thermal camera on a phone reads your breathing.", cues: ["health@je+4.45", "health@sp-0.5"] },
  { id: "spiromask", title: "A microphone inside an N95 mask measures lung function.", cues: ["health@sp+3.45", "health@sd-0.5"] },
  { id: "descriptors", title: "Wearable signals can teach themselves.", cues: ["health@sd+2.25", "health@sd+3.55", "health@sd+4.85", "health@te-0.5"] },
  { id: "thermeval", title: "We test where vision-language models fail on thermal images.", cues: ["health@te+3.45", "health@ap-0.5"] },
  { id: "apneaeye", title: "And screen for sleep apnea without touching the sleeper.", cues: ["health@sl-0.5"] },
  { id: "sleep", title: "And stage sleep with evidence a clinician can check.", cues: ["health@sl+2.95", "health@end-0.4"] },

  // 04 Energy
  { id: "energy", title: "04 Energy. A bill says how much a home used, not what used it.", cues: ["energy@1.0", "energy@dock-0.05"] },
  { id: "nilm", title: "We split one meter's signal into appliances.", cues: ["energy@nl+1.95", "energy@tk-0.5"] },
  { id: "nilmtk", title: "NILMTK, the open-source toolkit the field has used since 2014.", cues: ["energy@tk+2.45", "energy@nb-0.5"] },
  { id: "nilmbench", title: "NILMBench2026 was led by second-year undergraduates.", cues: ["energy@nb+2.95", "energy@end-0.4"] },

  // The lab
  { id: "venues", title: "Published at NeurIPS, KDD, AAAI, WWW, IMWUT, BMVC, BuildSys and e-Energy.", cues: ["work@end-0.05"] },
  // The photos push in the whole time, so this scene never holds still: its cues are the cuts.
  { id: "people", title: "Life in the lab.", cues: ["people@3.95", "people@7.95", "people@11.95", "people@15.95", "people@19.95"], holds: false },
  { id: "alumni", title: "Where our alumni are now.", cues: ["alumni@end-0.45"] },
  { id: "join", title: "Join us. sustainability-lab.github.io/join", cues: ["join@7.95", "join@end-0.1"] },
];
