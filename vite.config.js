import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/pixi.js') || id.includes('node_modules/@pixi')) {
            if (
              id.includes('/rendering/') ||
              id.includes('/filters/') ||
              id.includes('/spritesheet/')
            ) {
              return 'pixi-rendering';
            }

            if (
              id.includes('/scene/') ||
              id.includes('/app/') ||
              id.includes('/assets/') ||
              id.includes('/events/')
            ) {
              return 'pixi-scene';
            }

            return 'pixi-core';
          }

          if (id.includes('node_modules/sql.js')) {
            return 'sqljs';
          }

          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
})
