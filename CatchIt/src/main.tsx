import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/global.css';

// Register service worker
registerSW({
  onNeedRefresh() {
    // New version available — could show a toast here
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
