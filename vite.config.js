import { defineConfig } from 'vite';

export default defineConfig({
  // Static site. `npm run build` emits to dist/ for any static host.
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: true,
  },
});
