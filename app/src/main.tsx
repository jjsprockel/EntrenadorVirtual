import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// Polyfill crypto.randomUUID for Safari < 15.4 (uses getRandomValues which is universally supported)
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  Object.defineProperty(crypto, 'randomUUID', {
    value: function randomUUID(): `${string}-${string}-${string}-${string}-${string}` {
      return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
        const n = Number(c);
        return (n ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))).toString(16);
      }) as `${string}-${string}-${string}-${string}-${string}`;
    },
    writable: false,
    configurable: true,
  });
}

// Dark mode as default — class toggled by theme system later
document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
