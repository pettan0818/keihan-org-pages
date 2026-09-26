import type { APIRoute } from 'astro';
import { jaOnlyRoutes, routes, SITE_URL } from '../i18n';

const abs = (path: string) => new URL(path, SITE_URL).href;

export const GET: APIRoute = () => {
  const entries: string[] = [];

  for (const pair of Object.values(routes)) {
    const alternates = [
      `<xhtml:link rel="alternate" hreflang="ja" href="${abs(pair.ja)}"/>`,
      `<xhtml:link rel="alternate" hreflang="en" href="${abs(pair.en)}"/>`,
      `<xhtml:link rel="alternate" hreflang="x-default" href="${abs(pair.ja)}"/>`,
    ].join('');
    for (const path of [pair.ja, pair.en]) {
      entries.push(`<url><loc>${abs(path)}</loc>${alternates}</url>`);
    }
  }
  for (const path of Object.values(jaOnlyRoutes)) {
    entries.push(`<url><loc>${abs(path)}</loc></url>`);
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    entries.join('\n') +
    '\n</urlset>\n';

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
