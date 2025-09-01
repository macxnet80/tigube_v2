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

## Admin-Integration & Navigation

### Admin-System-Architektur

#### Admin-App-Isolation
```typescript
// Separate Admin-Anwendung (admin.tsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AdminApp from './AdminApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminApp />
    </BrowserRouter>
  </React.StrictMode>,
);
```

**Vorteile**:
- Vollständige Admin-App-Isolation
- Eigenes Auth-System für Admins
- Separate Admin-Routen und -Komponenten
- Unabhängige Admin-Entwicklung

#### Admin-Routing-Struktur
```typescript
// AdminApp.tsx - Admin-spezifisches Routing
function AdminApp() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
            <Route path="*" element={<AdminDashboardPage />} />
          </Routes>
        </Suspense>
      </NotificationProvider>
    </AuthProvider>
  );
}
```

**Routing-Features**:
- Alle Admin-Routen führen zum Admin-Dashboard
- Lazy Loading für Admin-Komponenten
- Separate Auth- und Notification-Provider

### Admin-Status-Erkennung

#### useAdmin Hook Implementation
```typescript
// src/lib/admin/useAdmin.ts
export const useAdmin = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const isAdminUser = await AdminService.checkAdminAccess();
      
      if (isAdminUser) {
        const currentAdmin = await AdminService.getCurrentAdmin();
        setAdminUser(currentAdmin);
        setIsAdmin(true);
      } else {
        setAdminUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAdminUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    adminUser,
    isAdmin,
    loading,
    hasPermission,
    logAction,
    refreshAdminStatus: checkAdminStatus
  };
};
```

**Hook-Features**:
- Automatische Admin-Status-Prüfung
- Admin-User-Details-Verwaltung
- Berechtigungsprüfung und Action-Logging
- Status-Refresh-Funktionalität

#### Admin-Berechtigungen-System
```typescript
// Granulare Admin-Berechtigungen
export const useAdminPermissions = () => {
  const { adminUser, hasPermission } = useAdmin();

  return {
    canViewUsers: hasPermission('users.read'),
    canEditUsers: hasPermission('users.write'),
    canDeleteUsers: hasPermission('users.delete'),
    canViewRevenue: hasPermission('revenue.read'),
    canViewAnalytics: hasPermission('analytics.read'),
    canManageAdvertising: hasPermission('advertising.write'),
    canModerateContent: hasPermission('content.moderate'),
    canViewAuditLogs: hasPermission('audit.read'),
    isSuperAdmin: adminUser?.admin_role === 'super_admin',
    isAdmin: adminUser?.admin_role === 'admin',
    isModerator: adminUser?.admin_role === 'moderator',
    isSupport: adminUser?.admin_role === 'support'
  };
};
```

**Berechtigungs-Features**:
- Rollen-basierte Zugriffskontrolle
- Granulare Berechtigungen für verschiedene Aktionen
- Admin-Rollen-Hierarchie (Super Admin → Admin → Moderator → Support)
- Flexible Berechtigungsverwaltung

### Admin-Navigation-Integration

#### Header-Integration Pattern
```typescript
// src/components/layout/Header.tsx
function Header() {
  const { isAdmin } = useAdmin();
  
  return (
    <nav className="hidden md:flex items-center space-x-8">
      {/* Bestehende Navigation */}
      {!isPremiumUser && (
        <NavLink to="/mitgliedschaften">
          Mitgliedschaften
        </NavLink>
      )}
      
      {/* Admin-Link zwischen bestehenden Links */}
      {isAdmin && (
        <a
          href="/admin.html"
          className={cn(
            'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200',
            'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
          )}
        >
          Admin
        </a>
      )}
      
      {/* Weitere Navigation */}
      <Link to="/nachrichten">
        Nachrichten
      </Link>
    </nav>
  );
}
```

**Integration-Features**:
- Nahtlose Integration in bestehende Navigation
- Bedingte Anzeige basierend auf Admin-Status
- Konsistente Styling mit bestehenden Nav-Links
- Responsive Design für alle Bildschirmgrößen

#### Mobile-Navigation-Integration
```typescript
// Mobile Admin-Navigation
{isMenuOpen && (
  <div className="md:hidden">
    <div className="pt-2 pb-4 space-y-1 animate-fade-in">
      {/* Bestehende Mobile-Links */}
      
      {/* Admin-Link für Mobile */}
      {isAdmin && (
        <a 
          href="/admin.html" 
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          Admin
        </a>
      )}
      
      {/* Weitere Mobile-Links */}
    </div>
  </div>
)}
```

**Mobile-Features**:
- Touch-optimierte Admin-Navigation
- Konsistente Mobile-Erfahrung
- Responsive Design für alle Bildschirmgrößen
- Einheitliche Styling-Patterns

### Admin-Service-Integration

#### AdminService Implementation
```typescript
// src/lib/admin/adminService.ts
export class AdminService {
  static async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data: profile } = await supabase
        .from('users')
        .select('is_admin, admin_role')
        .eq('id', user.id)
        .single();
      
      return profile?.is_admin === true;
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  }

  static async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .eq('is_admin', true)
        .single();
      
      return profile;
    } catch (error) {
      console.error('Error getting current admin:', error);
      return null;
    }
  }
}
```

**Service-Features**:
- Server-seitige Admin-Status-Validierung
- Sichere Admin-Erkennung über Datenbank
- Fehlerbehandlung für Admin-Operationen
- Admin-User-Details-Verwaltung

### Admin-Sicherheits-Implementierung

#### Frontend-Sicherheit
```typescript
// Keine Admin-Informationen im Frontend für Nicht-Admins
const Header = () => {
  const { isAdmin } = useAdmin();
  
  // Admin-Link nur bei Admin-Status anzeigen
  const adminNavigation = isAdmin ? (
    <a href="/admin.html">Admin</a>
  ) : null;
  
  return (
    <header>
      <nav>
        {/* Öffentliche Navigation */}
        {adminNavigation}
        {/* Weitere Navigation */}
      </nav>
    </header>
  );
};
```

**Sicherheitsaspekte**:
- Keine Admin-Informationen im DOM für Nicht-Admins
- Bedingte Rendering für Admin-Features
- Server-seitige Admin-Status-Validierung
- Vollständige Admin-App-Isolation

#### Admin-App-Sicherheit
```typescript
// Separate Admin-App mit eigenem Auth-System
// admin.tsx
function AdminApp() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
          </Routes>
        </Suspense>
      </NotificationProvider>
    </AuthProvider>
  );
}
```

**Sicherheits-Features**:
- Vollständige Admin-App-Isolation
- Eigenes Auth-System für Admins
- Separate Admin-Routen und -Komponenten
- Unabhängige Admin-Entwicklung

### Admin-Performance-Optimierung

#### Admin-Status-Caching
```typescript
// Admin-Status-Caching für bessere Performance
export const useAdmin = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Admin-Status nur einmal prüfen
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    // Nur prüfen wenn noch nicht geprüft
    if (adminUser !== null || isAdmin !== false) return;
    
    try {
      setLoading(true);
      const isAdminUser = await AdminService.checkAdminAccess();
      
      if (isAdminUser) {
        const currentAdmin = await AdminService.getCurrentAdmin();
        setAdminUser(currentAdmin);
        setIsAdmin(true);
      } else {
        setAdminUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAdminUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { adminUser, isAdmin, loading, refreshAdminStatus: checkAdminStatus };
};
```

**Performance-Features**:
- Admin-Status-Caching
- Vermeidung unnötiger API-Aufrufe
- Optimierte Admin-Status-Prüfung
- Effiziente Admin-Navigation

## Werbung-Integration & AdvertisementBanner

### AdvertisementBanner-Architektur

#### Komponenten-Struktur
```typescript
// AdvertisementBanner.tsx - Hauptkomponente für alle Werbeplätze
interface AdvertisementBannerProps {
  className?: string;
  targetingOptions?: TargetingOptions;
  placement?: Placement;
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  className = '',
  targetingOptions = {},
  placement = 'profile_sidebar'
}) => {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Lade Werbung basierend auf Platzierung und Targeting
  useEffect(() => {
    loadAdvertisement();
  }, [placement]);

  return (
    <div ref={bannerRef} className={`relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Werbung-Content mit platzierungs-spezifischem Layout */}
    </div>
  );
};
```

**Zweck**: Zentrale Komponente für alle Werbeplätze mit platzierungs-spezifischem Layout
**Vorteile**: Wiederverwendbare Komponente, konsistente Werbung-Darstellung

#### Platzierungs-spezifische Layouts
```typescript
// Bedingte Layouts basierend auf Platzierung
{placement === 'search_results' ? (
  // Search Card Layout - einheitliche Höhe mit Profil-Karten
  <div className="flex flex-col h-full">
    {/* Quadratisches Bild */}
    <div className="relative w-full aspect-square">
      <img className="w-full h-full object-contain object-center rounded-t-xl" />
    </div>
    
    {/* Content mit Flexbox-Layout */}
    <div className="p-5 flex flex-col flex-1">
      <h3 className="font-semibold text-gray-900 text-base mb-2">
        {advertisement.title}
      </h3>
      
      {advertisement.description && (
        <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed mb-4">
          {advertisement.description}
        </p>
      )}
      
      {/* Spacer für Button-Positionierung */}
      <div className="flex-1"></div>
      
      {/* Button und "Gesponsert" */}
      <div className="flex justify-between items-center">
        <span className="inline-flex items-center px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-md">
          {advertisement.cta_text || 'Mehr erfahren'}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          Gesponsert
        </span>
      </div>
    </div>
  </div>
) : (
  // Standard-Layout für andere Platzierungen
  <div className="flex items-start justify-between">
    {/* Standard-Content */}
  </div>
)}
```

**Zweck**: Verschiedene Layouts für verschiedene Werbeplätze
**Vorteile**: Optimierte Darstellung für jeden Kontext, einheitliche Höhe bei Search Cards

### Werbung-Service-Integration

#### AdvertisementService
```typescript
// src/lib/supabase/advertisementService.ts
export class AdvertisementService {
  static async getTargetedAdvertisements(
    adType: string,
    targetingOptions: TargetingOptions,
    limit: number = 1
  ): Promise<{ data: Advertisement[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select(`
          *,
          advertisement_formats (
            name,
            width,
            height,
            placement,
            function_description
          )
        `)
        .eq('ad_type', adType)
        .eq('is_active', true)
        .limit(limit);

      if (error) throw error;

      // Filtere nach Targeting-Optionen
      const filteredData = data?.filter(ad => 
        this.matchesTargeting(ad, targetingOptions)
      ) || [];

      return { data: filteredData, error: null };
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      return { data: null, error };
    }
  }

  private static matchesTargeting(ad: Advertisement, options: TargetingOptions): boolean {
    // Implementierung der Targeting-Logik
    if (options.petTypes && ad.target_pet_types) {
      return options.petTypes.some(petType => 
        ad.target_pet_types.includes(petType)
      );
    }
    return true;
  }
}
```

**Zweck**: Zentrale Verwaltung von Werbung-Daten und Targeting-Logik
**Vorteile**: Konsistente Werbung-Auswahl, kontextbezogene Targeting

#### Targeting-System
```typescript
// Targeting-Optionen für kontextbezogene Werbung
interface TargetingOptions {
  petTypes?: string[];           // Haustierarten aus Suchfiltern
  location?: string;             // Standort aus Suchfiltern
  subscriptionType?: 'free' | 'premium'; // Abo-Typ des Benutzers
}

// Targeting in SearchPage
const targetingOptions: TargetingOptions = {
  petTypes: selectedPetType ? [selectedPetType] : undefined,
  location: location || undefined,
  subscriptionType: subscription?.type === 'premium' ? 'premium' : 'free'
};
```

**Zweck**: Kontextbezogene Werbung basierend auf Benutzerverhalten
**Vorteile**: Höhere Relevanz, bessere Conversion-Raten

### Werbung-Performance-Optimierung

#### Lazy Loading & Caching
```typescript
// AdvertisementBanner mit optimierter Performance
const AdvertisementBanner = ({ placement, targetingOptions }) => {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize targeting options to prevent unnecessary re-renders
  const memoizedTargetingOptions = useMemo(() => {
    return {
      petTypes: targetingOptions.petTypes || [],
      location: targetingOptions.location || '',
      subscriptionType: targetingOptions.subscriptionType || 'free'
    };
  }, [targetingOptions.petTypes, targetingOptions.location, targetingOptions.subscriptionType]);

  // Lade Werbung nur bei Platzierungs-Änderung
  useEffect(() => {
    loadAdvertisement();
  }, [placement]);

  const loadAdvertisement = async () => {
    try {
      setIsLoading(true);
      
      // Bestimme ad_type basierend auf Platzierung
      const adType = getAdTypeFromPlacement(placement);
      
      const { data, error } = await AdvertisementService.getTargetedAdvertisements(
        adType,
        memoizedTargetingOptions,
        10
      );

      if (data && data.length > 0) {
        setAdvertisement(data[0]);
      } else {
        setAdvertisement(null);
      }
    } catch (error) {
      console.warn('Advertisement loading failed:', error);
      setAdvertisement(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Nicht rendern wenn Loading oder keine Werbung
  if (isLoading || !advertisement) {
    return null;
  }
};
```

**Zweck**: Optimierte Performance durch Lazy Loading und Memoization
**Vorteile**: Reduzierte Initial-Load-Zeit, bessere User Experience

#### Impression-Tracking
```typescript
// Intersection Observer für präzises Impression-Tracking
useEffect(() => {
  if (!advertisement || impressionTracked) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          trackImpression();
        }
      });
    },
    { threshold: 0.5, rootMargin: '0px' }
  );

  if (bannerRef.current) {
    observer.observe(bannerRef.current);
  }

  return () => {
    if (bannerRef.current) {
      observer.unobserve(bannerRef.current);
    }
  };
}, [advertisement, impressionTracked]);

const trackImpression = async () => {
  if (!advertisement || impressionTracked) return;

  try {
    const { data, error } = await AdvertisementService.trackImpression(
      advertisement.id,
      'search_results',
      {
        petTypes: memoizedTargetingOptions.petTypes,
        location: memoizedTargetingOptions.location,
        subscriptionType: memoizedTargetingOptions.subscriptionType
      }
    );

    if (!error && data) {
      setImpressionTracked(true);
    }
  } catch (error) {
    console.warn('Could not track banner impression:', error);
  }
};
```

**Zweck**: Präzises Tracking von Werbe-Impressionen
**Vorteile**: Genauere Analytics, bessere Werbe-Performance-Messung

### SearchPage-Integration

#### Werbung zwischen Suchergebnissen
```typescript
// SearchPage.tsx - Strategische Werbung-Platzierung
{!loading && !error && caretakers.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {(() => {
      const items = [];
      
      caretakers.forEach((caretaker, index) => {
        // Betreuer-Karte hinzufügen
        items.push(
          <CaretakerCard key={caretaker.id} caretaker={caretaker} />
        );
        
        // Werbung nach jeder 5. Betreuer-Karte
        if ((index + 1) % 5 === 0) {
          items.push(
            <AdvertisementBanner
              key={`ad-${index}`}
              placement="search_results"
              targetingOptions={{
                petTypes: selectedPetType ? [selectedPetType] : undefined,
                location: location || undefined,
                subscriptionType: subscription?.type === 'premium' ? 'premium' : 'free'
              }}
            />
          );
        }
      });
      
      // Werbung am Ende wenn weniger als 5 Betreuer
      if (caretakers.length < 5 || (caretakers.length % 5 !== 0)) {
        items.push(
          <AdvertisementBanner
            key="ad-end"
            placement="search_results"
            targetingOptions={{
              petTypes: selectedPetType ? [selectedPetType] : undefined,
              location: location || undefined,
              subscriptionType: subscription?.type === 'premium' ? 'premium' : 'free'
            }}
          />
        );
      }
      
      return items;
    })()}
  </div>
)}
```

**Zweck**: Natürliche Integration von Werbung zwischen Suchergebnissen
**Vorteile**: Nicht aufdringlich, kontextbezogen, strategische Platzierung

### Werbung-Datenbank-Integration

#### Advertisement-Tabellen
```sql
-- advertisements Tabelle
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  cta_text TEXT DEFAULT 'Mehr erfahren',
  ad_type TEXT NOT NULL, -- 'search_card', 'search_filter', 'profile_banner', etc.
  format_id UUID REFERENCES advertisement_formats(id),
  is_active BOOLEAN DEFAULT true,
  target_pet_types TEXT[],
  target_locations TEXT[],
  target_subscription_types TEXT[],
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- advertisement_formats Tabelle
CREATE TABLE advertisement_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'Search Card', 'Search Filter Banner', etc.
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  placement TEXT NOT NULL, -- 'search_results', 'search_filters', etc.
  function_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Zweck**: Strukturierte Verwaltung von Werbung-Daten und -Formaten
**Vorteile**: Flexible Werbung-Verwaltung, format-basierte Validierung

#### RLS-Policies für Werbung
```sql
-- RLS-Policy für öffentlichen Zugriff auf aktive Werbung
CREATE POLICY "Public can view active advertisements" 
  ON public.advertisements 
  FOR SELECT 
  USING (is_active = true);

-- RLS-Policy für Admin-Zugriff auf alle Werbung
CREATE POLICY "Admins can manage all advertisements" 
  ON public.advertisements 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );
```

**Zweck**: Sichere Verwaltung von Werbung-Daten
**Vorteile**: Öffentlicher Zugriff auf aktive Werbung, Admin-Kontrolle über alle Werbung

---

**Letzte Aktualisierung**: 08.02.2025  
**Status**: Werbung-Integration und AdvertisementBanner vollständig dokumentiert  
**Nächste Überprüfung**: Nach Implementierung des Buchungssystems

## Layout-Consistency-Implementierung

### Einheitliche Kartenhöhe mit Flexbox

#### Flexbox-Layout für Profilkarten
```typescript
// SearchPage.tsx - CaretakerCard mit einheitlicher Höhe
function CaretakerCard({ caretaker }: CaretakerCardProps) {
  return (
    <div className="card group hover:border-primary-200 transition-all duration-200 w-full max-w-sm h-full flex flex-col">
      <div className="relative flex flex-col h-full">
        {/* Quadratisches Bild */}
        <div className="relative w-full aspect-square">
          <img
            src={caretaker.avatar}
            alt={caretaker.name}
            className="w-full h-full object-cover object-center rounded-t-xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(caretaker.name)}&background=f3f4f6&color=374151&size=400`;
            }}
          />
          
          {/* Badges overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-center">
            {/* ... Badges ... */}
          </div>
        </div>

        {/* Info-Bereich - unter dem Bild */}
        <div className="p-5 bg-white rounded-b-xl flex flex-col flex-1">
          {/* Name und Bewertung */}
          <div className="flex justify-between items-start mb-3">
            {/* ... Name und Rating ... */}
          </div>

          {/* Bio - auf 3 Zeilen begrenzt, flexibel */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
            {caretaker.bio}
          </p>

          {/* Services */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* ... Services ... */}
          </div>

          {/* Preis und Button - immer am unteren Rand */}
          <div className="mt-auto space-y-3">
            <p className="font-semibold text-primary-600 text-sm text-center">
              {getDisplayPrice(caretaker)}
            </p>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => window.location.href = `/betreuer/${caretaker.id}`}
            >
              Profil ansehen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Zweck**: Einheitliche Höhe aller Profilkarten für konsistentes Layout
**Implementierung**: 
- `h-full flex flex-col` für Hauptcontainer
- `flex flex-col flex-1` für Info-Bereich
- `flex-1` für Bio-Text
- `mt-auto` für Button-Bereich

#### CSS-Klassen für Layout-Konsistenz
```css
/* Tailwind-Klassen für einheitliche Kartenhöhe */
.card {
  @apply h-full flex flex-col; /* Hauptcontainer: volle Höhe, vertikaler Flex */
}

.card-content {
  @apply flex flex-col flex-1; /* Info-Bereich: vertikaler Flex mit flex-1 */
}

.card-bio {
  @apply flex-1; /* Bio-Text: nutzt verfügbaren Platz */
}

.card-actions {
  @apply mt-auto; /* Button-Bereich: immer am unteren Rand */
}
```

**Zweck**: CSS-Klassen für konsistente Layout-Implementierung
**Vorteile**: Wiederverwendbare Klassen, einfache Wartung

### Button-Positionierung mit mt-auto

#### mt-auto Spacer für Button-Positionierung
```typescript
// Button-Bereich mit mt-auto für untere Positionierung
<div className="mt-auto space-y-3">
  <p className="font-semibold text-primary-600 text-sm text-center">
    {getDisplayPrice(caretaker)}
  </p>
  <Button variant="primary" size="sm" className="w-full">
    Profil ansehen
  </Button>
</div>
```

**Zweck**: Buttons immer am unteren Rand der Karte positionieren
**Implementierung**: `mt-auto` schiebt den Button-Bereich an den unteren Rand
**Vorteile**: 
- Konsistente Button-Position unabhängig von Content-Länge
- Bessere visuelle Hierarchie
- Einheitliches Layout auf allen Karten

## Neue Preisermittlung-Implementierung

### services_with_categories als primäre Datenquelle

#### Neue Preisermittlung aus JSONB-Struktur
```typescript
// SearchPage.tsx - Neue Preisermittlung
const getDisplayPrice = (caretaker: Caretaker) => {
  // 1. Neue Struktur: Preise aus services_with_categories
  if (caretaker.servicesWithCategories && Array.isArray(caretaker.servicesWithCategories)) {
    const validPrices = caretaker.servicesWithCategories
      .filter(service => 
        service.price && 
        service.price !== '' && 
        service.price !== null && 
        service.price !== undefined &&
        service.name !== 'Anfahrkosten' // Schließe Anfahrkosten aus
      )
      .map(service => {
        const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
        return isNaN(price) ? 0 : price;
      })
      .filter(price => price > 0);
    
    if (validPrices.length > 0) {
      const minPrice = Math.min(...validPrices);
      return `ab €${minPrice}/Std.`;
    }
  }
  
  // 2. Fallback: Alte prices-Struktur (für Kompatibilität)
  if (caretaker.prices && Object.keys(caretaker.prices).length > 0) {
    const pricesWithoutTravelCosts = Object.entries(caretaker.prices)
      .filter(([key, price]) => {
        if (key === 'Anfahrkosten') return false;
        return price !== '' && price !== null && price !== undefined;
      })
      .map(([key, price]) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(num) ? 0 : num;
      })
      .filter(price => price > 0);
    
    if (pricesWithoutTravelCosts.length > 0) {
      const minPrice = Math.min(...pricesWithoutTravelCosts);
      return `ab €${minPrice}/Std.`;
    }
  }
  
  // 3. Fallback zu hourlyRate
  if (caretaker.hourlyRate && caretaker.hourlyRate > 0) {
    return `ab €${caretaker.hourlyRate}/Std.`;
  }
  
  // 4. Standard-Text
  return 'Preis auf Anfrage';
};
```

**Zweck**: Robuste Preisermittlung mit Fallback-System
**Implementierung**: 
- Primäre Quelle: `services_with_categories` JSONB
- Fallback 1: Alte `prices` Struktur
- Fallback 2: `hourlyRate`
- Fallback 3: Standard-Text

#### Preis-Filter mit neuer Preisermittlung
```typescript
// SearchPage.tsx - Max-Preis-Filter mit neuer Preisermittlung
if (maxPrice < 100 && data && data.length > 0) {
  data = data.filter(caretaker => {
    // Preis-Ermittlung aus der neuen services_with_categories Struktur
    let lowestPrice = 0;
    
    // 1. Neue Struktur: Preise aus services_with_categories
    if (caretaker.servicesWithCategories && Array.isArray(caretaker.servicesWithCategories)) {
      const validPrices = caretaker.servicesWithCategories
        .filter(service => 
          service.price && 
          service.price !== '' && 
          service.price !== null && 
          service.price !== undefined &&
          service.name !== 'Anfahrkosten'
        )
        .map(service => {
          const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
          return isNaN(price) ? 0 : price;
        })
        .filter(price => price > 0);
      
      if (validPrices.length > 0) {
        lowestPrice = Math.min(...validPrices);
      }
    }
    
    // 2. Fallback: Alte prices-Struktur (für Kompatibilität)
    if (lowestPrice === 0 && caretaker.prices && Object.keys(caretaker.prices).length > 0) {
      // ... Fallback-Logik ...
    }
    
    // 3. Fallback zu hourlyRate
    if (lowestPrice === 0 && caretaker.hourlyRate) {
      lowestPrice = caretaker.hourlyRate;
    }
    
    // Prüfe ob Preis unter dem Max-Preis liegt
    return lowestPrice <= maxPrice;
  });
}
```

**Zweck**: Max-Preis-Filter nutzt neue Preisermittlung
**Implementierung**: Gleiche Preisermittlungs-Logik wie bei der Anzeige
**Vorteile**: 
- Konsistente Preisermittlung zwischen Anzeige und Filterung
- Robuste Filterung mit Fallback-System
- Bessere Benutzererfahrung durch genaue Preisinformationen

### Anfahrkosten-Filter-Implementierung

#### Ausschluss von Anfahrkosten aus Preisberechnung
```typescript
// Filter für gültige Preise ohne Anfahrkosten
const validPrices = caretaker.servicesWithCategories
  .filter(service => 
    service.price && 
    service.price !== '' && 
    service.price !== null && 
    service.price !== undefined &&
    service.name !== 'Anfahrkosten' // Schließe Anfahrkosten aus
  )
  .map(service => {
    const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
    return isNaN(price) ? 0 : price;
  })
  .filter(price => price > 0);
```

**Zweck**: Anfahrkosten aus Preisberechnung ausschließen
**Implementierung**: Expliziter Filter für `service.name !== 'Anfahrkosten'`
**Vorteile**: 
- Realistische Preisvergleiche
- Bessere Benutzererfahrung
- Klare Preisstruktur

### Fallback-System-Implementierung

#### Robuste Fallback-Kette für Preisermittlung
```typescript
// Fallback-System für verschiedene Preisdatenquellen
let lowestPrice = 0;

// 1. Neue Struktur: services_with_categories
if (caretaker.servicesWithCategories && Array.isArray(caretaker.servicesWithCategories)) {
  // ... Preisermittlung aus services_with_categories ...
}

// 2. Fallback: Alte prices-Struktur (für Kompatibilität)
if (lowestPrice === 0 && caretaker.prices && Object.keys(caretaker.prices).length > 0) {
  // ... Fallback-Logik ...
}

// 3. Fallback zu hourlyRate
if (lowestPrice === 0 && caretaker.hourlyRate) {
  lowestPrice = caretaker.hourlyRate;
}

// 4. Standard-Text wenn keine Preise verfügbar
if (lowestPrice === 0) {
  return 'Preis auf Anfrage';
}
```

**Zweck**: Robuste Preisermittlung mit mehreren Fallback-Ebenen
**Implementierung**: Hierarchische Fallback-Kette
**Vorteile**: 
- Hohe Verfügbarkeit von Preisinformationen
- Abwärtskompatibilität mit alten Datenstrukturen
- Konsistente Benutzererfahrung

## Datenbank-Integration

### services_with_categories JSONB-Struktur

#### Neue Datenstruktur für Services und Preise
```sql
-- services_with_categories JSONB-Struktur
[
  {
    "name": "Gassi-Service",
    "category_id": 1,
    "category_name": "Hundebetreuung",
    "price": 15,
    "price_type": "per_hour"
  },
  {
    "name": "Haustierbetreuung",
    "category_id": 2,
    "category_name": "Allgemein",
    "price": 20,
    "price_type": "per_hour"
  },
  {
    "name": "Anfahrkosten",
    "category_id": 3,
    "category_name": "Zusatzkosten",
    "price": 5,
    "price_type": "per_visit"
  }
]
```

**Zweck**: Einheitliche Struktur für Services mit Kategorien und Preisen
**Vorteile**: 
- Strukturierte Datenhaltung
- Einfache Kategorisierung
- Flexible Preisgestaltung
- Ausschluss von Anfahrkosten möglich

#### Migration von alter zu neuer Struktur
```sql
-- Migration von services und prices zu services_with_categories
-- Diese Migration wurde bereits durchgeführt und ist in der aktuellen Datenbank aktiv
```

**Zweck**: Abwärtskompatibilität während der Umstellung
**Status**: ✅ Abgeschlossen, neue Struktur ist aktiv

---

**Letzte Aktualisierung**: 08.02.2025  
**Status**: Layout-Consistency und neue Preisermittlung vollständig dokumentiert  
**Nächste Überprüfung**: Nach Implementierung des Buchungssystems