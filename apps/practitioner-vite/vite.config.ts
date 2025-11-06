import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default defineConfig({
  plugins: [react()],
  server: { port: 3010 },
  preview: { port: 3010 },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  optimizeDeps: {
    include: [
      'victory-vendor/d3-array',
      'victory-vendor/d3-scale',
      'victory-vendor/d3-shape',
      'victory-vendor/d3-interpolate',
      'victory-vendor/d3-format',
      'firebase/app',
      'firebase/auth',
      '@firebase/app',
      '@firebase/auth',
    ],
  },
  build: { outDir: 'dist', sourcemap: true },
});
