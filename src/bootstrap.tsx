import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ShopStoreProvider } from './store';
import { AuthStoreProvider } from './auth-store';
import { applyCachedLiveCatalogue, refreshLiveCatalogue } from './live-catalogue';

/* Starts the site. Imported by main.tsx only once the product catalogue is
   decided, so every module here reads the same one. */

// SAP prices and stock: the last list this browser saw at once, then the
// current one as soon as it arrives.
applyCachedLiveCatalogue();
void refreshLiveCatalogue();

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
