# Tracking Implementation - Tigube

## Übersicht

Diese Tracking-Implementierung bietet eine vollständige, DSGVO-konforme Lösung für Google Analytics 4 und Meta Pixel Integration in der Tigube-Plattform.

## Komponenten

### 1. Google Analytics 4 (GA4)
- **GTM Container ID**: `GTM-T72XP5MR`
- **Features**: Page Views, Events, Conversions, E-Commerce Tracking
- **Cookie-Kategorie**: Analytics

### 2. Meta Pixel (Facebook)
- **Pixel ID**: `1118767467115751`
- **Features**: Page Views, Custom Events, Conversions, Lead Tracking
- **Cookie-Kategorie**: Marketing

### 3. Cookie Consent
- **DSGVO-konform**: Vollständige Cookie-Einverständnis-Verwaltung
- **Kategorien**: Notwendig, Analytics, Marketing
- **Speicherung**: LocalStorage

## Implementierte Events

### Page Views
- Automatisches Tracking bei Routenwechseln
- Berücksichtigt Cookie-Einverständnis

### User Engagement
- **Registrierung**: `trackRegistration(userType)`
- **Suche**: `trackSearch(searchTerm, resultsCount)`
- **Profil-Views**: `trackProfileView(profileType, profileId)`
- **Kontakt**: `trackContact(contactType, targetId)`

### Conversions
- **Abonnements**: `trackSubscription(planType, value)`
- **Zahlungen**: `trackConversion(conversionType, value)`
- **Custom Events**: `trackEvent(eventName, category, label, value)`

## Verwendung

### 1. Tracking Hook verwenden
```typescript
import { useTracking } from '../lib/tracking';

function MyComponent() {
  const { trackEvent, trackSearch } = useTracking();
  
  const handleSearch = (term: string) => {
    trackSearch(term, results.length);
  };
}
```

### 2. Cookie-Einverständnis anzeigen
```typescript
const { showCookieConsent } = useTracking();

// Cookie-Banner manuell anzeigen
showCookieConsent();
```

## Cookie-Kategorien

### Notwendige Cookies
- **Immer aktiv**: Grundfunktionen der Website
- **Keine Einverständnis erforderlich**

### Analytics Cookies
- **Google Analytics**: Website-Nutzung analysieren
- **Einverständnis erforderlich**: Benutzer kann ablehnen

### Marketing Cookies
- **Meta Pixel**: Werbung und Remarketing
- **Einverständnis erforderlich**: Benutzer kann ablehnen

## DSGVO-Compliance

### Datenschutz
- **Opt-in**: Alle Tracking-Services erfordern Einverständnis
- **Granulare Kontrolle**: Benutzer können Kategorien einzeln wählen
- **Speicherung**: Präferenzen in LocalStorage
- **Widerruf**: Cookie-Einstellungen jederzeit änderbar

### Transparenz
- **Cookie-Banner**: Klare Informationen über verwendete Cookies
- **Kategorien**: Detaillierte Beschreibung jeder Cookie-Kategorie
- **Zweck**: Erklärung des Nutzens für Benutzer

## Konfiguration

### Environment Variables
```env
VITE_GA_GTM_ID=GTM-T72XP5MR
VITE_META_PIXEL_ID=1118767467115751
```

### TrackingProvider Setup
```typescript
<TrackingProvider 
  enableGoogleAnalytics={true}
  enableMetaPixel={true}
  metaPixelId="1118767467115751"
>
  <App />
</TrackingProvider>
```

## Debugging

### Console Logs
- **Initialisierung**: Tracking-Services werden geloggt
- **Events**: Alle Tracking-Events werden in der Konsole angezeigt
- **Cookie-Präferenzen**: Gespeicherte Einstellungen werden geloggt

### Browser DevTools
- **Google Analytics**: GA4 Debug View
- **Meta Pixel**: Facebook Pixel Helper Extension
- **Network Tab**: Tracking-Requests überwachen

## Best Practices

### 1. Event-Naming
- **Konsistent**: Verwende einheitliche Event-Namen
- **Beschreibend**: Namen sollten den Zweck klar machen
- **Kategorisiert**: Gruppiere verwandte Events

### 2. Performance
- **Lazy Loading**: Tracking wird nur bei Einverständnis geladen
- **Debouncing**: Vermeide zu häufige Event-Aufrufe
- **Error Handling**: Graceful Fallbacks bei Fehlern

### 3. Privacy
- **Minimal**: Sammle nur notwendige Daten
- **Transparent**: Informiere Benutzer über Datensammlung
- **Kontrollierbar**: Ermögliche einfache Deaktivierung

## Wartung

### Updates
- **Dependencies**: Regelmäßige Updates der Tracking-Libraries
- **Compliance**: DSGVO-Änderungen berücksichtigen
- **Testing**: Regelmäßige Tests der Tracking-Funktionalität

### Monitoring
- **Analytics**: Überwache Tracking-Performance
- **Errors**: Überwache Fehler in Tracking-Services
- **Compliance**: Regelmäßige DSGVO-Audits

## Support

Bei Fragen oder Problemen mit dem Tracking-System:
1. Console-Logs überprüfen
2. Cookie-Einstellungen prüfen
3. Network-Tab für Request-Status
4. Browser-Extensions für Debugging verwenden
