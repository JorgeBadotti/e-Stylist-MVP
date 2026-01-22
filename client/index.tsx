import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/utils/fetchInterceptor'; // 🔄 Ativar interceptor de fetch para sessionId

// Export UserContext para ser usado em outros componentes
export { UserContext } from './src/contexts/UserContext';

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