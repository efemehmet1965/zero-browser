import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ZERO newtab — build outputs to dist/ which the WebExtension loads
// via chrome_url_overrides.newtab. Keep base relative so it works
// from moz-extension:// as well as file:// / localhost preview.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
