import { type DesignSystem, type Page, Step, Steps } from '@open-slide/core';
import type { CSSProperties } from 'react';
import { F } from '../../src/data';
import { C, FONT } from '../../src/theme';

// Plain open-slide pages: written once, as ordinary open-slide pages, and shown in both outputs.
// open-slide presents them as they are; the video (src/Talk.tsx) renders them frame by frame
// through src/talk/open-slide.tsx, revealing each <Step> at the time talk/cues.mjs gives it.
// They take their look from the film's tokens (src/theme.ts) and their words from film.yml
// (src/data.ts), so a slide and the film never disagree. Animate with <Steps>/<Step>; CSS
// transitions and keyframes do not render frame by frame.
//
// A new page: write it here, add it to PLAIN, and list it in talk/cues.mjs with `page: true`.

// The film's tokens, as open-slide design variables (var(--osd-bg) and so on).
export const design: DesignSystem = {
  palette: { bg: C.paper, text: C.ink, accent: C.red },
  fonts: { display: FONT.head, body: FONT.body },
  typeScale: { hero: 104, body: 32 },
  radius: 0,
};

const M = 120; // the film's outer margin

const fill: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  background: C.paper,
  color: C.ink,
  fontFamily: FONT.body,
};

/** The film's chapter header: a red square, a label, the lab's name, and a rule. */
const Header = ({ label }: { label: string }) => (
  <>
    <div style={{ position: 'absolute', left: M, right: M, top: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontWeight: 600, fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.ink }}>
        <span style={{ width: 10, height: 10, background: C.red }} />
        {label}
      </div>
      <div style={{ fontFamily: FONT.logo, fontSize: 20, letterSpacing: '0.14em', color: C.muted }}>SUSTAINABILITY LAB · IIT GANDHINAGAR</div>
    </div>
    <div style={{ position: 'absolute', left: M, right: M, top: 104, height: 1, background: C.rule }} />
  </>
);

/** One chapter of the film: its number, name and the problem it starts from (film.yml). */
const Part = ({ i }: { i: number }) => {
  const ch = F.chapters[i];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'baseline', columnGap: 24, padding: '26px 0', borderTop: `1px solid ${C.rule}` }}>
      <div style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 72, lineHeight: 1, letterSpacing: '-0.05em', color: C.red }}>{String(i + 1).padStart(2, '0')}</div>
      <div>
        <div style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 46, lineHeight: 1.05, letterSpacing: '-0.035em' }}>{ch.name}</div>
        <div style={{ marginTop: 8, fontSize: 30, lineHeight: 1.3, color: C.muted }}>{ch.headline}</div>
      </div>
    </div>
  );
};

/** The four parts of the talk, one → at a time. */
const Agenda: Page = () => (
  <div style={fill}>
    <Header label="The talk" />
    <div style={{ position: 'absolute', left: M, top: 160, fontFamily: FONT.head, fontWeight: 700, fontSize: 104, lineHeight: 1, letterSpacing: '-0.045em' }}>
      Four problems.
    </div>
    <div style={{ position: 'absolute', left: M, right: M, top: 330 }}>
      <Steps>
        <Step duration={350}>
          <Part i={0} />
        </Step>
        <Step duration={350}>
          <Part i={1} />
        </Step>
        <Step duration={350}>
          <Part i={2} />
        </Step>
        <Step duration={350}>
          <Part i={3} />
        </Step>
      </Steps>
    </div>
  </div>
);

/** Plain pages by the id they have in talk/cues.mjs. */
export const PLAIN: Record<string, Page> = { agenda: Agenda };
