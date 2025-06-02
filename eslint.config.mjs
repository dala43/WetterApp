import { defineConfig } from "eslint/config";
import svelte3 from "eslint-plugin-svelte3";
import globals from "globals";

export default defineConfig([
  {
    ignores: [
      "frontend/.svelte-kit/**",
      "frontend/svelte.config.js",
      "frontend/vite.config.js",
      "**/*.d.ts",
      "node_modules/**",
      "dist/**"
    ],
  },
  // Backend-Konfiguration
  {
    files: ["backend/**/*.js", "collector/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
      parserOptions: {
        sourceType: "script",
      },
    },
    rules: {},
  },
  // Frontend-Konfiguration
  {
    files: ["frontend/**/*.js", "frontend/**/*.ts", "frontend/**/*.svelte", "src/routes/**/*.svelte"],
    plugins: {
      svelte3,
    },
    processor: "svelte3/svelte3",
    languageOptions: {
      globals: {
        browser: true,
      },
      parserOptions: {
        sourceType: "module",
      },
    },
    rules: {},
  },
]);
