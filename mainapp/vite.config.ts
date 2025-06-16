import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    server: {
      port: 5174,
    },
    resolve: {
      alias: {
        '@assets': resolve(__dirname, './src/assets'),
        '@pages': resolve(__dirname, './src/components/pages'),
        '@src': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@static': resolve(__dirname, './static'),
        '@lib': resolve(__dirname, './src/lib'),
        '@shared': resolve(__dirname, './src/shared'),
        '@context': resolve(__dirname, './src/context'),
        '@types': resolve(__dirname, './src/types'),
      },
    },
    define: {
      // Make env variables available in the app
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      'process.env.VITE_NODE_API_BASE_URL': JSON.stringify(env.VITE_NODE_API_BASE_URL),
      'process.env.VITE_ACCOUNT_URL': JSON.stringify(env.VITE_ACCOUNT_URL),
      'process.env.VITE_ENVIRONMENT': JSON.stringify(env.VITE_ENVIRONMENT),
    }
  }
}) 