import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  define: { 'import.meta.env.VITE_DEMO_MODE': '"true"' },
  build: { outDir: '/tmp/claude-0/preview-dist', emptyOutDir: true, cssCodeSplit: false, assetsInlineLimit: 100000000, modulePreload: false, rollupOptions: { output: { inlineDynamicImports: true } } },
})
