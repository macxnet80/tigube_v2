/**
 * Tracking Provider - Centralized tracking management
 * Handles initialization and coordination of all tracking services
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { googleAnalytics } from './GoogleAnalytics';
import { metaPixel } from './MetaPixel';
import CookieConsent from '../../components/ui/CookieConsent';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface TrackingContextType {
  trackPageView: (pageTitle: string, pagePath: string) => void;
  trackEvent: (eventName: string, category: string, label?: string, value?: number) => void;
  trackRegistration: (userType: 'owner' | 'caretaker') => void;
  trackSearch: (searchTerm: string, resultsCount?: number) => void;
  trackProfileView: (profileType: 'betreuer' | 'dienstleister', profileId: string) => void;
  trackContact: (contactType: 'message' | 'phone' | 'email', targetId: string) => void;
  trackSubscription: (planType: string, value: number) => void;
  trackConversion: (conversionType: string, value?: number) => void;
  isInitialized: boolean;
  cookiePreferences: CookiePreferences | null;
  showCookieConsent: () => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

interface TrackingProviderProps {
  children: React.ReactNode;
  enableGoogleAnalytics?: boolean;
  enableMetaPixel?: boolean;
  metaPixelId?: string;
}

export function TrackingProvider({ 
  children, 
  enableGoogleAnalytics = true, 
  enableMetaPixel = false,
  metaPixelId 
}: TrackingProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Load cookie preferences
    const loadCookiePreferences = () => {
      const consent = localStorage.getItem('cookie-consent');
      if (consent) {
        try {
          const preferences = JSON.parse(consent);
          setCookiePreferences(preferences);
        } catch (error) {
          console.error('Error loading cookie preferences:', error);
        }
      } else {
        setShowCookieBanner(true);
      }
    };

    loadCookiePreferences();
  }, []);

  useEffect(() => {
    // Initialize tracking services based on cookie preferences
    const initializeTracking = async () => {
      try {
        if (cookiePreferences) {
          if (enableGoogleAnalytics && cookiePreferences.analytics) {
            googleAnalytics.initialize();
          }

          if (enableMetaPixel && metaPixelId && cookiePreferences.marketing) {
            metaPixel.initialize();
          }
        }

        setIsInitialized(true);
        console.log('Tracking services initialized with preferences:', cookiePreferences);
      } catch (error) {
        console.error('Error initializing tracking services:', error);
      }
    };

    if (cookiePreferences) {
      initializeTracking();
    }
  }, [enableGoogleAnalytics, enableMetaPixel, metaPixelId, cookiePreferences]);

  // Track page views on route changes
  useEffect(() => {
    if (isInitialized) {
      const pageTitle = document.title;
      const pagePath = location.pathname + location.search;
      
      trackPageView(pageTitle, pagePath);
    }
  }, [location, isInitialized]);

  const trackPageView = (pageTitle: string, pagePath: string) => {
    if (!isInitialized) return;

    const pageLocation = window.location.href;

    if (enableGoogleAnalytics && cookiePreferences?.analytics) {
      googleAnalytics.trackPageView({
        page_title: pageTitle,
        page_location: pageLocation,
        page_path: pagePath,
      });
    }

    if (enableMetaPixel && cookiePreferences?.marketing) {
      metaPixel.trackPageView();
    }
  };

  const trackEvent = (eventName: string, category: string, label?: string, value?: number) => {
    if (!isInitialized) return;

    if (enableGoogleAnalytics && cookiePreferences?.analytics) {
      googleAnalytics.trackEngagement(eventName, category, label, value);
    }

    if (enableMetaPixel && cookiePreferences?.marketing) {
      metaPixel.trackCustomConversion(eventName, value, {
        category,
        label,
      });
    }
  };

  const trackRegistration = (userType: 'owner' | 'caretaker') => {
    if (!isInitialized) return;

    if (enableGoogleAnalytics && cookiePreferences?.analytics) {
      googleAnalytics.trackRegistration(userType);
    }

    if (enableMetaPixel && cookiePreferences?.marketing) {
      metaPixel.trackRegistration(userType);
    }
  };

  const trackSearch = (searchTerm: string, resultsCount?: number) => {
    if (!isInitialized) return;

    if (enableGoogleAnalytics && cookiePreferences?.analytics) {
      googleAnalytics.trackSearch(searchTerm, resultsCount);
    }

    if (enableMetaPixel && cookiePreferences?.marketing) {
      metaPixel.trackSearch(searchTerm, resultsCount);
    }
  };

  const trackProfileView = (profileType: 'betreuer' | 'dienstleister', profileId: string) => {
    if (!isInitialized) return;

    if (enableGoogleAnalytics && cookiePreferences?.analytics) {
      googleAnalytics.trackProfileView(profileType, profileId);
    }

    if (enableMetaPixel && cookiePreferences?.marketing) {
      metaPixel.trackProfileView(profileType, profileId);
    }
  };

  const trackContact = (contactType: 'message' | 'phone' | 'email', targetId: string) => {
    if (!isInitialized) return;

    if (enableGoogleAnalytics && cookiePreferences?.analytics) {
      googleAnalytics.trackContact(contactType, targetId);
    }

    if (enableMetaPixel && cookiePreferences?.marketing) {
      metaPixel.trackContact(contactType, targetId);
    }
  };

  const trackSubscription = (planType: string, value: number) => {
    if (!isInitialized) return;

    if (enableGoogleAnalytics && cookiePreferences?.analytics) {
      googleAnalytics.trackSubscription(planType, value);
    }

    if (enableMetaPixel && cookiePreferences?.marketing) {
      metaPixel.trackPurchase(planType, value);
    }
  };

  const trackConversion = (conversionType: string, value?: number) => {
    if (!isInitialized) return;

    if (enableGoogleAnalytics && cookiePreferences?.analytics) {
      googleAnalytics.trackConversion(conversionType, value);
    }

    if (enableMetaPixel && cookiePreferences?.marketing) {
      metaPixel.trackCustomConversion(conversionType, value);
    }
  };

  const handleConsentChange = (preferences: CookiePreferences) => {
    setCookiePreferences(preferences);
    setShowCookieBanner(false);
    
    // Re-initialize tracking services based on new preferences
    if (preferences.analytics && enableGoogleAnalytics) {
      googleAnalytics.initialize();
    }
    
    if (preferences.marketing && enableMetaPixel && metaPixelId) {
      metaPixel.initialize();
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    handleConsentChange(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    handleConsentChange(onlyNecessary);
  };

  const showCookieConsent = () => {
    setShowCookieBanner(true);
  };

  const contextValue: TrackingContextType = {
    trackPageView,
    trackEvent,
    trackRegistration,
    trackSearch,
    trackProfileView,
    trackContact,
    trackSubscription,
    trackConversion,
    isInitialized,
    cookiePreferences,
    showCookieConsent,
  };

  return (
    <TrackingContext.Provider value={contextValue}>
      {children}
      {showCookieBanner && (
        <CookieConsent
          onConsentChange={handleConsentChange}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
        />
      )}
    </TrackingContext.Provider>
  );
}

export function useTracking(): TrackingContextType {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
}

export default TrackingProvider;
