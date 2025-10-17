/**
 * Meta Pixel (Facebook Pixel) Integration
 * For Facebook advertising and conversion tracking
 */

declare global {
  interface Window {
    fbq: {
      (...args: any[]): void;
      q?: any[];
      callMethod?: (...args: any[]) => void;
      push?: (...args: any[]) => void;
      loaded?: boolean;
      version?: string;
    };
  }
}

export interface MetaPixelEvent {
  eventName: string;
  eventID?: string;
  customData?: Record<string, any>;
  value?: number;
  currency?: string;
}

export interface MetaPixelUserData {
  em?: string; // email
  ph?: string; // phone
  fn?: string; // first name
  ln?: string; // last name
  ct?: string; // city
  st?: string; // state
  zp?: string; // zip code
  country?: string;
}

class MetaPixel {
  private pixelId: string;
  private isInitialized: boolean = false;

  constructor(pixelId: string) {
    this.pixelId = pixelId;
  }

  /**
   * Initialize Meta Pixel
   */
  public initialize(): void {
    if (this.isInitialized) return;

    // Initialize fbq function
    window.fbq = window.fbq || function() {
      (window.fbq.q = window.fbq.q || []).push(arguments);
    };

    // Load Meta Pixel script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    // Initialize pixel
    window.fbq('init', this.pixelId);
    window.fbq('track', 'PageView');

    this.isInitialized = true;
    console.log('Meta Pixel initialized with ID:', this.pixelId);
  }

  /**
   * Track page views
   */
  public trackPageView(): void {
    if (!this.isInitialized) {
      console.warn('Meta Pixel not initialized');
      return;
    }

    window.fbq('track', 'PageView');
  }

  /**
   * Track custom events
   */
  public trackEvent(event: MetaPixelEvent): void {
    if (!this.isInitialized) {
      console.warn('Meta Pixel not initialized');
      return;
    }

    const eventData: any = {
      event: event.eventName,
    };

    if (event.eventID) eventData.eventID = event.eventID;
    if (event.customData) eventData.custom_data = event.customData;
    if (event.value) eventData.value = event.value;
    if (event.currency) eventData.currency = event.currency;

    window.fbq('track', event.eventName, eventData);
  }

  /**
   * Track user registration
   */
  public trackRegistration(userType: 'owner' | 'caretaker', userData?: MetaPixelUserData): void {
    this.trackEvent({
      eventName: 'CompleteRegistration',
      customData: {
        content_name: `${userType}_registration`,
        content_category: 'user_registration',
        user_type: userType,
        ...userData,
      },
    });
  }

  /**
   * Track search events
   */
  public trackSearch(searchTerm: string, resultsCount?: number): void {
    this.trackEvent({
      eventName: 'Search',
      customData: {
        search_string: searchTerm,
        content_category: 'pet_care_search',
        results_count: resultsCount,
      },
    });
  }

  /**
   * Track profile views
   */
  public trackProfileView(profileType: 'betreuer' | 'dienstleister', profileId: string): void {
    this.trackEvent({
      eventName: 'ViewContent',
      customData: {
        content_type: 'profile',
        content_name: `${profileType}_profile`,
        content_ids: [profileId],
        content_category: 'pet_care_profile',
      },
    });
  }

  /**
   * Track contact/message events
   */
  public trackContact(contactType: 'message' | 'phone' | 'email', targetId: string): void {
    this.trackEvent({
      eventName: 'Contact',
      customData: {
        content_type: 'contact',
        content_name: `${contactType}_contact`,
        content_ids: [targetId],
        content_category: 'pet_care_contact',
      },
    });
  }

  /**
   * Track subscription/purchase events
   */
  public trackPurchase(planType: string, value: number, currency: string = 'EUR'): void {
    this.trackEvent({
      eventName: 'Purchase',
      value: value,
      currency: currency,
      customData: {
        content_type: 'subscription',
        content_name: planType,
        content_category: 'pet_care_subscription',
      },
    });
  }

  /**
   * Track lead generation
   */
  public trackLead(leadType: string, value?: number): void {
    this.trackEvent({
      eventName: 'Lead',
      value: value,
      customData: {
        content_name: leadType,
        content_category: 'pet_care_lead',
      },
    });
  }

  /**
   * Track add to cart (for subscription plans)
   */
  public trackAddToCart(planType: string, value: number): void {
    this.trackEvent({
      eventName: 'AddToCart',
      value: value,
      currency: 'EUR',
      customData: {
        content_type: 'subscription',
        content_name: planType,
        content_category: 'pet_care_subscription',
      },
    });
  }

  /**
   * Track initiate checkout
   */
  public trackInitiateCheckout(planType: string, value: number): void {
    this.trackEvent({
      eventName: 'InitiateCheckout',
      value: value,
      currency: 'EUR',
      customData: {
        content_type: 'subscription',
        content_name: planType,
        content_category: 'pet_care_subscription',
      },
    });
  }

  /**
   * Track custom conversions
   */
  public trackCustomConversion(conversionName: string, value?: number, customData?: Record<string, any>): void {
    this.trackEvent({
      eventName: 'CustomEvent',
      value: value,
      customData: {
        event_name: conversionName,
        content_category: 'pet_care_custom',
        ...customData,
      },
    });
  }
}

// Export singleton instance
export const metaPixel = new MetaPixel('1118767467115751');
export default metaPixel;
