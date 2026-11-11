import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles.css';
import App from './App.jsx';

// Public listing images originate from dealer-managed storage. Keep an unavailable
// asset from leaving a broken-image icon in otherwise complete vehicle cards.
window.addEventListener('error', (event) => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.closest('.rv-detail-image, .rv-vehicle-image')) {
    image.parentElement?.classList.add('image-failed');
  }
}, true);
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
