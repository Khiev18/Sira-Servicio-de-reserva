import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const host = process.env.VITE_HOST || '127.0.0.1';
const port = Number(process.env.VITE_PORT || 5174);
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    host,
    port,
    strictPort: true,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      }
    }
  }
});
