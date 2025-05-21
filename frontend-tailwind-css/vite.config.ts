import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ✅ expose to Docker host
    port: 5173,       // optional, but keeps it consistent
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
