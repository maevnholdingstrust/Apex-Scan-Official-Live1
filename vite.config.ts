import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      // Raise the per-chunk warning threshold; Three.js is inherently large.
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          // Use a function-based splitter so Rollup can resolve cross-chunk
          // dependencies automatically rather than fighting circular refs from
          // static groupings.
          manualChunks(id: string) {
            if (id.includes('/node_modules/three/') ||
                id.includes('/node_modules/@react-three/')) {
              return 'vendor-three';
            }
            if (id.includes('/node_modules/recharts/')) {
              return 'vendor-recharts';
            }
            if (id.includes('/node_modules/motion/') ||
                id.includes('/node_modules/framer-motion/')) {
              return 'vendor-motion';
            }
            if (id.includes('/node_modules/ethers/')) {
              return 'vendor-ethers';
            }
            // All remaining vendor code goes into a single vendor chunk
            if (id.includes('/node_modules/')) {
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
