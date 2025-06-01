import js from "@eslint/js";
import { includeIgnoreFile } from "@eslint/compat";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";
import svelteConfig from "./website/svelte.config.js";
import { defineConfig } from "eslint/config";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { "no-undef": "off" },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: tseslint.parser,
        svelteConfig,
      },
    },
  },
  tseslint.configs.recommended,
  ...svelte.configs.recommended,
  includeIgnoreFile(gitignorePath),
]);
