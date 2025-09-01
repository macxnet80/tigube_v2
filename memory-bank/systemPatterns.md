# System Patterns: Tigube v2

## Systemarchitektur

### Frontend-Architektur

#### React SPA (Single Page Application)
- **Framework**: React 18 mit TypeScript
- **Build-Tool**: Vite für schnelle Entwicklung und Builds
- **Routing**: React Router DOM für clientseitiges Routing
- **State Management**: Zustand für globalen State + AuthContext für User-Session

#### Komponentenarchitektur
```
src/
├── components/
│   ├── auth/             # Authentication Components (ProtectedRoute)
│   ├── chat/             # Chat-System (ChatWindow, MessageBubble, etc.)
│   ├── layout/           # Layout-Komponenten (Header, Footer, Navigation)
│   └── ui/               # UI-Komponenten (Subscription, Feature Gates, etc.)
├── pages/                # Seiten-Komponenten (Route-Handler)
├── hooks/                # Custom Hooks (useSubscription, useFeatureAccess)
├── contexts/             # React Context (AuthContext, SubscriptionContext)
├── lib/                  # Utilities und Services
└── types/                # TypeScript-Typdefinitionen
```

### Backend-Architektur

#### Supabase als Backend-as-a-Service
- **Database**: PostgreSQL 15.8.1 mit Row Level Security (RLS)
- **Authentication**: Supabase Auth mit JWT-Tokens
- **Real-time**: WebSocket-Integration für Chat-System
- **Storage**: Datei-Upload für Profile-Bilder und Dokumente
- **Edge Functions**: Serverless-Funktionen für komplexe Logik

#### Datenbank-Architektur
```
Datenbank-Schema:
├── Core User Management
│   ├── users (Zentrale Benutzerverwaltung)
│   ├── caretaker_profiles (Betreuer-Profile)
│   └── user_notes (Admin-Notizen)
├── Pet & Care Management
│   ├── pets (Haustier-Profile)
│   ├── care_requests (Betreuungsanfragen)
│   └── bookings (Buchungen)
├── Communication
│   ├── conversations (Chat-Konversationen)
│   ├── messages (Einzelne Nachrichten)
│   └── owner_caretaker_connections (Benutzer-Verbindungen)
├── Reviews & Analytics
│   ├── reviews (Bewertungen)
│   ├── usage_tracking (Nutzungsverfolgung)
│   └── user_analytics (Benutzer-Metriken)
└── Admin & Support
    ├── admin_audit_logs (Admin-Audit-Logs)
    ├── support_tickets (Support-System)
    └── advertisements (Werbeanzeigen)
```

## Datenbank-Patterns

### Row Level Security (RLS) Pattern

#### Grundprinzip
Alle Tabellen haben RLS aktiviert, um Datenzugriff auf Datenbank-Ebene zu kontrollieren.

#### RLS-Policy-Patterns

##### 1. Öffentliche Betreuer-Suche
```sql
-- Policy für öffentlichen Zugriff auf Betreuer-Profile
CREATE POLICY "Public can view caretaker profile info" 
  ON public.users 
  FOR SELECT 
  USING (
    user_type = 'caretaker' OR auth.uid() = id
  );
```

**Zweck**: Erlaubt anonymen Benutzern Zugriff auf Betreuer-Profile für die Suche
**Sicherheit**: Nur öffentliche Daten sind sichtbar, private Daten bleiben geschützt

##### 2. Benutzer-spezifische Daten
```sql
-- Policy für private Benutzerdaten
CREATE POLICY "Users can view own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);
```

**Zweck**: Benutzer können nur ihre eigenen Daten sehen
**Sicherheit**: Vollständige Isolation zwischen Benutzern

##### 3. Verbindungs-basierte Berechtigungen
```sql
-- Policy für Owner-Profile basierend auf Verbindungen
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

**Zweck**: Caretaker können nur Profile von verbundenen Owner sehen
**Sicherheit**: Granulare Berechtigungen basierend auf Benutzer-Beziehungen

### View-Patterns

#### 1. Optimierte Such-Views
```sql
-- caretaker_search_view für optimierte Betreuer-Suche
CREATE VIEW caretaker_search_view AS
SELECT 
  u.id, u.first_name, u.last_name, u.city, u.plz,
  cp.hourly_rate, cp.rating, cp.services_with_categories,
  cp.availability, cp.short_term_available
FROM caretaker_profiles cp
LEFT JOIN users u ON cp.id = u.id
WHERE u.user_type = 'caretaker';
```

**Vorteile**:
- Optimierte Abfragen für häufige Suchoperationen
- Reduzierte JOIN-Komplexität
- Bessere Performance durch vorberechnete Felder

#### 2. Aggregierte Daten-Views
```sql
-- View für aggregierte Benutzer-Metriken
CREATE VIEW user_analytics_summary AS
SELECT 
  user_id,
  COUNT(*) as total_actions,
  MAX(created_at) as last_action
FROM usage_tracking
GROUP BY user_id;
```

**Vorteile**:
- Vorberechnete Aggregationen
- Reduzierte Datenbank-Last
- Konsistente Metriken

### JSONB-Patterns

#### 1. Flexible Service-Struktur
```sql
-- services_with_categories als JSONB
{
  "name": "Hundespaziergang",
  "category_id": 1,
  "category_name": "Spaziergänge",
  "price": 15,
  "price_type": "per_hour"
}
```

**Vorteile**:
- Flexible Service-Definitionen
- Einfache Erweiterbarkeit
- JSON-Query-Funktionalität

#### 2. Verfügbarkeits-Management
```sql
-- availability als JSONB mit Wochentagen
{
  "Mo": [{"start": "09:00", "end": "17:00"}],
  "Di": [{"start": "09:00", "end": "17:00"}],
  "Mi": [{"start": "09:00", "end": "17:00"}]
}
```

**Vorteile**:
- Strukturierte Zeitplan-Verwaltung
- Einfache Abfragen nach Verfügbarkeit
- Flexible Terminplanung

## API-Patterns

### RESTful API-Design

#### Endpoint-Struktur
```
/api/v1/
├── auth/                 # Authentifizierung
│   ├── login
│   ├── register
│   └── logout
├── users/                # Benutzer-Management
│   ├── /profile
│   ├── /settings
│   └── /:id
├── caretakers/           # Betreuer-Management
│   ├── /search
│   ├── /:id
│   └── /:id/reviews
├── pets/                 # Haustier-Management
│   ├── /:id
│   └── /:id/health
└── bookings/             # Buchungs-Management
    ├── /requests
    ├── /:id
    └── /:id/status
```

#### Response-Patterns

##### 1. Standardisierte Responses
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}
```

##### 2. Paginierte Listen
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

##### 3. Error-Handling
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
```

### Real-time Patterns

#### WebSocket-Integration
```typescript
// Real-time Chat-Integration
const channel = supabase
  .channel('chat')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      // Neue Nachricht empfangen
      handleNewMessage(payload.new);
    }
  )
  .subscribe();
```

**Vorteile**:
- Echtzeit-Updates ohne Polling
- Reduzierte Server-Last
- Bessere Benutzer-Erfahrung

## State Management Patterns

### Zustand für globalen State

#### Store-Struktur
```typescript
interface AppStore {
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // Subscription State
  subscription: Subscription | null;
  featureAccess: FeatureAccess;
  
  // UI State
  isLoading: boolean;
  notifications: Notification[];
  
  // Actions
  setUser: (user: User | null) => void;
  updateSubscription: (subscription: Subscription) => void;
  addNotification: (notification: Notification) => void;
}
```

#### Persistierung
```typescript
// Zustand mit Persistierung
const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Store-Implementation
    }),
    {
      name: 'tigube-store',
      partialize: (state) => ({
        user: state.user,
        subscription: state.subscription
      })
    }
  )
);
```

### React Context für Auth

#### AuthContext-Pattern
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

## Security Patterns

### Authentication & Authorization

#### JWT-Token-Management
```typescript
// Token-Validierung und -Erneuerung
const validateToken = async (token: string) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    // Token ungültig, zur Anmeldung weiterleiten
    redirectToLogin();
  }
};
```

#### Role-based Access Control (RBAC)
```typescript
// Rollen-basierte Berechtigungen
const hasPermission = (user: User, permission: Permission) => {
  const userRole = user.admin_role || 'user';
  const rolePermissions = PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
};
```

### Data Protection

#### Input-Validierung
```typescript
// Server-seitige Validierung
const validateUserInput = (input: any) => {
  const schema = z.object({
    email: z.string().email(),
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50)
  });
  
  return schema.parse(input);
};
```

#### XSS-Schutz
```typescript
// React's eingebaute XSS-Schutz
const safeHtml = (html: string) => {
  return { __html: DOMPurify.sanitize(html) };
};
```

## Performance Patterns

### Lazy Loading

#### Route-basiertes Lazy Loading
```typescript
// Lazy Loading für alle Routen
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
```

#### Komponenten-basiertes Lazy Loading
```typescript
// Lazy Loading für schwere Komponenten
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));

// Mit Suspense
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### Caching-Strategien

#### React Query für Server-State
```typescript
// Caching für API-Aufrufe
const { data: caretakers, isLoading } = useQuery({
  queryKey: ['caretakers', searchParams],
  queryFn: () => fetchCaretakers(searchParams),
  staleTime: 5 * 60 * 1000, // 5 Minuten
  cacheTime: 10 * 60 * 1000  // 10 Minuten
});
```

#### Local Storage für Client-State
```typescript
// Persistierung wichtiger Client-Daten
const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };
  
  return [storedValue, setValue] as const;
};
```

## Error Handling Patterns

### Global Error Boundary

#### Error Boundary-Implementierung
```typescript
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Error an Error-Tracking-Service senden
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### API Error Handling

#### Standardisiertes Error Handling
```typescript
// API Error Handler
const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Nicht authentifiziert
    redirectToLogin();
  } else if (error.status === 403) {
    // Keine Berechtigung
    showForbiddenMessage();
  } else if (error.status === 500) {
    // Server-Fehler
    showServerError();
  } else {
    // Allgemeiner Fehler
    showGenericError(error.message);
  }
};
```

## Testing Patterns

### Component Testing

#### React Testing Library
```typescript
// Komponenten-Test
describe('SearchPage', () => {
  it('should display search results', async () => {
    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Nach Betreuern suchen...');
    fireEvent.change(searchInput, { target: { value: 'Hund' } });
    
    await waitFor(() => {
      expect(screen.getByText('Suchergebnisse')).toBeInTheDocument();
    });
  });
});
```

#### Mock-Services
```typescript
// Service-Mocking
jest.mock('../lib/services/caretaker-search', () => ({
  searchCaretakers: jest.fn().mockResolvedValue([
    { id: '1', name: 'Max Mustermann', rating: 4.5 }
  ])
}));
```

### Integration Testing

#### API-Integration Tests
```typescript
// API-Integration-Test
describe('Caretaker Search API', () => {
  it('should return filtered results', async () => {
    const response = await fetch('/api/caretakers/search?petType=Hund');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.caretakers).toHaveLength(3);
    expect(data.caretakers[0].petTypes).toContain('Hund');
  });
});
```

## Deployment Patterns

### Environment Configuration

#### Environment Variables
```typescript
// Environment-Konfiguration
const config = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL!,
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY!,
  stripePublishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!,
  environment: process.env.NODE_ENV || 'development'
};
```

#### Build-Optimierung
```typescript
// Vite-Konfiguration für Production
export default defineConfig({
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
  }
});
```

### CI/CD Pipeline

#### GitHub Actions
```yaml
# GitHub Actions Workflow
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        run: npx vercel --prod
```

## Monitoring & Analytics Patterns

### Performance Monitoring

#### Web Vitals
```typescript
// Web Vitals Tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

#### Error Tracking
```typescript
// Error Tracking mit Sentry
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Error Boundary mit Sentry
const ErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: <ErrorFallback />
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
};
```

#### Usage Analytics
```typescript
// Feature-Usage-Tracking
const trackFeatureUsage = (feature: string, action: string) => {
  trackEvent('feature_usage', {
    feature,
    action,
    timestamp: new Date().toISOString(),
    userId: user?.id
  });
};
```

---

**Letzte Aktualisierung**: 08.02.2025  
**Status**: Vollständige System-Patterns dokumentiert, einschließlich Datenbank-Architektur  
**Nächste Überprüfung**: Nach Implementierung des Buchungssystems