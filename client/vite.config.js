import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function originFromUrl(rawUrl) {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

function contentSecurityPolicy(command, apiUrl) {
  const common = [
    "default-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
  ];

  if (command === 'serve') {
    return [
      ...common,
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' http://127.0.0.1:* http://localhost:* http://10.0.0.0/8 http://192.168.0.0/16 http://172.16.0.0/12 ws://127.0.0.1:* ws://localhost:* ws://10.0.0.0/8 ws://192.168.0.0/16 ws://172.16.0.0/12 wss: https://challenges.cloudflare.com",
    ].join('; ');
  }

  const apiOrigin = originFromUrl(apiUrl);
  const connectSrc = ["'self'", 'https://challenges.cloudflare.com'];
  if (apiOrigin) connectSrc.push(apiOrigin);

  return [
    ...common,
    "script-src 'self'",
    `connect-src ${connectSrc.join(' ')}`,
  ].join('; ');
}

function cspPlugin(command, apiUrl) {
  return {
    name: 'batallon-csp',
    transformIndexHtml(html) {
      const meta = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(command, apiUrl)}" />`;
      return html.replace('</head>', `    ${meta}\n  </head>`);
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:4000';
  const cspApiUrl = env.VITE_API_URL || '';
  const allowedHosts = env.VITE_ALLOWED_HOSTS === 'all'
    ? true
    : (env.VITE_ALLOWED_HOSTS || '').split(',').map((host) => host.trim()).filter(Boolean);

  return {
    plugins: [react(), cspPlugin(command, cspApiUrl)],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
    server: {
      host: env.VITE_DEV_HOST || '127.0.0.1',
      port: 5173,
      allowedHosts,
      proxy: {
        '/api': { target: apiUrl, changeOrigin: true },
        '/uploads': { target: apiUrl, changeOrigin: true },
      },
    },
  };
});
