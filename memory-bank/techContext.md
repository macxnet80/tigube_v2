# Tech Context: Tigube v2

## Technologie-Stack

### Frontend-Technologien

#### Core Framework
- **React 18.3**: Moderne React-Features mit Concurrent Features
- **TypeScript 5.2**: Strikte Typisierung für bessere Code-Qualität
- **Vite 5.1**: Schneller Dev-Server und optimierte Builds
- **React Router DOM 6**: Declarative Routing mit Lazy Loading

#### Styling & UI
- **Tailwind CSS 3.4**: Utility-First CSS Framework
- **Headless UI**: Accessible UI-Komponenten ohne Styling
- **Lucide React**: Moderne Icon-Library
- **clsx + tailwind-merge**: Intelligente CSS-Klassen-Komposition

#### State Management
- **Zustand 4.5**: Lightweight State Management für globalen State
- **React Context**: AuthContext für User-Session und Subscription-State
- **Custom Hooks**: useSubscription, useFeatureAccess, useCurrentUsage

### Backend-Technologien

#### Supabase (Backend-as-a-Service)
- **PostgreSQL 15.8.1**: Moderne Datenbank mit erweiterten Features
- **Row Level Security (RLS)**: Vollständige Datenbank-Sicherheit
- **Supabase Auth**: JWT-basierte Authentifizierung
- **Real-time Subscriptions**: WebSocket-Integration für Chat-System
- **Edge Functions**: Serverless-Funktionen für komplexe Logik
- **Storage**: Datei-Upload für Profile-Bilder und Dokumente

#### Datenbank-Architektur
- **25+ Tabellen** mit vollständiger RLS-Implementierung
- **3 optimierte Views** für häufige Abfragen
- **JSONB-Felder** für flexible Datenstrukturen
- **Geografische Daten** mit PostGIS-Integration
- **Automatische Indizierung** aller Primärschlüssel

#### Payment Integration
- **Stripe**: Vollständige Payment-Integration
- **Webhook-Handling**: Automatische Subscription-Updates
- **PCI-Compliance**: Sichere Zahlungsabwicklung
- **Subscription Management**: Abo-Verwaltung mit Feature-Gates

## Datenbank-Integration

### Supabase-Client Setup

#### Client-Konfiguration
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

#### TypeScript-Integration
```typescript
// Automatisch generierte Typen aus Datenbank-Schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          user_type: 'owner' | 'caretaker' | 'admin' | null;
          // ... weitere Felder
        };
        Insert: { /* Insert-Typen */ };
        Update: { /* Update-Typen */ };
      };
      // ... weitere Tabellen
    };
  };
}
```

### Datenbank-Schema-Übersicht

#### Core User Management
```sql
-- Zentrale Benutzerverwaltung
users (
  id: UUID (PK),
  user_type: 'owner' | 'caretaker' | 'admin',
  first_name, last_name, email,
  profile_photo_url, plan_type,
  subscription_status, is_admin,
  admin_role, public_profile_visible
)

-- Betreuer-Profile
caretaker_profiles (
  id: UUID (FK -> users.id),
  bio, hourly_rate, animal_types,
  services_with_categories: JSONB,
  experience_years, qualifications,
  availability: JSONB, short_term_available
)
```

#### Pet & Care Management
```sql
-- Haustier-Profile
pets (
  id: UUID (PK),
  owner_id: UUID (FK -> users.id),
  name, type, breed, age,
  weight, gender, neutered, birth_date
)

-- Betreuungsanfragen
care_requests (
  id: UUID (PK),
  owner_id: UUID (FK -> users.id),
  pet_id: UUID (FK -> pets.id),
  services: JSONB, start_date, end_date,
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
)

-- Buchungen
bookings (
  id: UUID (PK),
  care_request_id: UUID (FK -> care_requests.id),
  caretaker_id: UUID (FK -> caretaker_profiles.id),
  status, price, payment_status
)
```

#### Communication System
```sql
-- Chat-Konversationen
conversations (
  id: UUID (PK),
  owner_id: UUID (FK -> auth.users.id),
  caretaker_id: UUID (FK -> users.id),
  status: 'active' | 'archived' | 'blocked',
  last_message_at
)

-- Einzelne Nachrichten
messages (
  id: UUID (PK),
  conversation_id: UUID (FK -> conversations.id),
  sender_id: UUID (FK -> users.id),
  content, message_type, read_at
)
```

### Row Level Security (RLS)

#### RLS-Policy-Implementierung
```sql
-- Öffentliche Betreuer-Suche
CREATE POLICY "Public can view caretaker profile info" 
  ON public.users 
  FOR SELECT 
  USING (
    user_type = 'caretaker' OR auth.uid() = id
  );

-- Private Benutzerdaten
CREATE POLICY "Users can view own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Verbindungs-basierte Berechtigungen
CREATE POLICY "Connected caretakers can view owner profiles" 
  ON public.users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM owner_caretaker_connections 
      WHERE caretaker_id = auth.uid() 
      AND owner_id = id 
      AND status = 'active'
    )
  );
```

#### RLS-Performance-Optimierung
- **Policy-Caching**: RLS-Policies werden gecacht für bessere Performance
- **Index-Optimierung**: Automatische Indizierung aller Primärschlüssel
- **Query-Optimierung**: Views für häufige Abfragen optimiert

### Datenbank-Views

#### Optimierte Such-Views
```sql
-- caretaker_search_view für optimierte Betreuer-Suche
CREATE VIEW caretaker_search_view AS
SELECT 
  u.id, u.first_name, u.last_name, u.city, u.plz,
  cp.hourly_rate, cp.rating, cp.services_with_categories,
  cp.availability, cp.short_term_available,
  -- Verfügbarkeit nach Wochentagen aufgeteilt
  CASE WHEN cp.availability ? 'Mo' THEN cp.availability ->> 'Mo' ELSE '[]' END AS monday_availability
FROM caretaker_profiles cp
LEFT JOIN users u ON cp.id = u.id
WHERE u.user_type = 'caretaker';
```

#### Werbeanzeigen-Views
```sql
-- advertisements_with_formats für optimierte Werbeanzeigen
CREATE VIEW advertisements_with_formats AS
SELECT 
  a.*, f.name AS format_name, f.width, f.height,
  f.placement, f.function_description
FROM advertisements a
LEFT JOIN advertisement_formats f ON a.format_id = f.id;
```

## Real-time Integration

### WebSocket-Integration

#### Chat-System Real-time
```typescript
// Real-time Chat-Integration
const channel = supabase
  .channel('chat')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      // Neue Nachricht empfangen
      handleNewMessage(payload.new);
    }
  )
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'conversations',
      filter: `id=eq.${conversationId}`
    },
    (payload) => {
      // Konversations-Update (z.B. last_message_at)
      handleConversationUpdate(payload.new);
    }
  )
  .subscribe();
```

#### Subscription-Updates Real-time
```typescript
// Real-time Subscription-Updates
const subscriptionChannel = supabase
  .channel('subscription-updates')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'usage_tracking',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Usage-Tracking-Updates
      handleUsageUpdate(payload);
    }
  )
  .subscribe();
```

### Performance-Optimierung

#### Connection Management
```typescript
// Intelligente Connection-Verwaltung
class RealtimeManager {
  private channels = new Map<string, RealtimeChannel>();
  
  subscribe(table: string, filters: any, callback: Function) {
    const channelKey = `${table}-${JSON.stringify(filters)}`;
    
    if (this.channels.has(channelKey)) {
      return this.channels.get(channelKey);
    }
    
    const channel = supabase
      .channel(channelKey)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
    
    this.channels.set(channelKey, channel);
    return channel;
  }
  
  unsubscribe(table: string, filters: any) {
    const channelKey = `${table}-${JSON.stringify(filters)}`;
    const channel = this.channels.get(channelKey);
    
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelKey);
    }
  }
}
```

## Payment Integration

### Stripe-Integration

#### Client-Side Setup
```typescript
// Stripe-Client-Initialisierung
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

// Checkout-Session erstellen
const createCheckoutSession = async (planType: string) => {
  const stripe = await stripePromise;
  
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planType })
  });
  
  const session = await response.json();
  
  const result = await stripe!.redirectToCheckout({
    sessionId: session.id
  });
  
  if (result.error) {
    console.error(result.error);
  }
};
```

#### Webhook-Handling
```typescript
// Supabase Edge Function für Stripe-Webhooks
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );
    
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(
      `Webhook Error: ${err.message}`,
      { status: 400 }
    );
  }
});
```

### Subscription Management

#### Feature-Gate-Implementierung
```typescript
// Feature-Zugriff mit Usage-Tracking
const useFeatureAccess = (feature: string) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { usage, limit } = useCurrentUsage(feature);
  
  const hasAccess = subscription?.plan_type === 'premium' || 
                   (subscription?.plan_type === 'starter' && usage < limit);
  
  const trackUsage = async () => {
    if (hasAccess) {
      await supabase.from('usage_tracking').insert({
        user_id: user?.id,
        action_type: feature,
        month_year: getCurrentMonthYear()
      });
    }
  };
  
  return { hasAccess, usage, limit, trackUsage };
};
```

## Development Tools

### Build & Development

#### Vite-Konfiguration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          stripe: ['@stripe/stripe-js']
        }
      }
    }
  },
  server: {
    port: 5174,
    host: true
  }
});
```

#### TypeScript-Konfiguration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Code Quality

#### ESLint-Konfiguration
```javascript
// eslint.config.js
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  }
];
```

#### Prettier-Konfiguration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Performance-Optimierung

### Bundle-Optimierung

#### Code-Splitting
```typescript
// Lazy Loading für alle Routen
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

// Mit Suspense
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/suche" element={<SearchPage />} />
    <Route path="/profil" element={<ProfilePage />} />
    <Route path="/chat" element={<ChatPage />} />
  </Routes>
</Suspense>
```

#### Dynamic Imports
```typescript
// Dynamische Imports für schwere Libraries
const loadStripe = async () => {
  if (typeof window !== 'undefined') {
    const { loadStripe } = await import('@stripe/stripe-js');
    return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return null;
};
```

### Database Performance

#### Query-Optimierung
```typescript
// Optimierte Betreuer-Suche
const searchCaretakers = async (filters: SearchFilters) => {
  let query = supabase
    .from('caretaker_search_view')
    .select('*');
  
  // Filter anwenden
  if (filters.petType) {
    query = query.contains('animal_types', [filters.petType]);
  }
  
  if (filters.location) {
    query = query.ilike('city', `%${filters.location}%`);
  }
  
  if (filters.service) {
    query = query.contains('services_with_categories', [
      { name: filters.service }
    ]);
  }
  
  const { data, error } = await query
    .order('rating', { ascending: false })
    .limit(20);
  
  return { data, error };
};
```

#### Caching-Strategien
```typescript
// React Query für API-Caching
const { data: caretakers, isLoading } = useQuery({
  queryKey: ['caretakers', searchParams],
  queryFn: () => searchCaretakers(searchParams),
  staleTime: 5 * 60 * 1000, // 5 Minuten
  cacheTime: 10 * 60 * 1000, // 10 Minuten
  refetchOnWindowFocus: false
});
```

## Security Implementation

### Authentication Security

#### JWT-Token-Management
```typescript
// Token-Validierung und -Erneuerung
const validateToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    // Token ungültig, zur Anmeldung weiterleiten
    await signOut();
    return null;
  }
  
  // Token ist gültig
  return session.user;
};
```

#### Session-Management
```typescript
// Automatische Session-Verwaltung
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

### Data Protection

#### Input-Validierung
```typescript
// Zod-Schema für Input-Validierung
import { z } from 'zod';

const userProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  city: z.string().min(2).max(100),
  plz: z.string().regex(/^\d{5}$/)
});

const validateUserProfile = (data: unknown) => {
  return userProfileSchema.parse(data);
};
```

#### XSS-Schutz
```typescript
// React's eingebaute XSS-Schutz + zusätzliche Sanitization
import DOMPurify from 'dompurify';

const safeHtml = (html: string) => {
  const sanitized = DOMPurify.sanitize(html);
  return { __html: sanitized };
};

// Verwendung
<div dangerouslySetInnerHTML={safeHtml(userContent)} />
```

## Testing Infrastructure

### Testing Tools

#### Unit Testing
```typescript
// Vitest für Unit-Tests
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchPage from './SearchPage';

describe('SearchPage', () => {
  it('should display search form', () => {
    render(<SearchPage />);
    expect(screen.getByPlaceholderText('Nach Betreuern suchen...')).toBeInTheDocument();
  });
});
```

#### Integration Testing
```typescript
// API-Integration-Tests
describe('Caretaker Search API', () => {
  it('should return filtered results', async () => {
    const response = await fetch('/api/caretakers/search?petType=Hund');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.caretakers).toHaveLength(3);
  });
});
```

### Mock-Services

#### Service-Mocking
```typescript
// Mock für Caretaker-Search-Service
vi.mock('../lib/services/caretaker-search', () => ({
  searchCaretakers: vi.fn().mockResolvedValue([
    { id: '1', name: 'Max Mustermann', rating: 4.5 }
  ])
}));
```

## Deployment & CI/CD

### Environment Configuration

#### Environment Variables
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_APP_ENV=development
```

#### Build-Konfiguration
```typescript
// Vite-Konfiguration für verschiedene Environments
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js'],
            stripe: ['@stripe/stripe-js']
          }
        }
      }
    }
  };
});
```

### CI/CD Pipeline

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Monitoring & Analytics

### Performance Monitoring

#### Web Vitals
```typescript
// Web Vitals Tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // Google Analytics
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id
  });
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

#### Error Tracking
```typescript
// Error Tracking mit Sentry
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

### User Analytics

#### Event Tracking
```typescript
// Benutzer-Event-Tracking
const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Google Analytics
  gtag('event', eventName, properties);
  
  // Supabase Analytics
  supabase.analytics.track(eventName, properties);
  
  // Custom Analytics
  analytics.track(eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
    userId: user?.id
  });
};
```

#### Feature-Usage-Tracking
```typescript
// Feature-Usage-Tracking
const trackFeatureUsage = (feature: string, action: string) => {
  trackEvent('feature_usage', {
    feature,
    action,
    subscription_type: subscription?.plan_type,
    user_type: user?.user_type
  });
};
```

---

**Letzte Aktualisierung**: 08.02.2025  
**Status**: Vollständige Tech-Context dokumentiert, einschließlich Supabase-Integration und Datenbank-Architektur  
**Nächste Überprüfung**: Nach Implementierung des Buchungssystems