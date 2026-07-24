import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      // Matches the admin panel's shadcn/ui alias convention (@/components,
      // @/lib, @/hooks all resolve under here) so ported files' imports
      // work unchanged.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  },
  optimizeDeps: {
    // Pre-bundles rrweb-player (MarketingDashboard.jsx's session-replay
    // viewer) - originally added because Rollup failed to resolve it when
    // it was a dynamic import; it's a static import today (imported inside
    // MarketingDashboard.jsx, which Router.jsx now lazy-loads as a whole -
    // Part B.5), but this entry is left in place defensively since it's
    // harmless and previously fixed a real production-build failure.
    include: ['rrweb-player'],
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: false
    }
  }
})
