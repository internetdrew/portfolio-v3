import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const insights = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/insights" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    ogImageSrc: z.string(),
    isDraft: z.boolean(),
  }),
});

export const collections = {
  insights,
};
