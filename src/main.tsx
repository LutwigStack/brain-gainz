import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import './index.css';
import { applyPixelThemeCssVariables } from './theme/pixel';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element "#root" was not found.');
}

applyPixelThemeCssVariables(document.documentElement.style);

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
