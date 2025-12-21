import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// NOVO: Shim robusto para o objeto `process` em ambientes de navegador.
// Isso ajuda a prevenir erros de "process is not defined" e propriedades indefinidas
// em bibliotecas Node.js-centricas como @google/genai quando executadas no browser.
if (typeof window.process === 'undefined') {
  (window as any).process = {
    env: {}, // `process.env.API_KEY` será undefined aqui se não injetado por um bundler
    versions: { node: 'browser' }, // Simula uma versão Node.js
    platform: navigator.platform?.toLowerCase() || 'browser', // Simula a plataforma
    cwd: () => '/', // Simula o diretório de trabalho atual
    nextTick: (callback: Function, ...args: any[]) => setTimeout(() => callback(...args), 0), // Simula nextTick com setTimeout
    // Adicione outras propriedades conforme necessário se erros adicionais aparecerem
    // stdout: { write: (msg: string) => console.log(msg) },
    // stderr: { write: (msg: string) => console.error(msg) },
    // browser: true // Indica que está no navegador
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  });
}