import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@src': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@assets': resolve(__dirname, './src/assets'),
      '@lib': resolve(__dirname, './src/lib'),
      '@shared': resolve(__dirname, './src/shared'),
      '@context': resolve(__dirname, './src/context'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@types': resolve(__dirname, './src/types'),
    },
  },
}) 