export type Lang = 'ja' | 'en';

export const SITE_URL = 'https://www.keihan.or.jp';

// Same form the old site linked to (via its /edit URL); /viewform is the public answer page.
export const CONTACT_FORM_URL =
  'https://docs.google.com/forms/d/1EcS0OrBsZN5npQMRr1ISticDPaGE8p1rsL5UsOxrFws/viewform';

/** Page paths per language. Every entry here is a ja/en pair linked by hreflang. */
export const routes = {
  home: { ja: '/', en: '/en/' },
  research: { ja: '/research/', en: '/en/research/' },
  about: { ja: '/about/', en: '/en/about/' },
} as const;

export type RouteKey = keyof typeof routes;

/** Japanese-only pages (no English counterpart, no hreflang pair). */
export const jaOnlyRoutes = {
  koukoku: '/koukoku/',
} as const;

export const ui = {
  ja: {
    orgName: '一般社団法人京阪マーケティング・リサーチ機構',
    orgShortName: '京阪マーケティング・リサーチ機構',
    nav: { home: 'トップ', research: '研究成果', about: '法人概要' },
    langSwitch: 'English',
    koukoku: '公告',
    contact: 'お問い合わせ',
    skipToContent: '本文へ移動',
    mission:
      '京阪マーケティング・リサーチ機構は、2022年に京都で設立された独立の非営利研究機関です。市場・消費者・公共政策に関する研究に取り組む研究者を支援し、その成果である査読付き論文を、誰もが無料で読める形で公開しています。',
  },
  en: {
    orgName: 'Keihan Marketing Research Association',
    orgShortName: 'Keihan Marketing Research Association',
    nav: { home: 'Home', research: 'Research', about: 'About' },
    langSwitch: '日本語',
    koukoku: 'Public notices (Japanese)',
    contact: 'Contact',
    skipToContent: 'Skip to content',
    mission:
      'Keihan Marketing Research Association (KMA) is an independent, not-for-profit research institute established in Kyoto, Japan, in 2022. KMA supports independent researchers and publishes peer-reviewed research on markets, consumers, and public policy, making all results freely available to the public.',
  },
} as const;
