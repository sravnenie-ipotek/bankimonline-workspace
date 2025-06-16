import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteSvgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    build: {
      outDir: 'build',
      commonjsOptions: {
        include: [/node_modules/]
      }
    },
    plugins: [
      react(),
      viteSvgr({
        include: '**/*.svg',
      }),
    ],
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
    resolve: {
      alias: {
        '@assets': path.resolve(__dirname, './src/assets'),
        '@pages': path.resolve(__dirname, './src/components/pages'),
        '@src': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@static': path.resolve(__dirname, './static'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@context': path.resolve(__dirname, './src/context'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@types': path.resolve(__dirname, './src/types'),
      },
    },
    define: {
      // Make env variables available in the app
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      'process.env.VITE_NODE_API_BASE_URL': JSON.stringify(env.VITE_NODE_API_BASE_URL),
      'process.env.VITE_ACCOUNT_URL': JSON.stringify(env.VITE_ACCOUNT_URL),
      'process.env.VITE_ENVIRONMENT': JSON.stringify(env.VITE_ENVIRONMENT),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  }
})
