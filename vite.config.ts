// Vite-Konfiguration für das Projekt (React + TailwindCSS + HTTPS)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/cert.pem')),
    },
    port: 3001,
    proxy: {
    '/rest': {
      target: 'https://localhost:3000',
      secure: false,
    },
    '/auth/token': {
      target: 'https://localhost:3000',
      secure: false,
    },
    '/dev/db_populate': {
      target: 'https://localhost:3000',
      secure: false,
    },
  }
  },
});
