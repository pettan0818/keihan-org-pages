// Acceptance checks for the built site (指示書 §7 の 2〜5).
//   npm run verify                         -> checks ./dist
//   npm run verify -- https://www.keihan.or.jp -> checks production over HTTP (no JS executed)
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const target = process.argv[2];
const remote = target?.startsWith('http');

async function get(path) {
  if (remote) {
    const res = await fetch(new URL(path, target), { redirect: 'follow' });
    return res.ok ? await res.text() : null;
  }
  let file = join('dist', path);
  if (path.endsWith('/')) file = join(file, 'index.html');
  return existsSync(file) ? await readFile(file, 'utf-8') : null;
}

let failures = 0;
function check(ok, label) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) failures++;
}

// 2. Readable without JS: English mission and the latest three DOIs on the top pages, every DOI on the research pages.
const mission =
  'Keihan Marketing Association (KMA) is an independent, not-for-profit research institute established in Kyoto, Japan, in 2022. KMA supports independent researchers and publishes peer-reviewed research on markets, consumers, and public policy, making all results freely available to the public.';
// Each paper in research.yaml starts with "- id:"; take its doi and date.
const papers = (await readFile('src/content/research.yaml', 'utf-8'))
  .split(/^- id:/m)
  .slice(1)
  .map((block) => ({ doi: block.match(/^\s*doi:\s*(\S+)/m)?.[1], date: block.match(/^\s*date:\s*(\S+)/m)?.[1] }));
check(papers.length > 0 && papers.every((p) => p.doi && p.date), 'research.yaml: every paper has doi and date');
const latest = [...papers].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 3);
const en = await get('/en/');
check(en?.includes(mission), '/en/ contains the English mission statement');
for (const { doi } of latest) {
  check(en?.includes(doi), `/en/ contains latest DOI ${doi}`);
  check((await get('/'))?.includes(doi), `/ contains latest DOI ${doi}`);
}
// Research pages list every paper.
for (const page of ['/research/', '/en/research/']) {
  const html = await get(page);
  for (const { doi } of papers) check(html?.includes(doi), `${page} contains DOI ${doi}`);
}

// 3. Public notice at the same path, same wording.
const koukoku = await get('/koukoku/');
check(koukoku?.includes('<h1>一般社団法人京阪マーケティング・リサーチ機構 公告事項</h1>'), '/koukoku/ heading unchanged');
check(/\d{4}\/\d{1,2}\/\d{1,2}<\/span>時点において、該当事項はございません。/.test(koukoku ?? ''), '/koukoku/ body unchanged');

// 4. Every path served by the old site still resolves (page or redirect).
const legacyPaths = [
  '/',
  '/koukoku/',
  '/404/',
  '/404.html',
  '/banner.jpg',
  '/logo.png',
  '/logo_original.png',
  '/favicon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/manifest.webmanifest',
  '/ARCHIVE/favicon-16x16.png',
  '/ARCHIVE/favicon-32x32.png',
  '/ARCHIVE/favicon.ico',
];
if (remote) legacyPaths.push('/koukoku', '/koukoku/index.html');
for (const path of legacyPaths) check((await get(path)) !== null, `legacy path ${path}`);
check((await get('/sitemap.xml')) !== null, 'sitemap.xml');
check((await get('/robots.txt')) !== null, 'robots.txt');

// 5. hreflang pairs on every bilingual page.
const pairs = [
  ['/', '/en/'],
  ['/research/', '/en/research/'],
  ['/about/', '/en/about/'],
];
for (const [ja, enPath] of pairs) {
  for (const page of [ja, enPath]) {
    const html = (await get(page)) ?? '';
    const has = (lang, path) =>
      html.includes(`<link rel="alternate" hreflang="${lang}" href="https://www.keihan.or.jp${path}">`);
    check(has('ja', ja) && has('en', enPath), `${page} hreflang ja=${ja} en=${enPath}`);
  }
}

// Zero client JS except JSON-LD and the koukoku date script.
for (const page of ['/', '/en/', '/research/', '/en/research/', '/about/', '/en/about/']) {
  const html = (await get(page)) ?? '';
  const scripts = [...html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>/g)];
  check(scripts.length === 0, `${page} has no client JS`);
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
