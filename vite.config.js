import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Memaksa Vite untuk menyertakan library ini di awal
    include: ['@apollo/client', 'graphql'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})