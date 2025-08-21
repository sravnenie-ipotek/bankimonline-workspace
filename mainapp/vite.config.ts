import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
          // State management
          'state-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          // Form handling
          'form-vendor': ['formik', 'yup', 'yup-password', 'yup-phone-lite'],
          // Utilities
          'utils-vendor': ['axios', 'moment', 'date-fns', 'classnames', 'js-cookie'],
          // i18n
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          // UI components
          'components-vendor': ['react-select', 'react-datepicker', 'react-dropzone', 'react-phone-input-2', 'react-otp-input', 'swiper', 'react-toastify']
        }
      }
    },
    chunkSizeWarningLimit: 500, // Optimize for 500KB chunks
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    host: true, // Bind to all interfaces (IPv4 + IPv6) for Cypress compatibility
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8003',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8003',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}) 