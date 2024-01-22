import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import remarkToc from "remark-toc";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  markdown: {
    remarkPlugins: [remarkToc],
    shikiConfig: {
      wrap: true,
    },
  },
});
