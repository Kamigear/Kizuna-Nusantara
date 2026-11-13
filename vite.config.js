import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Relatif, supaya jalan di root (Cloudflare) maupun subfolder GitHub Pages.
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        docs: resolve(__dirname, 'docs.html'),
      },
    },
  },
});
