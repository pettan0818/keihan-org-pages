// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.keihan.or.jp',
  trailingSlash: 'always',
  build: {
    // /koukoku/ must stay reachable as koukoku/index.html (公告 URL may be registered).
    format: 'directory',
  },
  devToolbar: { enabled: false },
});
