import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";
import rehypeHighlight from "rehype-highlight";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  markdown: {
    rehypePlugins: [rehypeHighlight],
  },
});
