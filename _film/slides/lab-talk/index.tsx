import type { Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties } from 'react';
import { Appear, Box, design, Frame, M, page, Rise, S, Step, Steps, Words, Bar, Bars, ChapterCard, Col, Finding, Head, Reveal, Tag, TypeIn, C, FONT } from '../../src/talk/kit';
import { Header, HookAxis, HookCaption, HookPart, HookRow, HookWord, LabMark, O, Part, PlaceGlobe, Signal } from '../../src/talk/visuals/opening';
import { AirMap, ChatWindow, FilmerMap, NewsChart, NextSites, RAMP, Ramp } from '../../src/talk/visuals/air';
import { Veil, Dial, KilnCount, KilnMap, Later, Turn, ZoomView } from '../../src/talk/visuals/earth';
import { BreathPanel, Gauge, Meter, PpgCrossings, PpgSpectrum, PpgSpread, PpgTrace, Tiles } from '../../src/talk/visuals/health';
import { MeterLine, Split } from '../../src/talk/visuals/energy';
import { AlumniMap, Badge, EndCard, L, Line, Logos, Mark, Person, Photo, Pin, AlumniPlace, Tile, Wall } from '../../src/talk/visuals/lab';
import airdelhiMap from './assets/air/airdelhi.png';
import busPhoto from './assets/air/bus.jpg';
import coalPlant from './assets/earth/aperture-coal-plant.jpg';
import airport from './assets/earth/flowsat-airport.jpg';
import dam from './assets/earth/flowsat-dam.jpg';
import dial030 from './assets/earth/flowsat-dial-0.30.jpg';
import dial035 from './assets/earth/flowsat-dial-0.35.jpg';
import dial040 from './assets/earth/flowsat-dial-0.40.jpg';
import dial045 from './assets/earth/flowsat-dial-0.45.jpg';
import dial050 from './assets/earth/flowsat-dial-0.50.jpg';
import dial055 from './assets/earth/flowsat-dial-0.55.jpg';
import dial060 from './assets/earth/flowsat-dial-0.60.jpg';
import dial065 from './assets/earth/flowsat-dial-0.65.jpg';
import dial070 from './assets/earth/flowsat-dial-0.70.jpg';
import dial075 from './assets/earth/flowsat-dial-0.75.jpg';
import dial080 from './assets/earth/flowsat-dial-0.80.jpg';
import dial085 from './assets/earth/flowsat-dial-0.85.jpg';
import dial090 from './assets/earth/flowsat-dial-0.90.jpg';
import dial095 from './assets/earth/flowsat-dial-0.95.jpg';
import dial100 from './assets/earth/flowsat-dial-1.00.jpg';
import solarFarm from './assets/earth/flowsat-solar-farm.jpg';
import stadium from './assets/earth/flowsat-stadium.jpg';
import policyKilns from './assets/earth/space-to-policy-kilns.png';
import nilmbenchAward from './assets/energy/nilmbench-award.jpg';
import testOfTimeAward from './assets/energy/test-of-time-award.jpg';
import apneaeyeFigure from './assets/health/apneaeye.png';
import bikePhoto from './assets/health/je_bike.jpg';
import thermalFaces from './assets/health/je_thermal.png';
import maskSensor from './assets/health/spiro_mask.jpg';
import spiroPhoto from './assets/health/spiro_use.jpg';
import thermevalPortraits from './assets/health/thermeval.webp';
import faceRishiraj from './assets/lab/alumni-rishiraj-adhikary.jpg';
import faceZeel from './assets/lab/alumni-zeel-patel.jpg';
import logoCisco from './assets/lab/funder-cisco.png';
import logoMoe from './assets/lab/funder-coe-ai-mhrd.svg';
import logoDst from './assets/lab/funder-dst.jpg';
import logoGoogle from './assets/lab/funder-google.png';
import logoGujcost from './assets/lab/funder-gujcost.png';
import logoJio from './assets/lab/funder-jio.png';
import logoMicrosoft from './assets/lab/funder-microsoft.png';
import logoMoes from './assets/lab/funder-moes.jpeg';
import logoNvidia from './assets/lab/funder-nvidia.png';
import logoSerb from './assets/lab/funder-serb.png';
import logoStars from './assets/lab/funder-stars.png';
import photoAlumniMeet from './assets/lab/photo-2024-alumni-meet.jpg';
import photoTogether from './assets/lab/photo-2025-lab-together.jpg';
import photoMtech from './assets/lab/photo-2025-mtech-graduation.jpg';
import photoShowcase from './assets/lab/photo-2025-showcase.jpg';
import photoPhdStudents from './assets/lab/photo-2026-phd-students.jpg';
import qrJoin from './assets/lab/qr-join.svg';
import figAaai from './assets/lab/venue-aaai-sensor-placement.webp';
import figBmvc from './assets/lab/venue-bmvc-flowsat.webp';
import figBuildsys from './assets/lab/venue-buildsys-nilmbench.webp';
import figEenergy from './assets/lab/venue-eenergy-nilmtk.webp';
import figImwut from './assets/lab/venue-imwut-jouleseye.webp';
import figKdd from './assets/lab/venue-kdd-thermeval.webp';
import figNeurips from './assets/lab/venue-neurips-sentinelkilndb.webp';
import figWww from './assets/lab/venue-www-energy-breakdown.webp';

// The lab talk, December 2026. Every slide is written here, in running order.
//   · Words are plain text inside ordinary elements (<h2>, <p>, <span>, <b>), so you can click any of them in
//     open-slide's editor and change it.
//   · Pictures are <img> elements, imported from ./assets/ at the top of this file.
//   · Drawings made from data (maps, charts, signals) are components from src/talk/visuals/.
//   · Layout and motion come from src/talk/kit.tsx. Times are seconds from the start of the slide, or of the
//     build (<Step>) they are in.
// The video and the PDF are made from these same slides (src/Talk.tsx, talk/scripts/pdf.mjs). Each slide's
// page(id, Slide, [seconds…]) line gives its time in the video: the slide first, then each build.

export { design };

// ---------------------------------------------------------------- Opening

const Cover: Page = () => (
  <Frame tone="dark">
    <LabMark />
    <Box x={645} y={371.48}>
      <p style={{ ...O.wordmark }}>SUSTAINABILITY</p>
      <p style={{ ...O.wordmarkLab }}>LAB</p>
    </Box>
    <Box x={645} y={660}>
      <p style={{ ...O.tagline }}>AI for a sustainable future.</p>
      <p style={{ ...O.campus }}>IIT GANDHINAGAR</p>
    </Box>
  </Frame>
);

const Hook: Page = () => (
  <Frame tone="dark">
    <HookAxis />
    <HookRow>
      <HookPart>
        <HookWord at={0.35}>
          <h1 style={{ ...O.word }}>Air.</h1>
        </HookWord>
        <HookCaption at={0.6}>
          <p style={{ ...O.caption }}>PM2.5 in Delhi, daily, 2017–2025 · CPCB</p>
        </HookCaption>
        <Signal name="air" />
      </HookPart>
      <Steps>
        <Step>
          <HookWord>
            <h1 style={{ ...O.word }}>Land.</h1>
          </HookWord>
          <HookCaption>
            <p style={{ ...O.caption }}>Brick kilns along the Indo-Gangetic Plain, by longitude · SentinelKilnDB</p>
          </HookCaption>
          <Signal name="land" />
        </Step>
        <Step>
          <HookWord>
            <h1 style={{ ...O.word }}>Breath.</h1>
          </HookWord>
          <HookCaption>
            <p style={{ ...O.caption }}>Breathing seen by a thermal camera · illustrative</p>
          </HookCaption>
          <Signal name="breath" />
        </Step>
        <Step>
          <HookWord>
            <h1 style={{ ...O.word }}>Power.</h1>
          </HookWord>
          <HookCaption>
            <p style={{ ...O.caption }}>One Delhi home, one day · iAWE dataset</p>
          </HookCaption>
          <Signal name="power" />
        </Step>
      </Steps>
    </HookRow>
  </Frame>
);

const Title: Page = () => (
  <Frame tone="dark">
    <LabMark fold={0.15} />
    <Box x={645} y={371.48}>
      <Rise at={0.9} dur={0.9}>
        <p style={{ ...O.wordmark }}>SUSTAINABILITY</p>
      </Rise>
      <Rise at={1.1} dur={0.9}>
        <p style={{ ...O.wordmarkLab }}>LAB</p>
      </Rise>
    </Box>
    <Box x={645} y={660}>
      <Rise at={2.15} dur={0.8}>
        <p style={{ ...O.tagline }}>AI for a sustainable future.</p>
      </Rise>
      <Rise at={2.5} dur={0.8}>
        <p style={{ ...O.campus }}>IIT GANDHINAGAR</p>
      </Rise>
    </Box>
  </Frame>
);

const Place: Page = () => (
  <Frame tone="dark">
    <PlaceGlobe>
      <p style={{ ...O.pin }}>GANDHINAGAR</p>
    </PlaceGlobe>
    <Box x={M} y={300} w={720}>
      <Appear at={1.2}>
        <p style={{ ...O.kicker }}>
          <span style={{ width: 10, height: 10, flex: 'none', background: 'var(--red)' }} />
          IIT Gandhinagar · Gujarat, India
        </p>
      </Appear>
      <Rise at={1.45} style={{ marginTop: 18 }}>
        <p style={{ ...O.coords }}>23.21° N 72.68° E</p>
      </Rise>
      <Words at={2.3} stagger={0.05}>
        <p style={{ ...O.statement, marginTop: 46 }}>We build sensors, datasets and machine learning for clean air, Earth observation, health and energy.</p>
      </Words>
      <Steps>
        <Step>
          <Words at={0.05} stagger={0.06}>
            <p style={{ ...O.coda, marginTop: 26 }}>And we release them openly.</p>
          </Words>
        </Step>
      </Steps>
    </Box>
  </Frame>
);

const Agenda: Page = () => (
  <Frame>
    <Header>
      <span style={{ ...O.label }}>The talk</span>
      <span style={{ ...O.labName }}>SUSTAINABILITY LAB · IIT GANDHINAGAR</span>
    </Header>
    <Box x={M} y={160} w={1680}>
      <Words at={0.2}>
        <h1 style={{ ...S.hero, lineHeight: 1 }}>Four problems.</h1>
      </Words>
    </Box>
    <Box x={M} y={330} w={1680}>
      <Steps>
        <Step>
          <Part>
            <b style={{ ...O.num }}>01</b>
            <div>
              <h2 style={{ ...O.part }}>Clean Air</h2>
              <p style={{ ...O.headline }}>Most Indian cities have few air monitors.</p>
            </div>
          </Part>
        </Step>
        <Step>
          <Part>
            <b style={{ ...O.num }}>02</b>
            <div>
              <h2 style={{ ...O.part }}>Earth Observation</h2>
              <p style={{ ...O.headline }}>Brick kilns are spread over areas too large to survey.</p>
            </div>
          </Part>
        </Step>
        <Step>
          <Part>
            <b style={{ ...O.num }}>03</b>
            <div>
              <h2 style={{ ...O.part }}>Health Sensing</h2>
              <p style={{ ...O.headline }}>Measuring lung function or calories burned usually needs a clinic.</p>
            </div>
          </Part>
        </Step>
        <Step>
          <Part>
            <b style={{ ...O.num }}>04</b>
            <div>
              <h2 style={{ ...O.part }}>Energy</h2>
              <p style={{ ...O.headline }}>A bill says how much a home used, not what used it.</p>
            </div>
          </Part>
        </Step>
      </Steps>
    </Box>
  </Frame>
);

// ---------------------------------------------------------------- the running order

// ---------------------------------------------------------------- 01 Clean air

const Air: Page = () => (
  <Frame>
    <ChapterCard n={1}>
      <span>Clean Air</span>
      <h1>Most Indian cities have few air monitors.</h1>
    </ChapterCard>
  </Frame>
);

const Stations: Page = () => (
  <Frame>
    <Head n={1} done={1 / 6}>
      <span>Clean Air</span>
      <p>Most Indian cities have few air monitors.</p>
    </Head>
    <AirMap draw={0} dots={0.3} />
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>535 government monitors cover 277 cities.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>CPCB continuous monitoring stations</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>FINDING</p>
          <p style={{ ...S.line }}>215 of India's 271 bulletin cities have just one station.</p>
          <p style={{ ...S.note }}>Small monitoring networks are unreliable · SIM-air 2024</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);

const Field: Page = () => (
  <Frame>
    <Head n={1} done={2 / 6}>
      <span>Clean Air</span>
      <p>Most Indian cities have few air monitors.</p>
    </Head>
    <AirMap small field={0} />
    <Box x={1500} y={170} w={300}>
      <Appear at={0.8}>
        <p style={{ ...S.caption, fontSize: 20, marginBottom: 10 }}>PM2.5 · 2024 mean · µg/m³</p>
        <Ramp colors={RAMP.pm} />
        <div style={{ ...S.caption, fontSize: 19, display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>Our models fill the gaps, and pick where the next monitor should go.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>Gaussian processes · AAAI 2022</p>
          <p>Sensor placement · AAAI 2026</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>
            FINDING <span style={{ ...S.muted }}>· PM2.5 error, Beijing · µg/m³</span>
          </p>
          <Bars>
            <Bar hi>
              <span>Our Gaussian process</span>
              <b>24.28</b>
            </Bar>
            <Bar>
              <span>Distance-weighting</span>
              <b>48.09</b>
            </Bar>
          </Bars>
          <p style={{ ...S.note }}>Best of six methods · AAAI 2022, Table 2</p>
        </Finding>
      </Step>
      <Step>
        <NextSites />
      </Step>
    </Steps>
  </Frame>
);

const AirDelhi: Page = () => (
  <Frame>
    <Head n={1} done={3 / 6}>
      <span>Clean Air</span>
      <p>Most Indian cities have few air monitors.</p>
    </Head>
    <Reveal at={0} x={900} y={170} w={600} h={800} pos="40% 50%">
      <img src={busPhoto} alt="A low-cost air sensor on a Delhi bus" />
    </Reveal>
    <Reveal at={0.45} x={1530} y={330} w={270} h={480} pos="88% 50%" bg={C.paper} from="bottom">
      <img src={airdelhiMap} alt="PM2.5 along bus routes in Delhi" />
    </Reveal>
    <Box x={1530} y={822} w={270}>
      <Appear at={1.1}>
        <p style={{ ...S.caption }}>PM2.5 along bus routes, Delhi</p>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>Sensors on Delhi's buses map its air, street by street.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>AirDelhi · NeurIPS 2023 Datasets &amp; Benchmarks</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>FINDING</p>
          <p style={{ ...S.line }}>A $30 sensor tracked a $9,500 reference monitor within 6.16%.</p>
          <p style={{ ...S.note }}>Hourly PM2.5, one sensor, July 2021 · Fig. 2</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);

const Filmer: Page = () => (
  <Frame>
    <Head n={1} done={4 / 6}>
      <span>Clean Air</span>
      <p>Most Indian cities have few air monitors.</p>
    </Head>
    <FilmerMap at={0} />
    <Box x={1500} y={170} w={300}>
      <Appear at={0.3}>
        <p style={{ ...S.caption, fontSize: 20, marginBottom: 10 }}>2 m temperature · °C</p>
        <Ramp colors={RAMP.temp} />
        <div style={{ ...S.caption, fontSize: 19, display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span>−20</span>
          <span>8</span>
          <span>35</span>
        </div>
        <p style={{ ...S.caption, fontSize: 20, marginTop: 18 }}>1 Jan 2025, 11:30 IST · held out</p>
      </Appear>
      <Appear at={2.4}>
        <p style={{ ...S.caption, fontSize: 20, marginTop: 18, color: 'var(--red)' }}>Typical error over India: 1.7 °C</p>
      </Appear>
    </Box>
    <Box x={900} y={880}>
      <Appear at={0} out={0.9} dy={0}>
        <p style={{ ...S.label, fontWeight: 700, fontSize: 30, margin: 0 }}>WRF</p>
      </Appear>
    </Box>
    <Box x={900} y={880}>
      <Appear at={2.4} dy={0}>
        <p style={{ ...S.label, fontWeight: 700, fontSize: 30, margin: 0, color: 'var(--red)' }}>FiLMeR</p>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>A network stands in for India's weather model.</h2>
      </Words>
      <Rise at={0.55}>
        <p style={{ ...S.body }}>A 10-day forecast: 281 minutes of WRF on CPUs, 6.5 seconds on one GPU.</p>
      </Rise>
      <Rise at={0.7}>
        <Tag isNew>
          <p>FiLMeR · in review</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>
            FINDING <span style={{ ...S.muted }}>· one 10-day forecast, to scale</span>
          </p>
          <Bars label={230} num={130}>
            <Bar value={281 * 60}>
              <span>WRF on CPUs</span>
              <b>281 min</b>
            </Bar>
            <Bar hi value={6.5}>
              <span>FiLMeR on one GPU</span>
              <b>6.5 s</b>
            </Bar>
          </Bars>
          <p style={{ ...S.note }}>WRF: ungrib 41 + metgrid 28 + model 212 min · FiLMeR, Table 14</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);

const News: Page = () => (
  <Frame>
    <Head n={1} done={5 / 6}>
      <span>Clean Air</span>
      <p>Most Indian cities have few air monitors.</p>
    </Head>
    <NewsChart at={0} />
    <Box x={930} y={238}>
      <Appear at={0.2}>
        <p style={{ ...S.caption, color: 'var(--ink)', lineHeight: 1.5 }}>— air-quality articles a week, Delhi</p>
        <p style={{ ...S.caption, color: '#c0675c', lineHeight: 1.5 }}>— PM2.5 a week · dashed: India's limit</p>
      </Appear>
    </Box>
    <Box x={930} y={882}>
      <Appear at={1.6}>
        <p style={{ ...S.note, fontSize: 19 }}>Redrawn from Samachar (Fig. 5) · TOI and The Hindu, 2010–2021</p>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>And we read how India talks about its air.</h2>
      </Words>
      <Rise at={0.55}>
        <p style={{ ...S.body }}>17,400 news articles and 1.2 million tweets. Delhi's tweets rise with its PM2.5 only from October to December.</p>
      </Rise>
      <Rise at={0.7}>
        <Tag>
          <p>Samachar · COMPASS 2022</p>
          <p>Vartalaap · CSCW 2021</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding top={724}>
          <p style={{ ...S.kicker }}>
            FINDING <span style={{ ...S.muted }}>· Air-pollution stories, 2010–21</span>
          </p>
          <p style={{ ...S.line }}>Varanasi, over twice as polluted as Mumbai, got 51 stories to its 647.</p>
          <Bars>
            <Bar>
              <span>Mumbai · 49 µg/m³</span>
              <b>647</b>
            </Bar>
            <Bar hi>
              <span>Varanasi · 114 µg/m³</span>
              <b>51</b>
            </Bar>
          </Bars>
          <p style={{ ...S.note }}>Mean PM2.5 · Samachar, Tables 3–4 · Vartalaap, Fig. 10</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);

const VayuChat: Page = () => (
  <Frame>
    <Head n={1} done={1}>
      <span>Clean Air</span>
      <p>Most Indian cities have few air monitors.</p>
    </Head>
    <ChatWindow
      at={0.05}
      head={
        <>
          <p style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 0, fontFamily: FONT.body, fontWeight: 700, fontSize: 28 }}>
            <span style={{ width: 12, height: 12, background: C.red }} />
            VayuChat
          </p>
          <p style={{ ...S.caption, fontSize: 20 }}>CPCB data · LLM agent</p>
        </>
      }
    >
      <div style={{ alignSelf: 'flex-end', background: C.soft, padding: '16px 22px', maxWidth: 640 }}>
        <TypeIn at={0.4} cps={62}>
          <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 30, lineHeight: 1.3 }}>Which city had the worst air in December 2024?</p>
        </TypeIn>
      </div>
      <Steps>
        <Step>
          <div style={{ background: C.ink, padding: '16px 22px' }}>
            <TypeIn at={0} cps={150} cursor={C.signal}>
              <p style={{ margin: 0, fontFamily: FONT.mono, fontSize: 22, lineHeight: 1.5, color: '#e9ebe4', whiteSpace: 'nowrap' }}>df[df.month == "2024-12"].groupby("city").pm25.mean()</p>
            </TypeIn>
          </div>
          <Appear at={0.6} dy={14} style={{ marginTop: 26 }}>
            <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 30, lineHeight: 1.35 }}>
              <b>Byrnihat, Assam</b> had the worst air: 196 µg/m³, ahead of Delhi at 170.
            </p>
          </Appear>
          <div style={{ marginTop: 24 }}>
            <Bars at={0.85} label={190} num={70}>
              <Bar hi>
                <span>Byrnihat</span>
                <b>196</b>
              </Bar>
              <Bar>
                <span>Delhi</span>
                <b>170</b>
              </Bar>
              <Bar>
                <span>Bahadurgarh</span>
                <b>148</b>
              </Bar>
              <Bar>
                <span>Durgapur</span>
                <b>148</b>
              </Bar>
              <Bar>
                <span>Hajipur</span>
                <b>137</b>
              </Bar>
            </Bars>
          </div>
        </Step>
      </Steps>
    </ChatWindow>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>Anyone can ask the data a question.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>VayuChat · VayuBench · CODS 2025</p>
        </Tag>
      </Rise>
    </Col>
  </Frame>
);

// ---------------------------------------------------------------- the running order

/** Label under each generated FlowSat image, and under the dial. */
const IMAGE_LABEL: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: 0, fontFamily: FONT.mono, fontSize: 23, color: 'var(--ink)' };
/** Label in the corner of Aperture's view. */
const VIEW_LABEL: CSSProperties = { position: 'absolute', left: 18, bottom: 16, margin: 0, fontFamily: FONT.mono, fontSize: 21, color: '#ffffff', background: 'rgba(21,24,22,.72)', padding: '6px 10px' };

// ---------------------------------------------------------------- 02 Earth observation

const Earth: Page = () => (
  <Frame tone="dark">
    <ChapterCard n={2}>
      <span>Earth Observation</span>
      <h1>Brick kilns are spread over areas too large to survey.</h1>
    </ChapterCard>
  </Frame>
);

const Kilns: Page = () => (
  <Frame tone="dark">
    <KilnMap at={0} />
    <Head n={2} done={1 / 4}>
      <span>Earth Observation</span>
      <p>Brick kilns are spread over areas too large to survey.</p>
    </Head>
    <Box x={1450} y={150} w={350} style={{ textAlign: 'right' }}>
      <Appear at={0} dur={1.1} dy={0}>
        <p style={{ ...S.caption, letterSpacing: '0.06em' }}>KILNS FOUND</p>
        <KilnCount at={0}>
          <p style={{ margin: 0, fontFamily: FONT.head, fontWeight: 700, fontSize: 92, lineHeight: 1.05, letterSpacing: '-0.04em', color: 'var(--red)' }}>30,638</p>
        </KilnCount>
      </Appear>
    </Box>
    <Box x={930} y={920}>
      <Appear at={1.8} dur={0.6} dy={0}>
        <p style={{ ...S.caption, fontSize: 20 }}>Punjab · Haryana · Uttar Pradesh · Bihar · West Bengal</p>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>So we find them from space.</h2>
      </Words>
      <Rise at={0.55}>
        <p style={{ ...S.body }}>30,638 kilns across five states of the Indo-Gangetic Plain.</p>
      </Rise>
      <Rise at={0.7}>
        <Tag>
          <p>SentinelKilnDB · NeurIPS 2025</p>
          <p>62,671 hand-validated kilns, four countries</p>
        </Tag>
      </Rise>
    </Col>
  </Frame>
);

const Policy: Page = () => (
  <Frame tone="dark">
    <Head n={2} done={2 / 4}>
      <span>Earth Observation</span>
      <p>Brick kilns are spread over areas too large to survey.</p>
    </Head>
    <Reveal at={0} x={1030} y={196} w={790} h={768} fit="contain" from="bottom" bg={C.night}>
      <img src={policyKilns} alt="Kilns found in Sentinel-2 images, outlined, from the Space to Policy paper" />
    </Reveal>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>Then check each one against siting rules.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>Space to Policy · ACM JCSS 2025</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>FINDING</p>
          <p style={{ ...S.line }}>Over 70% break at least one siting rule.</p>
          <p style={{ ...S.line }}>30.7 million people live within 800 m of one.</p>
          <p style={{ ...S.note }}>30,638 kilns in five states · Space to Policy</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);

const FlowSat: Page = () => (
  <Frame tone="dark">
    <Head n={2} done={3 / 4}>
      <span>Earth Observation</span>
      <p>Brick kilns are spread over areas too large to survey.</p>
    </Head>
    <Reveal at={0.1} x={1000} y={186} w={372} h={372} from="bottom" zoom={0.08}>
      <img src={airport} alt="A generated satellite image of an airport" />
    </Reveal>
    <Reveal at={0.22} x={1396} y={186} w={372} h={372} from="bottom" zoom={0.08}>
      <img src={stadium} alt="A generated satellite image of a stadium" />
    </Reveal>
    <Reveal at={0.34} x={1000} y={614} w={372} h={372} from="bottom" zoom={0.08}>
      <img src={solarFarm} alt="A generated satellite image of a solar farm" />
    </Reveal>
    <Reveal at={0.46} x={1396} y={614} w={372} h={372} from="bottom" zoom={0.08}>
      <img src={dam} alt="A generated satellite image of a dam" />
    </Reveal>
    <Box x={1000} y={568} w={372}>
      <Appear at={0.5} dur={0.4} dy={0}>
        <p style={{ ...IMAGE_LABEL }}>
          <span>airport</span>
          <span style={{ ...S.red }}>generated</span>
        </p>
      </Appear>
    </Box>
    <Box x={1396} y={568} w={372}>
      <Appear at={0.62} dur={0.4} dy={0}>
        <p style={{ ...IMAGE_LABEL }}>
          <span>stadium</span>
          <span style={{ ...S.red }}>generated</span>
        </p>
      </Appear>
    </Box>
    <Box x={1000} y={996} w={372}>
      <Appear at={0.74} dur={0.4} dy={0}>
        <p style={{ ...IMAGE_LABEL }}>
          <span>solar farm</span>
          <span style={{ ...S.red }}>generated</span>
        </p>
      </Appear>
    </Box>
    <Box x={1396} y={996} w={372}>
      <Appear at={0.86} dur={0.4} dy={0}>
        <p style={{ ...IMAGE_LABEL }}>
          <span>dam</span>
          <span style={{ ...S.red }}>generated</span>
        </p>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>And generate satellite images from metadata.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>FlowSat · BMVC 2026</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>
            FINDING <span style={{ ...S.muted }}>· Image quality · FID, lower is better</span>
          </p>
          <Bars>
            <Bar hi>
              <span>FlowSat, 20 steps</span>
              <b>31.10</b>
            </Bar>
            <Bar>
              <span>DiffusionSat, 100 steps</span>
              <b>35.27</b>
            </Bar>
          </Bars>
          <p style={{ ...S.note }}>Best of six generators · Table 2</p>
        </Finding>
      </Step>
      <Step>
        <Veil x={990} y={180} w={800} h={860} />
        <Dial at={0.2} x={1060} y={186} size={720}>
          <img src={dial030} alt="A generated stadium at 0.30 m per pixel" />
          <img src={dial035} alt="A generated stadium at 0.35 m per pixel" />
          <img src={dial040} alt="A generated stadium at 0.40 m per pixel" />
          <img src={dial045} alt="A generated stadium at 0.45 m per pixel" />
          <img src={dial050} alt="A generated stadium at 0.50 m per pixel" />
          <img src={dial055} alt="A generated stadium at 0.55 m per pixel" />
          <img src={dial060} alt="A generated stadium at 0.60 m per pixel" />
          <img src={dial065} alt="A generated stadium at 0.65 m per pixel" />
          <img src={dial070} alt="A generated stadium at 0.70 m per pixel" />
          <img src={dial075} alt="A generated stadium at 0.75 m per pixel" />
          <img src={dial080} alt="A generated stadium at 0.80 m per pixel" />
          <img src={dial085} alt="A generated stadium at 0.85 m per pixel" />
          <img src={dial090} alt="A generated stadium at 0.90 m per pixel" />
          <img src={dial095} alt="A generated stadium at 0.95 m per pixel" />
          <img src={dial100} alt="A generated stadium at 1.00 m per pixel" />
        </Dial>
        <Box x={1060} y={918} w={720}>
          <Appear at={0} dur={0.5} dy={0}>
            <p style={{ ...IMAGE_LABEL, flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <span>stadium · generated · same prompt and noise</span>
              <Turn at={0.2} from={0.3} by={0.05}>
                <span style={{ ...S.red }}>1.00 m per pixel</span>
              </Turn>
            </p>
          </Appear>
        </Box>
      </Step>
    </Steps>
  </Frame>
);

const Aperture: Page = () => (
  <Frame tone="dark">
    <Head n={2} done={1}>
      <span>Earth Observation</span>
      <p>Brick kilns are spread over areas too large to survey.</p>
    </Head>
    <ZoomView k={0} at={0.15}>
      <img src={coalPlant} alt="A coal power plant from above, the whole 4096 px tile" />
      <p style={{ ...VIEW_LABEL }}>4096 px view</p>
    </ZoomView>
    <Box x={1040} y={966} w={760}>
      <Appear at={0.65} dur={0.5} dy={0}>
        <p style={{ margin: 0, fontFamily: FONT.mono, fontSize: 24, color: 'var(--ink)' }}>“Is a tall, narrow chimney stack visible?”</p>
      </Appear>
      <Appear at={1.05} dur={0.5} dy={0} style={{ marginTop: 8 }}>
        <p style={{ margin: 0, fontFamily: FONT.mono, fontSize: 19, color: 'var(--muted)' }}>Coal plant tile and zoom path from the Aperture paper (Fig. 3)</p>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>And make satellite models say what they see.</h2>
      </Words>
      <Rise at={0.55}>
        <p style={{ ...S.body }}>No training: a vision-language model is asked about parts, each at its own scale. Macro-F1 80.2%, against 69.8% for the best training-free method.</p>
      </Rise>
      <Rise at={0.7}>
        <Tag isNew>
          <p>Aperture · preprint 2026</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <ZoomView k={1}>
          <img src={coalPlant} alt="The tile's top-left quadrant, 2048 px across" />
          <p style={{ ...VIEW_LABEL }}>2048 px view</p>
        </ZoomView>
      </Step>
      <Step>
        <ZoomView k={2}>
          <img src={coalPlant} alt="A 1024 px quadrant with the plant's buildings" />
          <p style={{ ...VIEW_LABEL }}>1024 px view</p>
        </ZoomView>
      </Step>
      <Step>
        <ZoomView k={3}>
          <img src={coalPlant} alt="A 512 px view of the chimney stack" />
          <p style={{ ...VIEW_LABEL }}>
            <span>512 px view</span>
            <Later at={1.4}>
              <span> · home scale ≈ 260 m</span>
            </Later>
          </p>
        </ZoomView>
      </Step>
    </Steps>
  </Frame>
);

// ---------------------------------------------------------------- the running order

// ---------------------------------------------------------------- 03 Health

const Health: Page = () => (
  <Frame>
    <ChapterCard n={3}>
      <span>Health Sensing</span>
      <h1>Measuring lung function or calories burned usually needs a clinic.</h1>
    </ChapterCard>
  </Frame>
);

const JoulesEye: Page = () => (
  <Frame>
    <Head n={3} done={1 / 6}>
      <span>Health Sensing</span>
      <p>Measuring lung function or calories burned usually needs a clinic.</p>
    </Head>
    <Reveal at={0.35} x={900} y={196} w={520} h={760} pos="50% 60%">
      <img src={bikePhoto} alt="A phone with a thermal camera, mounted on an exercise bike" />
    </Reveal>
    <Reveal at={0.75} x={1450} y={196} w={350} h={230} from="bottom">
      <img src={thermalFaces} alt="Thermal views of a face, with the nostrils boxed" />
    </Reveal>
    <BreathPanel at={1.1}>
      <p style={{ ...S.note, lineHeight: 'normal', letterSpacing: '0.04em', color: '#c9cdc4' }}>BREATHING · NOSTRIL TEMPERATURE</p>
    </BreathPanel>
    <Box x={1450} y={662} w={350}>
      <Appear at={1.8} dur={0.4} dy={0}>
        <p style={{ ...S.note, lineHeight: 'normal', letterSpacing: '0.04em', marginBottom: 14 }}>ERROR IN CALORIES BURNED</p>
        <Gauge at={2.1} max={40} hi>
          <span>JoulesEye, from breathing</span>
          <b>5.8%</b>
        </Gauge>
        <Gauge at={2.35} max={40}>
          <span>Smartwatch's own estimate</span>
          <b>37.6%</b>
        </Gauge>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>A thermal camera on a phone reads your breathing.</h2>
      </Words>
      <Rise at={0.55}>
        <p style={{ ...S.body }}>Calorie error 5.8% from breathing, against 37.6% for a smartwatch's own estimate.</p>
      </Rise>
      <Rise at={0.7}>
        <Tag>
          <p>JoulesEye · IMWUT 2024 · with Carnegie Mellon</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding top={750}>
          <p style={{ ...S.kicker }}>FINDING</p>
          <p style={{ ...S.line }}>For overweight users the watch's error rises to 51.8%. JoulesEye's stays at 6.9%.</p>
          <p style={{ ...S.note }}>IMWUT 2024, Table 3</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);

const SpiroMask: Page = () => (
  <Frame>
    <Head n={3} done={2 / 6}>
      <span>Health Sensing</span>
      <p>Measuring lung function or calories burned usually needs a clinic.</p>
    </Head>
    <Reveal at={0} x={900} y={196} w={600} h={494}>
      <img src={spiroPhoto} alt="A person breathing out hard into SpiroMask, face blurred" />
    </Reveal>
    <Reveal at={0.45} x={1530} y={196} w={270} h={253} from="bottom">
      <img src={maskSensor} alt="The SpiroMask sensor inside an N95 mask" />
    </Reveal>
    <Box x={900} y={708}>
      <Appear at={0.8} dur={0.6} dy={0}>
        <p style={{ ...S.caption, fontSize: 24, lineHeight: 'normal' }}>Forced breathing into SpiroMask</p>
      </Appear>
    </Box>
    <Box x={1530} y={466} w={270}>
      <Appear at={1.0} dur={0.6} dy={0}>
        <p style={{ ...S.caption, fontSize: 22 }}>The sensor, inside an N95</p>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>A microphone inside an N95 mask measures lung function.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>SpiroMask · ACM Transactions on Computing for Healthcare</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>FINDING</p>
          <p style={{ ...S.line }}>Within 5–7% of a clinical spirometer.</p>
          <p style={{ ...S.note }}>Mean error, N95: PEF 6.3%, FEV1 5.8%, FVC 6.0% · not a medical device</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);

const Descriptors: Page = () => (
  <Frame>
    <Head n={3} done={3 / 6}>
      <span>Health Sensing</span>
      <p>Measuring lung function or calories burned usually needs a clinic.</p>
    </Head>
    <PpgTrace at={0.05} />
    <Box x={930} y={902}>
      <Appear at={1.0} dur={0.5} dy={0}>
        <p style={{ ...S.note, fontSize: 19, lineHeight: 'normal' }}>8 s of wrist PPG while sitting · PPG-DaLiA (CC BY 4.0)</p>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>Wearable signals can teach themselves.</h2>
      </Words>
      <Rise at={0.55}>
        <p style={{ ...S.body }}>A pulse's own mean, rhythm and spectrum become the training target.</p>
      </Rise>
      <Rise at={0.7}>
        <Tag isNew>
          <p>Signal Descriptors · IEEE DSAA 2026</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <PpgSpread />
        <Box x={930} y={239}>
          <Appear dur={0.5} dy={0}>
            <p style={{ ...S.caption, fontSize: 20, lineHeight: 1 }}>statistical: mean and ±1 SD</p>
          </Appear>
        </Box>
      </Step>
      <Step>
        <PpgCrossings />
        <Box x={1350} y={239}>
          <Appear dur={0.5} dy={0}>
            <p style={{ ...S.caption, fontSize: 20, lineHeight: 1, color: 'var(--ink)' }}>temporal: mean crossings</p>
          </Appear>
        </Box>
      </Step>
      <Step>
        <PpgSpectrum />
        <Box x={930} y={651}>
          <Appear dur={0.6} dy={0}>
            <p style={{ ...S.caption, fontSize: 20, lineHeight: 1 }}>spectral: its strongest rhythm</p>
          </Appear>
        </Box>
        <Box x={1211} y={683}>
          <Appear dur={0.6} dy={0}>
            <p style={{ ...S.caption, fontSize: 20, lineHeight: 1, color: 'var(--red)' }}>1.56 Hz = 94 a minute (ECG: 94)</p>
          </Appear>
        </Box>
      </Step>
    </Steps>
  </Frame>
);

const ThermEval: Page = () => (
  <Frame>
    <Head n={3} done={4 / 6}>
      <span>Health Sensing</span>
      <p>Measuring lung function or calories burned usually needs a clinic.</p>
    </Head>
    <Reveal at={0} x={900} y={196} w={900} h={600}>
      <img src={thermevalPortraits} alt="Thermal portraits of people, from the ThermEval benchmark" />
    </Reveal>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>We test where vision-language models fail on thermal images.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>ThermEval · KDD 2026</p>
          <p>First prize, oral talks, ConfAI 2026</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>
            FINDING <span style={{ ...S.muted }}>· “Whose forehead is hotter?” · accuracy</span>
          </p>
          <p style={{ ...S.line }}>22 of 25 models do no better than a coin flip.</p>
          <Bars>
            <Bar>
              <span>People</span>
              <b>0.84</b>
            </Bar>
            <Bar hi>
              <span>Best model</span>
              <b>0.74</b>
            </Bar>
          </Bars>
          <p style={{ ...S.note }}>Forehead, nose or chest · Table 4</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);

const ApneaEye: Page = () => (
  <Frame>
    <Head n={3} done={5 / 6}>
      <span>Health Sensing</span>
      <p>Measuring lung function or calories burned usually needs a clinic.</p>
    </Head>
    <Reveal at={0} x={900} y={250} w={900} h={450}>
      <img src={apneaeyeFigure} alt="ApneaEye at home: a thermal camera on a stand by the bed, faces blurred" />
    </Reveal>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>And screen for sleep apnea without touching the sleeper.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>ApneaEye · patent filed 2025</p>
        </Tag>
      </Rise>
    </Col>
  </Frame>
);

const Sleep: Page = () => (
  <Frame>
    <Head n={3} done={1}>
      <span>Health Sensing</span>
      <p>Measuring lung function or calories burned usually needs a clinic.</p>
    </Head>
    <Box x={930} y={220} w={870}>
      <Appear at={0} dur={0.5} dy={0}>
        <p style={{ ...S.caption, fontSize: 20, lineHeight: 'normal', marginBottom: 16 }}>Each 30-second epoch becomes</p>
        <Tiles at={0.6}>
          <p style={{ borderColor: 'var(--red)' }}>spindles</p>
          <p style={{ borderColor: 'var(--red)' }}>K-complexes</p>
          <p style={{ borderColor: 'var(--red)' }}>slow waves</p>
          <p style={{ borderColor: 'var(--red)' }}>eye movements</p>
          <p>sigma power</p>
          <p>alpha power</p>
          <p>theta power</p>
          <p>delta power</p>
          <p>muscle tone</p>
          <p>muscle bursts</p>
        </Tiles>
        <Appear at={2.2} dur={0.4} dy={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22 }}>
            <span style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 40, lineHeight: 'normal', color: 'var(--ink)' }}>↓</span>
            <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 30, lineHeight: 'normal', color: 'var(--ink)' }}>sleep stage</span>
            <span style={{ ...S.caption, fontSize: 20, lineHeight: 'normal' }}>wake · light · deep · REM</span>
          </div>
        </Appear>
        <Steps>
          <Step>
            <Appear dur={0.4} dy={0}>
              <p style={{ ...S.note, fontSize: 19, lineHeight: 'normal', marginTop: 40, marginBottom: 12 }}>FOUR-CLASS STAGING · MACRO-F1</p>
            </Appear>
            <Meter at={0.2}>
              <span>Raw signals</span>
              <b>0.77</b>
            </Meter>
            <Meter at={0.6} hi>
              <span>Ten concepts</span>
              <b>0.78</b>
            </Meter>
          </Step>
        </Steps>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>And stage sleep with evidence a clinician can check.</h2>
      </Words>
      <Rise at={0.55}>
        <p style={{ ...S.body }}>Ten concepts a sleep technician knows, from spindles to muscle tone. They match a raw-signal model: Macro-F1 0.78 vs 0.77.</p>
      </Rise>
      <Rise at={0.7}>
        <Tag isNew>
          <p>Interpretable sleep staging</p>
          <p>in review</p>
        </Tag>
      </Rise>
    </Col>
  </Frame>
);

// ---------------------------------------------------------------- the running order

// ---------------------------------------------------------------- 04 Energy

const Energy: Page = () => (
  <Frame tone="dark">
    <ChapterCard n={4}>
      <span>Energy</span>
      <h1>A bill says how much a home used, not what used it.</h1>
    </ChapterCard>
  </Frame>
);

const Nilm: Page = () => (
  <Frame tone="dark">
    <Head n={4} done={1 / 3}>
      <span>Energy</span>
      <p>A bill says how much a home used, not what used it.</p>
    </Head>
    <Box x={930} y={194}>
      <Appear at={1.1} dur={0.4} dy={0}>
        <p style={{ ...S.caption, color: 'var(--ink)', letterSpacing: '0.04em' }}>ONE METER</p>
      </Appear>
    </Box>
    <Box x={930} y={224}>
      <Appear at={1.1} dur={0.4} dy={0}>
        <p style={{ ...S.caption, fontSize: 18 }}>2013-07-28</p>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>We split one meter's signal into appliances.</h2>
      </Words>
      <Rise at={0.55}>
        <p style={{ ...S.body }}>One Delhi home, one day, one meter.</p>
      </Rise>
      <Rise at={0.7}>
        <Tag>
          <p>Energy disaggregation · iAWE dataset</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Split at={0.05} />
        <Box x={930} y={434}>
          <Appear at={0.55} dur={0.5} dy={0}>
            <p style={{ ...S.label, margin: 0, color: C.pink }}>Air conditioner</p>
          </Appear>
        </Box>
        <Box x={930} y={546}>
          <Appear at={0.87} dur={0.5} dy={0}>
            <p style={{ ...S.label, margin: 0 }}>Fridge</p>
          </Appear>
        </Box>
        <Box x={930} y={658}>
          <Appear at={1.19} dur={0.5} dy={0}>
            <p style={{ ...S.label, margin: 0 }}>Washing machine</p>
          </Appear>
        </Box>
        <Box x={930} y={770}>
          <Appear at={1.51} dur={0.5} dy={0}>
            <p style={{ ...S.label, margin: 0 }}>Television</p>
          </Appear>
        </Box>
        <Box x={930} y={882}>
          <Appear at={1.83} dur={0.5} dy={0}>
            <p style={{ ...S.label, margin: 0 }}>Computer</p>
          </Appear>
        </Box>
      </Step>
    </Steps>
    {/* after the build, so the meter's line stays on top of the appliances' lines, as in the film */}
    <MeterLine at={0.2} />
  </Frame>
);

const Nilmtk: Page = () => (
  <Frame tone="dark">
    <Head n={4} done={2 / 3}>
      <span>Energy</span>
      <p>A bill says how much a home used, not what used it.</p>
    </Head>
    <Reveal at={0} x={1240} y={196} w={560} h={760} pos="50% 30%">
      <img src={testOfTimeAward} alt="NILMTK's Test-of-Time Award, ACM e-Energy 2025" />
    </Reveal>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>NILMTK, the open-source toolkit the field has used since 2014.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>Test-of-Time Award · ACM e-Energy 2025</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>FINDING</p>
          <p style={{ ...S.line }}>965 stars · 489 forks · 37 contributors</p>
          <p style={{ ...S.line }}>552 papers cite it.</p>
          <p style={{ ...S.note }}>GitHub and Semantic Scholar, 14 Nov 2026</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);

const NilmBench: Page = () => (
  <Frame tone="dark">
    <Head n={4} done={1}>
      <span>Energy</span>
      <p>A bill says how much a home used, not what used it.</p>
    </Head>
    <Reveal at={0} x={900} y={250} w={900} h={487}>
      <img src={nilmbenchAward} alt="NILMBench2026 named Best Paper Runner-Up at ACM BuildSys 2026" />
    </Reveal>
    <Box x={900} y={760}>
      <Appear at={1.1} dur={0.5} dy={0}>
        <p style={{ ...S.caption }}>ACM BuildSys 2026, Banff · Aayush Kuloor, Anurag Singh, Harsh Dhru</p>
      </Appear>
    </Box>
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>NILMBench2026 was led by second-year undergraduates.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>Best Paper Runner-Up · ACM BuildSys 2026</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>
            FINDING <span style={{ ...S.muted }}>· Switch-on F1 in a home the models never saw</span>
          </p>
          <Bars>
            <Bar>
              <span>Fridge</span>
              <b>0.73</b>
            </Bar>
            <Bar>
              <span>Kettle</span>
              <b>0.24</b>
            </Bar>
            <Bar hi>
              <span>Microwave</span>
              <b>0.15</b>
            </Bar>
          </Bars>
          <p style={{ ...S.note }}>Mean of 15 models · UK-DALE · Table 11</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);

// ---------------------------------------------------------------- the running order

// ---------------------------------------------------------------- the lab

const Venues: Page = () => (
  <Frame>
    <Box x={M} y={70}>
      <Rise at={0.05}>
        <Mark square={10} gap={14}>
          <p style={{ ...L.kicker }}>Published at</p>
        </Mark>
      </Rise>
    </Box>
    <Line at={0.1} x={M} y={122} w={1680} />
    <Wall>
      <Tile at={0.25}>
        <img src={figNeurips} alt="Figure from SentinelKilnDB, NeurIPS 2025" />
        <h3 style={{ ...L.venue }}>NeurIPS</h3>
        <p style={{ ...L.paper }}>2025 · SentinelKilnDB</p>
      </Tile>
      <Tile at={0.75}>
        <img src={figKdd} alt="Figure from ThermEval, KDD 2026" />
        <h3 style={{ ...L.venue }}>KDD</h3>
        <p style={{ ...L.paper }}>2026 · ThermEval</p>
      </Tile>
      <Tile at={1.25}>
        <img src={figAaai} alt="Figure from the sensor-placement paper, AAAI 2026" />
        <h3 style={{ ...L.venue }}>AAAI</h3>
        <p style={{ ...L.paper }}>2026 · Scalable Air-Quality Sensor Placement via Gradient-Based Mutual Information Maximization</p>
      </Tile>
      <Tile at={1.75}>
        <img src={figWww} alt="Figure from the household energy breakdown paper, WWW 2019" />
        <h3 style={{ ...L.venue }}>WWW</h3>
        <p style={{ ...L.paper }}>2019 · A Tree-Structured Neural Network Model for Household Energy Breakdown</p>
      </Tile>
      <Tile at={2.25}>
        <img src={figImwut} alt="Figure from JoulesEye, IMWUT 2024" />
        <h3 style={{ ...L.venue }}>IMWUT</h3>
        <p style={{ ...L.paper }}>2024 · JoulesEye</p>
      </Tile>
      <Tile at={2.75}>
        <img src={figBmvc} alt="Figure from FlowSat, BMVC 2026" />
        <h3 style={{ ...L.venue }}>BMVC</h3>
        <p style={{ ...L.paper }}>2026 · FlowSat</p>
      </Tile>
      <Tile at={3.25}>
        <img src={figBuildsys} alt="Figure from NILMBench2026, BuildSys 2026" />
        <h3 style={{ ...L.venue }}>BuildSys</h3>
        <p style={{ ...L.paper }}>2026 · NILMBench2026</p>
        <Badge at={4.6}>
          <p style={{ ...L.badge }}>Best Paper Runner-Up 2026</p>
        </Badge>
      </Tile>
      <Tile at={3.75}>
        <img src={figEenergy} alt="Figure from NILMTK, e-Energy 2014" />
        <h3 style={{ ...L.venue }}>e-Energy</h3>
        <p style={{ ...L.paper }}>2014 · NILMTK</p>
        <Badge at={4.6}>
          <p style={{ ...L.badge }}>Test-of-Time Award 2025</p>
        </Badge>
      </Tile>
    </Wall>
  </Frame>
);

const People: Page = () => (
  <Frame tone="dark">
    <Photo drift={-1}>
      <img src={photoPhdStudents} alt="Current PhD students celebrating with Dr. Zeel" />
    </Photo>
    <Pin left={M} bottom={70} style={{ display: 'flex', alignItems: 'baseline', gap: 34 }}>
      <h2 style={{ ...L.photoTitle }}>Life in the lab</h2>
      <p style={{ ...L.photoYear }}>2026</p>
    </Pin>
    <Steps>
      <Step>
        <Photo drift={1}>
          <img src={photoShowcase} alt="Showcasing our research and innovations at IIT Gandhinagar" />
        </Photo>
        <Pin left={M} bottom={70} style={{ display: 'flex', alignItems: 'baseline', gap: 34 }}>
          <h2 style={{ ...L.photoTitle }}>Life in the lab</h2>
          <p style={{ ...L.photoYear }}>2025</p>
        </Pin>
      </Step>
      <Step>
        <Photo drift={-1}>
          <img src={photoMtech} alt="Special celebration with faculty members" />
        </Photo>
        <Pin left={M} bottom={70} style={{ display: 'flex', alignItems: 'baseline', gap: 34 }}>
          <h2 style={{ ...L.photoTitle }}>Life in the lab</h2>
          <p style={{ ...L.photoYear }}>2025</p>
        </Pin>
      </Step>
      <Step>
        <Photo drift={1}>
          <img src={photoAlumniMeet} alt="Heartwarming reunion with our global alumni network" />
        </Photo>
        <Pin left={M} bottom={70} style={{ display: 'flex', alignItems: 'baseline', gap: 34 }}>
          <h2 style={{ ...L.photoTitle }}>Life in the lab</h2>
          <p style={{ ...L.photoYear }}>2024</p>
        </Pin>
      </Step>
      <Step>
        <Photo drift={-1}>
          <img src={photoTogether} alt="A memorable evening celebrating together" />
        </Photo>
        <Pin left={M} bottom={70} style={{ display: 'flex', alignItems: 'baseline', gap: 34 }}>
          <h2 style={{ ...L.photoTitle }}>Life in the lab</h2>
          <p style={{ ...L.photoYear }}>2025</p>
        </Pin>
      </Step>
    </Steps>
  </Frame>
);

const Alumni: Page = () => (
  <Frame tone="dark">
    <AlumniMap />
    <AlumniPlace lon={0.12} lat={52.2} dx={-26} dy={-40} end>
      <p style={{ ...L.place }}>University of Cambridge</p>
    </AlumniPlace>
    <AlumniPlace lon={8.55} lat={47.38} dx={34} dy={-58}>
      <p style={{ ...L.place }}>ETH Zurich</p>
      <p style={{ ...L.place }}>Univ. of Tübingen</p>
    </AlumniPlace>
    <AlumniPlace lon={-79.94} lat={40.44} dx={70} dy={-10}>
      <p style={{ ...L.place }}>Carnegie Mellon</p>
      <p style={{ ...L.place }}>Johns Hopkins</p>
      <p style={{ ...L.place }}>NYU</p>
      <p style={{ ...L.place }}>Stony Brook</p>
      <p style={{ ...L.place }}>UMass Amherst</p>
    </AlumniPlace>
    <AlumniPlace lon={-88.23} lat={40.11} dx={-30} dy={-36} end>
      <p style={{ ...L.place }}>UIUC</p>
    </AlumniPlace>
    <AlumniPlace lon={-95.4} lat={29.72} dx={-26} dy={44} end>
      <p style={{ ...L.place }}>Rice University</p>
    </AlumniPlace>
    <AlumniPlace lon={-118.13} lat={34.14} dx={-34} dy={-8} end>
      <p style={{ ...L.place }}>Caltech</p>
      <p style={{ ...L.place }}>UC San Diego</p>
    </AlumniPlace>
    <AlumniPlace lon={77.59} lat={12.97} dx={-44} dy={40} end>
      <p style={{ ...L.place }}>Microsoft Research India</p>
      <p style={{ ...L.place }}>Google DeepMind</p>
      <p style={{ ...L.place }}>IISc</p>
    </AlumniPlace>
    <AlumniPlace lon={72.92} lat={19.13} dx={44} dy={18}>
      <p style={{ ...L.place }}>IIT Bombay</p>
      <p style={{ ...L.place }}>IIT Madras</p>
    </AlumniPlace>
    <Box x={M} y={64} w={640}>
      <Words at={0.2}>
        <h1 style={{ ...L.mapTitle }}>Where our alumni are now</h1>
      </Words>
    </Box>
    <Pin left={M} bottom={84} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Person at={2.6}>
        <img src={faceRishiraj} alt="Dr. Rishiraj Adhikary" />
        <h3 style={{ ...L.name }}>Dr. Rishiraj Adhikary</h3>
        <p style={{ ...L.now }}>Postdoc at University of Cambridge</p>
        <p style={{ ...L.note }}>First PhD graduate · Fulbright-Nehru Fellow</p>
      </Person>
      <Person at={2.85}>
        <img src={faceZeel} alt="Dr. Zeel B Patel" />
        <h3 style={{ ...L.name }}>Dr. Zeel B Patel</h3>
        <p style={{ ...L.now }}>Postdoc at Microsoft Research India</p>
        <p style={{ ...L.note }}>Microsoft Research India PhD Award</p>
      </Person>
    </Pin>
    <Pin right={M} bottom={84} w={560} style={{ textAlign: 'right' }}>
      <Rise at={3.4}>
        <Mark square={8} gap={12} right>
          <p style={{ ...L.kicker, fontSize: 20 }}>Also at</p>
        </Mark>
      </Rise>
      <Rise at={3.55} style={{ marginTop: 10 }}>
        <p style={{ ...L.also }}>Apple · Microsoft · LinkedIn · Oracle · Qualcomm · Samsung R&amp;D · Salesforce</p>
      </Rise>
      <Rise at={3.7} style={{ marginTop: 12 }}>
        <p style={{ ...L.count }}>2 PhD graduates · 13 MTech alumni</p>
      </Rise>
    </Pin>
  </Frame>
);

const Join: Page = () => (
  <Frame>
    <Box x={M - 8} y={96}>
      <Words at={0.05} stagger={0.08}>
        <h1 style={{ ...L.join }}>Join us.</h1>
      </Words>
    </Box>
    <Box x={M} y={400} style={{ display: 'flex', gap: 46 }}>
      <Rise at={0.5}>
        <Mark square={16} gap={14}>
          <p style={{ ...L.role }}>PhD</p>
        </Mark>
      </Rise>
      <Rise at={0.62}>
        <Mark square={16} gap={14}>
          <p style={{ ...L.role }}>Postdoc</p>
        </Mark>
      </Rise>
      <Rise at={0.74}>
        <Mark square={16} gap={14}>
          <p style={{ ...L.role }}>Research associate</p>
        </Mark>
      </Rise>
      <Rise at={0.86}>
        <Mark square={16} gap={14}>
          <p style={{ ...L.role }}>Internship</p>
        </Mark>
      </Rise>
    </Box>
    <Appear at={1.1} style={{ position: 'absolute', left: M, top: 500, width: 1020 }}>
      <p style={{ ...L.text }}>We look for people who like building things that work outside the lab. No prior sustainability background needed.</p>
    </Appear>
    <Rise at={1.6} style={{ position: 'absolute', left: M, top: 690 }}>
      <p style={{ ...L.url }}>sustainability-lab.github.io/join</p>
    </Rise>
    <Appear at={1.4} style={{ position: 'absolute', right: M, top: 400 }}>
      <div style={{ border: '2px solid var(--ink)', padding: 22, background: '#ffffff' }}>
        <img src={qrJoin} alt="QR code for sustainability-lab.github.io/join" style={{ display: 'block', width: 236, height: 236 }} />
      </div>
      <p style={{ ...L.scan }}>Scan to apply</p>
    </Appear>
    <Box x={M} y={840} w={1680}>
      <Appear at={2.0} dur={0.6} dy={0} style={{ borderTop: '1px solid var(--rule)', paddingTop: 26 }}>
        <p style={{ ...L.label }}>Supported by</p>
        <Logos at={2.1}>
          <img src={logoGoogle} alt="Google" />
          <img src={logoMicrosoft} alt="Microsoft" />
          <img src={logoNvidia} alt="NVIDIA" />
          <img src={logoCisco} alt="Cisco" />
          <img src={logoJio} alt="Jio" />
          <img src={logoSerb} alt="SERB" />
          <img src={logoDst} alt="Department of Science and Technology" />
          <img src={logoMoes} alt="Ministry of Earth Sciences" />
          <img src={logoStars} alt="STARS" />
          <img src={logoGujcost} alt="GUJCOST" />
          <img src={logoMoe} alt="Ministry of Education" />
        </Logos>
      </Appear>
    </Box>
  </Frame>
);

/** The film's closing card: the lab's mark, its name and the edition. */
const End: Page = () => (
  <Frame>
    <EndCard />
    <Box x={675} y={383.6}>
      <Rise at={0.7} dur={0.9}>
        <p style={{ ...L.wordmark }}>SUSTAINABILITY</p>
      </Rise>
      <Rise at={0.9} dur={0.9}>
        <p style={{ ...L.wordmarkLab }}>LAB</p>
      </Rise>
    </Box>
    <Box x={675} y={650}>
      <Rise at={1.3}>
        <p style={{ ...L.home }}>IIT Gandhinagar</p>
      </Rise>
      <Rise at={1.5} style={{ marginTop: 10 }}>
        <p style={{ ...L.homeUrl }}>sustainability-lab.github.io</p>
      </Rise>
    </Box>
    <Pin right={M} bottom={56}>
      <Appear at={2.0} dur={0.6} dy={0}>
        <p style={{ ...L.edition }}>December 2026 edition</p>
      </Appear>
    </Pin>
  </Frame>
);

// ---------------------------------------------------------------- the running order

// ---------------------------------------------------------------- the running order

const pages = [
  page('cover', Cover, [3]),
  page('hook', Hook, [4.5, 4, 4, 5]),
  page('title', Title, [5]),
  page('place', Place, [5, 4]),
  page('agenda', Agenda, [2.5, 2, 2, 2, 3.5]),
  page('air', Air, [5]),
  page('stations', Stations, [6, 5]),
  page('field', Field, [6, 5, 4]),
  page('airdelhi', AirDelhi, [6, 5]),
  page('filmer', Filmer, [7, 6]),
  page('talk', News, [7, 7]),
  page('vayuchat', VayuChat, [5, 7]),
  page('earth', Earth, [5]),
  page('kilns', Kilns, [7]),
  page('policy', Policy, [6, 5]),
  page('flowsat', FlowSat, [6, 4, 5]),
  page('aperture', Aperture, [5, 3, 3, 4]),
  page('health', Health, [5]),
  page('jouleseye', JoulesEye, [6, 5]),
  page('spiromask', SpiroMask, [6, 5]),
  page('descriptors', Descriptors, [5, 3, 3, 4]),
  page('thermeval', ThermEval, [6, 5]),
  page('apneaeye', ApneaEye, [6]),
  page('sleep', Sleep, [6, 5]),
  page('energy', Energy, [5]),
  page('nilm', Nilm, [6, 5]),
  page('nilmtk', Nilmtk, [6, 5]),
  page('nilmbench', NilmBench, [6, 5]),
  page('venues', Venues, [8]),
  page('people', People, [4, 4, 4, 4, 4]),
  page('alumni', Alumni, [8]),
  page('join', Join, [8]),
  page('end', End, [5]),
];

export const meta: SlideMeta = {
  title: 'Sustainability Lab, IIT Gandhinagar (December 2026)',
  createdAt: '2026-11-26T06:07:33.297Z',
};

export default pages;

// Speaker notes by slide id, shown in the presenter view (press P). The public copy on the lab site is built
// with VITE_PUBLIC=1 and leaves them out.
const NOTES: Record<string, string> = {
  cover: `The lab's title card. Press → to start.`,

  hook: `Air, land, breath and power: the four things we measure. Each → draws the next line. All are real data except breathing, which is illustrative.
Air is Delhi's daily PM2.5 from 2017 to 2025 (CPCB). Land is brick kilns along the Indo-Gangetic Plain by longitude (SentinelKilnDB). Power is one Delhi home over one day (iAWE).`,

  title: `Sustainability Lab, IIT Gandhinagar. We work on AI and sensing for clean air, Earth observation, health and energy.
These slides follow the December 2026 lab film: its words, its data and its motion.`,

  place: `We are at IIT Gandhinagar, in Gujarat.
We build sensors, collect datasets and train models for these four areas, and we release them openly. NILMTK, AirDelhi and SentinelKilnDB are all public.`,

  agenda: `Four problems, one part of the talk each. Each → adds one. The headlines are the film's own chapter openings.`,

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

  end: `The film's closing card: the lab, IIT Gandhinagar, the site and the edition.`,
};

// import.meta.env exists when open-slide (Vite) builds the deck; the video (webpack) has none, and needs no notes
const PUBLIC = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_PUBLIC;
export const notes: (string | undefined)[] = PUBLIC ? [] : pages.map((p) => NOTES[p.id]);
