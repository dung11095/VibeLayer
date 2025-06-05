import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        control: path.resolve(__dirname, 'public/control.html'),
        overlay: path.resolve(__dirname, 'public/overlay.html')
      },
    },
  },
  server: {
    port: 5173
  },
});
