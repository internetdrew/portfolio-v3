import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const insights = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/collections/insights" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    ogImageSrc: z.string(),
    isDraft: z.boolean(),
  }),
});

const tutorials = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/collections/tutorials" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    ogImageSrc: z.string(),
    isDraft: z.boolean(),
    videoUrl: z.string().optional(),
  }),
});

export const collections = {
  insights,
  tutorials,
};
