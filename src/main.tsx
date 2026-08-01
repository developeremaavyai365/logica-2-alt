import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { ShopStoreProvider } from './store';
import { AuthStoreProvider } from './auth-store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthStoreProvider>
        <ShopStoreProvider>
          <App />
        </ShopStoreProvider>
      </AuthStoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
