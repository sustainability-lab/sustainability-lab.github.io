import type { OpenSlideConfig } from '@open-slide/core';

declare const process: { env: Record<string, string | undefined> };

// OPEN_SLIDE_BASE=/talk/ builds the copy served at sustainability-lab.github.io/talk/ (see README).
const openSlideConfig: OpenSlideConfig = {
  base: process.env.OPEN_SLIDE_BASE ?? '/',
  build: {
    showSlideBrowser: false, // one deck: open it directly
  },
};

export default openSlideConfig;
