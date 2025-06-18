import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Force production mode for all builds
process.env.NODE_ENV = 'production'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Force production regardless of command/mode
  const isProduction = true
  
  return {
    mode: 'production',
    build: {
      outDir: 'build',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    plugins: [
      react({
        babel: {
          plugins: [
            // Force production JSX transform
            ['@babel/plugin-transform-react-jsx', {
              runtime: 'automatic',
              development: false,
              importSource: 'react'
            }]
          ],
          presets: [
            ['@babel/preset-react', {
              runtime: 'automatic',
              development: false
            }]
          ]
        }
      }),
    ],
    define: {
      'process.env.NODE_ENV': '"production"',
      'process.env.VITE_NODE_API_BASE_URL': JSON.stringify(process.env.VITE_NODE_API_BASE_URL),
      'process.env.VITE_ACCOUNT_URL': JSON.stringify(process.env.VITE_ACCOUNT_URL),
      'global': 'globalThis',
      '__DEV__': false,
    },
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
  }
}) 