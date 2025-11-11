import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            filename: './dist/stats.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
        }),
    ],
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
    build: {
        outDir: 'dist',
        sourcemap: true,
        chunkSizeWarningLimit: 500,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
                    'questionnaires': ['@neuronutrition/shared-questionnaires'],
                    'charts': ['@neuronutrition/shared-charts', 'recharts'],
                },
            },
        },
    },
});
