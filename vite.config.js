import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },

  // ── Pre-bundle these so Vite doesn't mangle their ESM internals ──
  optimizeDeps: {
    include: [
      'lucide-react',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'framer-motion',
      'recharts',
      'zustand',
    ],
    exclude: [],
  },

  build: {
    // Keep esbuild minification (fast) but fix the CJS interop issue
    commonjsOptions: {
      include: [/three/, /lucide-react/, /node_modules/],
      transformMixedEsModules: true,   // ← key fix for "r is not a function"
    },

    rollupOptions: {
      output: {
        // Split heavy 3D/chart libs into their own chunks so they
        // get their own scope and don't collide with app code
        manualChunks(id) {
          if (id.includes('three') || id.includes('@react-three')) {
            return 'vendor-three'
          }
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) {
            return 'vendor-charts'
          }
          if (id.includes('framer-motion')) {
            return 'vendor-motion'
          }
          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
