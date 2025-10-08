import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      "#routes/*": "../backend/src/routes/*",
      "#middleware/*": "../backend/src/middleware/*",
      "#modules/*": "../backend/src/modules/*",
    },
  },
};

export default config;
