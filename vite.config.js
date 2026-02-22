import { defineConfig } from 'vite';

export default defineConfig({
  base: '/cronometro-ada/',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    open: true,
    port: 3000,
  },
});
