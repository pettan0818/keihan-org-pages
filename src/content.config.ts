import { readFile } from 'node:fs/promises';
import { defineCollection } from 'astro:content';
import { file, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { load as parseYaml } from 'js-yaml';

/**
 * file() only logs a YAML syntax error and keeps the previously cached entries, so a broken
 * data file would build (and deploy) stale content. Parse it first and let the error fail the build.
 */
function strictYamlFile(path: string): Loader {
  const base = file(path);
  return {
    ...base,
    load: async (context) => {
      parseYaml(await readFile(path, 'utf-8'), { filename: path });
      return base.load(context);
    },
  };
}

const research = defineCollection({
  loader: strictYamlFile('src/content/research.yaml'),
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
  loader: strictYamlFile('src/content/news.yaml'),
  schema: z.object({
    date: z.coerce.date(),
    title_ja: z.string(),
    title_en: z.string(),
    url: z.url().optional(),
  }),
});

export const collections = { research, news };
