/**
 * Google Analytics 4 (GA4) Integration
 * GTM Container ID: GTM-T72XP5MR
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export interface GA4Event {
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface PageViewEvent {
  page_title: string;
  page_location: string;
  page_path: string;
}

class GoogleAnalytics {
  private gtmId: string;
  private isInitialized: boolean = false;

  constructor(gtmId: string) {
    this.gtmId = gtmId;
  }

  /**
   * Initialize Google Analytics with GTM
   */
  public initialize(): void {
    if (this.isInitialized) return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // GTM script
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${this.gtmId}`;
    document.head.appendChild(gtmScript);

    // GTM noscript fallback
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${this.gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    // Initialize gtag
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', this.gtmId, {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });

    this.isInitialized = true;
    console.log('Google Analytics initialized with GTM:', this.gtmId);
  }

  /**
   * Track page views
   */
  public trackPageView(pageData: PageViewEvent): void {
    if (!this.isInitialized) {
      console.warn('Google Analytics not initialized');
      return;
    }

    window.gtag('config', this.gtmId, {
      page_title: pageData.page_title,
      page_location: pageData.page_location,
      page_path: pageData.page_path,
    });
  }

  /**
   * Track custom events
   */
  public trackEvent(event: GA4Event): void {
    if (!this.isInitialized) {
      console.warn('Google Analytics not initialized');
      return;
    }

    const eventData: any = {
      event: event.event_name,
    };

    if (event.event_category) eventData.event_category = event.event_category;
    if (event.event_label) eventData.event_label = event.event_label;
    if (event.value) eventData.value = event.value;
    if (event.custom_parameters) {
      Object.assign(eventData, event.custom_parameters);
    }

    window.gtag('event', event.event_name, eventData);
  }

  /**
   * Track user engagement
   */
  public trackEngagement(action: string, category: string, label?: string, value?: number): void {
    this.trackEvent({
      event_name: action,
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  /**
   * Track conversion events
   */
  public trackConversion(conversionType: string, value?: number, currency: string = 'EUR'): void {
    this.trackEvent({
      event_name: 'conversion',
      event_category: 'ecommerce',
      event_label: conversionType,
      value: value,
      custom_parameters: {
        currency: currency,
        conversion_type: conversionType,
      },
    });
  }

  /**
   * Track user registration
   */
  public trackRegistration(userType: 'owner' | 'caretaker'): void {
    this.trackEvent({
      event_name: 'sign_up',
      event_category: 'engagement',
      event_label: userType,
      custom_parameters: {
        user_type: userType,
      },
    });
  }

  /**
   * Track search events
   */
  public trackSearch(searchTerm: string, resultsCount?: number): void {
    this.trackEvent({
      event_name: 'search',
      event_category: 'engagement',
      event_label: searchTerm,
      value: resultsCount,
      custom_parameters: {
        search_term: searchTerm,
        results_count: resultsCount,
      },
    });
  }

  /**
   * Track profile views
   */
  public trackProfileView(profileType: 'betreuer' | 'dienstleister', profileId: string): void {
    this.trackEvent({
      event_name: 'view_item',
      event_category: 'engagement',
      event_label: profileType,
      custom_parameters: {
        profile_type: profileType,
        profile_id: profileId,
      },
    });
  }

  /**
   * Track contact/message events
   */
  public trackContact(contactType: 'message' | 'phone' | 'email', targetId: string): void {
    this.trackEvent({
      event_name: 'contact',
      event_category: 'engagement',
      event_label: contactType,
      custom_parameters: {
        contact_type: contactType,
        target_id: targetId,
      },
    });
  }

  /**
   * Track subscription events
   */
  public trackSubscription(planType: string, value: number): void {
    this.trackEvent({
      event_name: 'purchase',
      event_category: 'ecommerce',
      event_label: planType,
      value: value,
      custom_parameters: {
        plan_type: planType,
        currency: 'EUR',
      },
    });
  }
}

// Export singleton instance
export const googleAnalytics = new GoogleAnalytics('GTM-T72XP5MR');
export default googleAnalytics;
