import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const research = defineCollection({
  loader: file('src/content/research.yaml'),
  schema: z.object({
    authors_ja: z.string(),
    authors_en: z.string(),
    year: z.number().int(),
    /** Publication date; used only for ordering. */
    date: z.coerce.date(),
    title_ja: z.string(),
    title_en: z.string(),
    /** true when the journal has no official English title and title_en is our translation. */
    title_en_translated: z.boolean().default(false),
    journal_ja: z.string(),
    journal_en: z.string(),
    volume: z.string(),
    pages: z.string(),
    doi: z.string().regex(/^10\.\S+\/\S+$/, 'DOI は "10.xxxx/..." の形式で書く（https://doi.org/ は付けない）'),
    type_ja: z.string(),
    type_en: z.string(),
  }),
});

const news = defineCollection({
  loader: file('src/content/news.yaml'),
  schema: z.object({
    date: z.coerce.date(),
    title_ja: z.string(),
    title_en: z.string(),
    url: z.url().optional(),
  }),
});

export const collections = { research, news };
