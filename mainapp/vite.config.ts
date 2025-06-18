import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
      jsxImportSource: 'react',
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
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
}) 