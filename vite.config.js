import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Expose to all network interfaces so phones/tablets on the
    // same WiFi can access the dev server directly via your PC's IP.
    host: '0.0.0.0',
    port: 5173,
  },
});
