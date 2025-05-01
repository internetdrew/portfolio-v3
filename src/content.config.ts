import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    slug: z.string(),
    image: z.object({
      url: z.string(),
    }),
    isDraft: z.boolean(),
  }),
});

export const collections = {
  blog,
};
