import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@vault/shared': resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Vault',
      formats: ['iife'],
      fileName: () => 'vault.js',
    },
    outDir: '../../extensions/theme-extension/assets',
    emptyOutDir: false,
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
