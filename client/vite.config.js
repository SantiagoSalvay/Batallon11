import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:4000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
    server: {
      host: true,
      port: 5173,
      // Permite abrir el dev server desde el celular (IP de la red Wi‑Fi).
      allowedHosts: true,
      proxy: {
        '/api': { target: apiUrl, changeOrigin: true },
        '/uploads': { target: apiUrl, changeOrigin: true },
      },
    },
  };
});
