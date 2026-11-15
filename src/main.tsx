import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-ext-400.css';
import '@fontsource/inter/latin-ext-600.css';
import '@fontsource/inter/vietnamese-400.css';
import '@fontsource/inter/vietnamese-500.css';
import '@fontsource/inter/vietnamese-600.css';
import '@fontsource/anton/latin-400.css';
import '@fontsource/anton/vietnamese-400.css';
import '@fontsource/be-vietnam-pro/latin-400.css';
import '@fontsource/be-vietnam-pro/vietnamese-400.css';
import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
