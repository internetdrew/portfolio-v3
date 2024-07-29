import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import remarkToc from "remark-toc";
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.internetdrew.com/",
  integrations: [tailwind(), react(), sitemap()],
  markdown: {
    remarkPlugins: [remarkToc],
    shikiConfig: {
      wrap: true,
    },
  },
  output: "hybrid",
});
