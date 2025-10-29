import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QuoteStoreProvider } from './store/QuoteStoreProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QuoteStoreProvider>
      <App />
    </QuoteStoreProvider>
  </React.StrictMode>
);
