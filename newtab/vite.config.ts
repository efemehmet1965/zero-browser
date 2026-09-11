import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ZERO newtab — build outputs to dist/ which the WebExtension loads
// via chrome_url_overrides.newtab (+ sidebar_action panel).
// Keep base relative so it works from moz-extension:// as well as
// file:// / localhost preview.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        sidebar: 'sidebar.html',
      },
    },
  },
  server: {
    port: 5173,
  },
});
