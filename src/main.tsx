import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Proteção global contra serialização circular em manipuladores de eventos e scripts de terceiros
if (typeof window !== 'undefined') {
  const origStringify = JSON.stringify;
  JSON.stringify = function (value: any, replacer?: any, space?: any): string {
    const seen = new WeakSet();
    const safeReplacer = (key: string, val: any) => {
      if (val !== null && typeof val === 'object') {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      if (typeof replacer === 'function') {
        return replacer(key, val);
      }
      return val;
    };
    try {
      return origStringify(value, safeReplacer, space);
    } catch {
      try {
        return origStringify(value, undefined, space);
      } catch {
        return '{}';
      }
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
