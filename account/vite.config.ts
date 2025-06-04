import path from 'path'
import { defineConfig } from 'vite'
import viteSvgr from 'vite-plugin-svgr'

import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [
      react(),
      viteSvgr({
        include: '**/*.svg',
      }),
    ],
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@layout': path.resolve(__dirname, './src/components/layout'),
        '@pages': path.resolve(__dirname, './src/components/pages'),
        '@theme': path.resolve(__dirname, './shared/theme'),
      },
    },
    server: {
      port: 3001,
    },
    base: '/account/',
  }
})
