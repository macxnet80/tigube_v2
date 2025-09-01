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

## Admin-Navigation Patterns

### Admin-Link-Integration

#### Bedingte Navigation
```typescript
// Admin-Link nur für Admins anzeigen
const { isAdmin } = useAdmin();

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
```

**Zweck**: Admin-Link nur für berechtigte Benutzer sichtbar machen
**Sicherheit**: Keine Admin-Informationen im Frontend für Nicht-Admins
**UX**: Konsistente Navigation für alle Benutzerrollen

#### Responsive Admin-Navigation
```typescript
// Desktop-Navigation
{isAdmin && (
  <a href="/admin.html" className="admin-link-desktop">
    Admin
  </a>
)}

// Mobile-Navigation
{isAdmin && (
  <a href="/admin.html" className="admin-link-mobile">
    Admin
  </a>
)}
```

**Vorteile**:
- Konsistente Admin-Navigation auf allen Geräten
- Mobile-optimierte Touch-Interaktionen
- Responsive Design für alle Bildschirmgrößen

### Admin-Status-Erkennung

#### useAdmin Hook Pattern
```typescript
// Admin-Status-Prüfung via Hook
export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const isAdminUser = await AdminService.checkAdminAccess();
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading, refreshAdminStatus: checkAdminStatus };
};
```

**Vorteile**:
- Zentrale Admin-Status-Verwaltung
- Automatische Status-Aktualisierung
- Fehlerbehandlung für Admin-Status-Prüfung

#### Admin-Berechtigungen Pattern
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
    isSuperAdmin: adminUser?.admin_role === 'super_admin',
    isAdmin: adminUser?.admin_role === 'admin',
    isModerator: adminUser?.admin_role === 'moderator'
  };
};
```

**Vorteile**:
- Granulare Berechtigungsprüfung
- Rollen-basierte Admin-Funktionen
- Flexible Admin-Hierarchie

### Admin-Navigation-Architektur

#### Header-Integration Pattern
```typescript
// Admin-Link in bestehende Navigation integrieren
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
        <a href="/admin.html" className="admin-link">
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

**Vorteile**:
- Nahtlose Integration in bestehende Navigation
- Konsistente Benutzerführung
- Einfache Wartung und Erweiterung

#### Mobile-Navigation Pattern
```typescript
// Admin-Link im Mobile-Menü
{isMenuOpen && (
  <div className="md:hidden">
    <div className="pt-2 pb-4 space-y-1">
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

**Vorteile**:
- Mobile-optimierte Admin-Navigation
- Touch-freundliche Interaktionen
- Konsistente Mobile-Erfahrung

### Admin-Sicherheits-Patterns

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

#### Admin-App-Isolation
```typescript
// Separate Admin-App mit eigenem Auth-System
// admin.tsx
function AdminApp() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}
```

**Vorteile**:
- Vollständige Admin-App-Isolation
- Eigenes Auth-System für Admins
- Separate Admin-Routen und -Komponenten

## AdvertisementBanner Patterns

### Werbung-Platzierung-System

#### Platzierungs-Typen
```typescript
// AdvertisementBanner Platzierungs-Typen
type Placement = 
  | 'profile_sidebar'    // 300x600px - Profile Sidebar
  | 'profile_top'        // 728x90px - Profile Top Banner
  | 'search_results'     // 384x480px - Search Card zwischen Suchergebnissen
  | 'search_filters'     // 970x90px - Search Filter Banner
  | 'search_filter_box'  // 384x480px - Search Card Filter Box
  | 'owner_dashboard'    // 970x90px - Owner Dashboard Banner
  | 'caretaker_dashboard' // 970x90px - Caretaker Dashboard Banner;
```

**Zweck**: Verschiedene Werbeplätze mit spezifischen Formaten und Funktionen
**Vorteile**: Granulare Kontrolle über Werbeplatzierung und -format

#### Platzierungs-Filterung
```typescript
// Platzierungs-spezifische Filterung
const placementSpecificAd = data.find(ad => {
  if (placement === 'search_results' && ad.display_width === 384 && ad.display_height === 480) {
    return true; // Search Card Results Format
  }
  if (placement === 'search_filter_box' && ad.display_width === 384 && ad.display_height === 480) {
    return true; // Search Card Filter Box Format
  }
  if (placement === 'search_filters' && ad.display_width === 970 && ad.display_height === 90) {
    return true; // Search Filter Banner Format
  }
  // ... weitere Platzierungen
  return false;
});
```

**Zweck**: Sicherstellen, dass nur passende Werbungen für spezifische Platzierungen angezeigt werden
**Sicherheit**: Format-basierte Validierung verhindert falsche Platzierungen

### Search Card Layout-Patterns

#### Einheitliche Höhe mit Profil-Karten
```typescript
// Flexbox-Layout für einheitliche Höhe
<div className={`${placement === 'search_results' ? 'flex flex-col' : ''}`}>
  <div className={`${placement === 'search_results' ? 'flex flex-col flex-1' : ''}`}>
    {/* Bild */}
    <div className={`${placement === 'search_results' ? 'aspect-square' : 'h-56'}`}>
      <img className={`${placement === 'search_results' ? 'rounded-t-xl' : ''}`} />
    </div>
    
    {/* Content */}
    <div className={`${placement === 'search_results' ? 'p-5 flex flex-col flex-1' : 'p-4'}`}>
      {placement === 'search_results' ? (
        <>
          {/* Titel */}
          <h3 className="font-semibold text-gray-900 text-base mb-2">
            {advertisement.title}
          </h3>
          
          {/* Beschreibung */}
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
        </>
      ) : (
        // Standard-Layout für andere Platzierungen
        <div className="flex items-start justify-between">
          {/* Standard-Content */}
        </div>
      )}
    </div>
  </div>
</div>
```

**Zweck**: Einheitliche Höhe mit Profil-Karten durch Flexbox-Layout
**Vorteile**: Konsistentes Grid-Design, Button immer unten positioniert

#### Button-Positionierung-Pattern
```typescript
// Button immer unten durch Spacer-Mechanismus
<div className="flex flex-col h-full">
  {/* Content-Bereich */}
  <div className="space-y-4">
    <h3>{advertisement.title}</h3>
    {advertisement.description && <p>{advertisement.description}</p>}
  </div>
  
  {/* Spacer drückt Button nach unten */}
  <div className="flex-1"></div>
  
  {/* Button-Bereich immer unten */}
  <div className="flex justify-between items-center">
    <button>{advertisement.cta_text}</button>
    <span>Gesponsert</span>
  </div>
</div>
```

**Zweck**: Button immer am unteren Rand der Karte positionieren
**Vorteile**: Konsistente Button-Positionierung unabhängig von Content-Länge

### Werbung-Integration-Patterns

#### SearchPage-Integration
```typescript
// SearchPage.tsx - Werbung zwischen Suchergebnissen
{caretakers.forEach((caretaker, index) => {
  // Betreuer-Karte hinzufügen
  items.push(<CaretakerCard key={caretaker.id} caretaker={caretaker} />);
  
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
      targetingOptions={{...}}
    />
  );
}
```

**Zweck**: Werbung strategisch zwischen Suchergebnissen platzieren
**Vorteile**: Natürliche Integration, nicht aufdringlich, kontextbezogen

#### Targeting-Options-Pattern
```typescript
// Kontextbezogene Werbung-Targeting
interface TargetingOptions {
  petTypes?: string[];           // Haustierarten aus Suchfiltern
  location?: string;             // Standort aus Suchfiltern
  subscriptionType?: 'free' | 'premium'; // Abo-Typ des Benutzers
}

// Targeting in SearchPage
<AdvertisementBanner
  placement="search_results"
  targetingOptions={{
    petTypes: selectedPetType ? [selectedPetType] : undefined,
    location: location || undefined,
    subscriptionType: subscription?.type === 'premium' ? 'premium' : 'free'
  }}
/>
```

**Zweck**: Kontextbezogene Werbung basierend auf Benutzerverhalten
**Vorteile**: Höhere Relevanz, bessere Conversion-Raten

### Werbung-Performance-Patterns

#### Lazy Loading für Werbung
```typescript
// AdvertisementBanner mit Lazy Loading
const AdvertisementBanner = ({ placement, targetingOptions }) => {
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdvertisement();
  }, [placement]); // Nur bei Platzierungs-Änderung neu laden

  const loadAdvertisement = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await advertisementService.getTargetedAdvertisements(
        getAdTypeFromPlacement(placement),
        targetingOptions,
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

**Zweck**: Optimierte Performance durch Lazy Loading
**Vorteile**: Reduzierte Initial-Load-Zeit, bessere User Experience

#### Impression-Tracking-Pattern
```typescript
// Intersection Observer für Impression-Tracking
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
```

**Zweck**: Präzises Tracking von Werbe-Impressionen
**Vorteile**: Genauere Analytics, bessere Werbe-Performance-Messung

---

**Letzte Aktualisierung**: 08.02.2025  
**Status**: AdvertisementBanner-Patterns dokumentiert, einschließlich Search Card Layout und Werbung-Integration  
**Nächste Überprüfung**: Nach Implementierung des Buchungssystems

## Layout-Consistency-Patterns

### Einheitliche Kartenhöhe mit Flexbox

#### Flexbox-Layout für Profilkarten
```typescript
// CaretakerCard mit einheitlicher Höhe
function CaretakerCard({ caretaker }: CaretakerCardProps) {
  return (
    <div className="card group hover:border-primary-200 transition-all duration-200 w-full max-w-sm h-full flex flex-col">
      <div className="relative flex flex-col h-full">
        {/* Quadratisches Bild */}
        <div className="relative w-full aspect-square">
          <img src={caretaker.avatar} alt={caretaker.name} />
          {/* Badges overlay */}
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
            <Button variant="primary" size="sm" className="w-full">
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
**Vorteile**: 
- Buttons stehen immer auf einer Linie
- Konsistentes visuelles Erscheinungsbild
- Bessere Benutzererfahrung
- Responsive Design auf allen Bildschirmgrößen

#### Flexbox-Properties für Layout-Konsistenz
```css
/* CSS-Klassen für einheitliche Kartenhöhe */
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

### Button-Positionierung-Pattern

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
**Vorteile**: 
- Konsistente Button-Position unabhängig von Content-Länge
- Bessere visuelle Hierarchie
- Einheitliches Layout auf allen Karten

## Preisermittlungs-Patterns

### Neue Preisermittlung mit services_with_categories

#### Primäre Preisermittlung aus JSONB-Struktur
```typescript
// Funktion zum Ermitteln des besten Preises für die Anzeige
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
    // ... Fallback-Logik ...
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
**Vorteile**: 
- Aktuelle Preise aus neuer Datenstruktur
- Anfahrkosten werden aus Preisberechnung ausgeschlossen
- Robuste Fallback-Kette für verschiedene Datenquellen
- Konsistente Preis-Anzeige

#### Preis-Filter mit neuer Preisermittlung
```typescript
// Client-seitige Preis-Filterung mit neuer Preisermittlung
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
**Vorteile**: 
- Konsistente Preisermittlung zwischen Anzeige und Filterung
- Robuste Filterung mit Fallback-System
- Bessere Benutzererfahrung durch genaue Preisinformationen

### Anfahrkosten-Filter-Pattern

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
**Vorteile**: 
- Realistische Preisvergleiche
- Bessere Benutzererfahrung
- Klare Preisstruktur

### Fallback-System-Pattern

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
**Vorteile**: 
- Hohe Verfügbarkeit von Preisinformationen
- Abwärtskompatibilität mit alten Datenstrukturen
- Konsistente Benutzererfahrung

---

**Letzte Aktualisierung**: 08.02.2025  
**Status**: Layout-Consistency- und Preisermittlungs-Patterns dokumentiert  
**Nächste Überprüfung**: Nach Implementierung des Buchungssystems