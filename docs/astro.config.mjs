// @ts-check
import solidJs from '@astrojs/solid-js';
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Enable Solid to support Solid JSX components.
  integrations: [solidJs()],
  adapter: vercel(),
});