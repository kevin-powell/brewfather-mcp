// @ts-check
import { defineConfig } from "astro/config";

// Fully static: Brewfather is queried at build time, so API keys never reach the browser.
export default defineConfig({});
