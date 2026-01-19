import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      // Hot Module Replacement (HMR) - detecta mudanças automaticamente
      hmr: {
        host: 'localhost',
        port: 5173,
        protocol: 'ws',
      },
      // Watch com sensibilidade aprimorada
      watch: {
        usePolling: true,  // Use polling para detectar mudanças (importante em WSL/VM)
        interval: 100,     // Verificar a cada 100ms
      }
    },
    build: {
      outDir: path.resolve(__dirname, '..', 'dist'),
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
