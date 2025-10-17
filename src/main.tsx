import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './lib/auth/AuthContext';
import { NotificationProvider } from './lib/notifications/NotificationContext';
import { ShortTermAvailabilityProvider } from './contexts/ShortTermAvailabilityContext';
import { TrackingProvider } from './lib/tracking/TrackingProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TrackingProvider 
        enableGoogleAnalytics={true}
        enableMetaPixel={true}
        metaPixelId="1118767467115751"
      >
        <AuthProvider>
          <NotificationProvider>
            <ShortTermAvailabilityProvider>
              <App />
            </ShortTermAvailabilityProvider>
          </NotificationProvider>
        </AuthProvider>
      </TrackingProvider>
    </BrowserRouter>
  </StrictMode>
);