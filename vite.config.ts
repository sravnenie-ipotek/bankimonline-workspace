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
        '@components': path.resolve(__dirname, './src/components'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@static': path.resolve(__dirname, './src/static'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@context': path.resolve(__dirname, './src/context'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@types': path.resolve(__dirname, './src/types'),
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
  }
})
