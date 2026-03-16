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
  },

  build: {
    target: 'es2020',
    minify: 'esbuild',

    commonjsOptions: {
      include: [/three/, /lucide-react/, /node_modules/],
      transformMixedEsModules: true,
    },

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('three') || id.includes('@react-three')) return 'vendor-three'
          if (id.includes('recharts') || id.includes('d3-'))        return 'vendor-charts'
          if (id.includes('framer-motion'))                         return 'vendor-motion'
          if (id.includes('lucide-react'))                          return 'vendor-icons'
          if (id.includes('node_modules'))                          return 'vendor'
        },
      },
      onwarn(warning, warn) {
        if (
          warning.code === 'THIS_IS_UNDEFINED'      ||
          warning.code === 'SOURCEMAP_ERROR'        ||
          warning.code === 'MODULE_LEVEL_DIRECTIVE'
        ) return
        warn(warning)
      },
    },
  },

  esbuild: {
    keepNames: true,   // ← THE actual fix: stops minifier renaming functions to 'r'
  },
})
