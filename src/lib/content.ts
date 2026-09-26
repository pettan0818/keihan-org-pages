import { getCollection } from 'astro:content';

/** Papers, newest publication date first. */
export async function getPapers() {
  const papers = await getCollection('research');
  return papers.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getNews() {
  const news = await getCollection('news');
  return news.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function doiUrl(doi: string) {
  return `https://doi.org/${doi}`;
}

export function formatDate(date: Date, lang: 'ja' | 'en') {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return lang === 'ja' ? `${y}年${m}月${d}日` : `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
