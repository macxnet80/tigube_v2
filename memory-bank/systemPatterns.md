# System Patterns: Tigube v2

## Systemarchitektur

### Owner Dashboard Bug-Fix-Patterns

#### Datenbank-Abfrage-Optimierung-Pattern
```typescript
// Problematische JOIN-Query (Vorher)
const { data: caretakers, error: careteakersError } = await supabase
  .from('caretaker_profiles')
  .select(`
    id,
    services_with_categories,
    hourly_rate,
    rating,
    review_count,
    is_verified,
    short_about_me,
    is_commercial,
    users!inner(
      id,
      first_name,
      last_name,
      city,
      plz,
      profile_photo_url,
      user_type
    )
  `)
  .in('id', caretakerIds)
  .eq('approval_status', 'approved');

// Optimierte separate Abfragen (Nachher)
const { data: caretakerProfiles, error: profilesError } = await supabase
  .from('caretaker_profiles')
  .select('*')
  .in('id', caretakerIds)
  .eq('approval_status', 'approved');

if (profilesError) throw profilesError;

const { data: userData, error: usersError } = await supabase
  .from('users')
  .select('id, first_name, last_name, city, plz, profile_photo_url, user_type')
  .in('id', caretakerProfiles.map(p => p.id));

if (usersError) throw usersError;

// JavaScript-basierte Datenkombination
const caretakers = caretakerProfiles.map(profile => {
  const user = userData?.find(u => u.id === profile.id);
  return { ...profile, users: user };
});
```

**Zweck**: Bessere RLS-Kompatibilität durch separate Abfragen
**Vorteile**: 
- Umgeht komplexe JOIN-Query-Probleme mit RLS-Policies
- Bessere Performance und Debugging-Möglichkeiten
- Explizite Kontrolle über Datenabfragen

#### Authentication-Session-Management-Pattern
```typescript
// Explizite Session-Validierung für RLS-Kontext
const { data: { session } } = await supabase.auth.getSession();
if (!session?.user?.id) {
  return { data: [], error: 'Not authenticated' };
}
const authenticatedUserId = session.user.id;

// Verwendung der authentifizierten User-ID
const { data: connections, error: connectionsError } = await supabase
  .from('owner_caretaker_connections')
  .select('caretaker_id, created_at')
  .eq('owner_id', authenticatedUserId) // Explizite User-ID statt auth.uid()
  .eq('connection_type', 'favorite')
  .order('created_at', { ascending: false });
```

**Zweck**: Sicherstellung dass auth.uid() korrekt gesetzt ist für RLS-Policies
**Vorteile**: 
- Explizite Session-Validierung
- Bessere Fehlerbehandlung bei Authentication-Problemen
- Konsistente RLS-Policy-Anwendung

#### Debug-Cleanup-Pattern
```typescript
// Debug-Logs entfernen (Vorher)
console.log('🔍 Loading connections for owner:', ownerId);
console.log('📊 Found connections:', connections);
console.log('🎯 Caretaker IDs to load:', caretakerIds);
console.log('👥 Loaded caretaker profiles:', caretakers);
console.warn('⚠️ No caretakers found for connections');

// Sauberer Production-Code (Nachher)
// Alle Debug-Logs entfernt für sauberen Code
```

**Zweck**: Sauberer Production-Code ohne Debug-Logs
**Vorteile**: 
- Bessere Performance
- Saubere Console-Ausgabe
- Professioneller Code

### Terminologie-Konsistenz-Patterns

#### Einheitliche Terminologie-Verwaltung
```typescript
// Konsistente Terminologie im gesamten Projekt
interface UserTerminology {
  owner: 'Tierhalter';           // Statt "Tierbesitzer"
  caretaker: 'Betreuer';         // Unverändert
  platform: 'tigube';           // Unverändert
  service: 'Tierbetreuung';     // Unverändert
}

// Verwendung in Komponenten
const getUserTypeLabel = (userType: 'owner' | 'caretaker') => {
  switch (userType) {
    case 'owner':
      return 'Tierhalter';
    case 'caretaker':
      return 'Betreuer';
    default:
      return 'Benutzer';
  }
};
```

**Zweck**: Einheitliche Terminologie-Verwaltung im gesamten Projekt
**Vorteile**: 
- Konsistente Benutzererfahrung
- Einheitliche Kommunikation
- Professionelle Terminologie

#### Terminologie-Update-Pattern
```typescript
// Systematische Terminologie-Updates
const updateTerminology = (oldTerm: string, newTerm: string) => {
  // 1. Vollständige Projekt-Durchsuchung
  const occurrences = grepSearch(oldTerm);
  
  // 2. Systematische Ersetzung
  occurrences.forEach(occurrence => {
    replaceInFile(occurrence.file, occurrence.line, oldTerm, newTerm);
  });
  
  // 3. Verifikation
  const remainingOccurrences = grepSearch(oldTerm);
  if (remainingOccurrences.length > 0) {
    throw new Error(`Terminologie-Update unvollständig: ${remainingOccurrences.length} Vorkommen verbleiben`);
  }
  
  // 4. Dokumentation aktualisieren
  updateDocumentation(newTerm);
};
```

**Zweck**: Systematische Terminologie-Updates im gesamten Projekt
**Vorteile**: 
- Vollständige Abdeckung aller Vorkommen
- Automatische Verifikation
- Dokumentations-Update

#### Rechtliche Dokumente-Update-Pattern
```typescript
// Rechtliche Dokumente mit Terminologie-Updates
const updateLegalDocuments = (oldTerm: string, newTerm: string) => {
  const legalFiles = [
    'src/pages/AgbPage.tsx',
    'src/pages/DatenschutzPage.tsx',
    'src/pages/ImpressumPage.tsx'
  ];
  
  legalFiles.forEach(file => {
    const content = readFile(file);
    const updatedContent = content.replace(new RegExp(oldTerm, 'g'), newTerm);
    writeFile(file, updatedContent);
  });
};
```

**Zweck**: Rechtliche Dokumente mit Terminologie-Updates
**Vorteile**: 
- Rechtliche Compliance
- Konsistente Terminologie in AGB
- Professionelle Dokumentation

#### Frontend-Komponenten-Update-Pattern
```typescript
// Frontend-Komponenten mit Terminologie-Updates
const updateFrontendComponents = (oldTerm: string, newTerm: string) => {
  const componentFiles = [
    'src/pages/RegisterPage.tsx',
    'src/pages/CaretakerDashboardPage.tsx',
    'src/components/layout/Footer.tsx',
    'src/pages/BetreuerProfilePage.tsx'
  ];
  
  componentFiles.forEach(file => {
    const content = readFile(file);
    const updatedContent = content.replace(new RegExp(oldTerm, 'g'), newTerm);
    writeFile(file, updatedContent);
  });
};
```

**Zweck**: Frontend-Komponenten mit Terminologie-Updates
**Vorteile**: 
- Konsistente UI-Texte
- Einheitliche Benutzererfahrung
- Professionelle Präsentation

#### Backend-Services-Update-Pattern
```typescript
// Backend-Services mit Terminologie-Updates
const updateBackendServices = (oldTerm: string, newTerm: string) => {
  const backendFiles = [
    'src/lib/supabase/db.ts',
    'supabase/migrations/*.sql',
    'supabase/functions/*/index.ts'
  ];
  
  backendFiles.forEach(file => {
    const content = readFile(file);
    const updatedContent = content.replace(new RegExp(oldTerm, 'g'), newTerm);
    writeFile(file, updatedContent);
  });
};
```

**Zweck**: Backend-Services mit Terminologie-Updates
**Vorteile**: 
- Konsistente API-Responses
- Einheitliche Datenbank-Kommentare
- Professionelle Backend-Dokumentation

#### Dokumentations-Update-Pattern
```typescript
// Dokumentation mit Terminologie-Updates
const updateDocumentation = (oldTerm: string, newTerm: string) => {
  const documentationFiles = [
    'README.md',
    'memory-bank/activeContext.md',
    'memory-bank/progress.md',
    'memory-bank/systemPatterns.md'
  ];
  
  documentationFiles.forEach(file => {
    const content = readFile(file);
    const updatedContent = content.replace(new RegExp(oldTerm, 'g'), newTerm);
    writeFile(file, updatedContent);
  });
};
```

**Zweck**: Dokumentation mit Terminologie-Updates
**Vorteile**: 
- Konsistente Dokumentation
- Einheitliche Projekt-Beschreibungen
- Professionelle Dokumentation

### Terminologie-Verifikation-Pattern
```typescript
// Verifikation der Terminologie-Konsistenz
const verifyTerminologyConsistency = (oldTerm: string, newTerm: string) => {
  // 1. Prüfe ob alte Terminologie noch vorhanden ist
  const remainingOldTerms = grepSearch(oldTerm);
  if (remainingOldTerms.length > 0) {
    console.warn(`Warnung: ${remainingOldTerms.length} Vorkommen von "${oldTerm}" verbleiben`);
    return false;
  }
  
  // 2. Prüfe ob neue Terminologie korrekt implementiert ist
  const newTerms = grepSearch(newTerm);
  if (newTerms.length === 0) {
    console.error(`Fehler: Keine Vorkommen von "${newTerm}" gefunden`);
    return false;
  }
  
  // 3. Bestätige erfolgreiche Ersetzung
  console.log(`✅ Terminologie-Update erfolgreich: ${newTerms.length} Vorkommen von "${newTerm}" gefunden`);
  return true;
};
```

**Zweck**: Verifikation der Terminologie-Konsistenz
**Vorteile**: 
- Automatische Verifikation
- Fehlerbehandlung
- Bestätigung der erfolgreichen Implementierung

### Verifizierungssystem-Architektur

#### VerificationService Pattern
```typescript
// Vollständiger Backend-Service für Dokument-Upload und -Verwaltung
export class VerificationService {
  // Dokument-Verschlüsselung vor Storage-Upload
  private static async encryptFile(file: File): Promise<Blob>
  
  // Datei-Validierung (PDF, JPG, PNG, 10MB Limit)
  private static validateFile(file: File): { isValid: boolean; error?: string }
  
  // Upload zur Supabase Storage mit Verschlüsselung
  private static async uploadFile(file: File, userId: string, documentType: 'ausweis' | 'zertifikat'): Promise<string>
  
  // Verifizierungsanfrage einreichen
  static async submitVerificationRequest(userId: string, ausweisFile: File, zertifikatFiles: File[]): Promise<VerificationDocument>
  
  // Admin: Alle Verifizierungsanfragen laden (mit RPC)
  static async getAllVerificationRequests(): Promise<VerificationDocument[]>
  
  // Admin: Status aktualisieren
  static async updateVerificationStatus(requestId: string, status: string, adminComment?: string, adminId?: string): Promise<void>
}
```

#### RLS-Policies Pattern
```sql
-- Benutzer können nur ihre eigenen Verifizierungsanfragen sehen
CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Admins können alle Verifizierungsanfragen sehen
CREATE POLICY "Admins can view all verification requests" ON verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- RPC-Funktion für sichere Admin-Abfragen
CREATE OR REPLACE FUNCTION get_all_verification_requests()
RETURNS TABLE (...) LANGUAGE plpgsql SECURITY DEFINER
```

#### Admin-Verwaltungs-Pattern
```typescript
// VerificationManagementPanel für Admin-Dashboard
const VerificationManagementPanel: React.FC<VerificationManagementPanelProps> = ({ currentAdminId }) => {
  // State für Verifizierungsanfragen
  const [verificationRequests, setVerificationRequests] = useState<VerificationWithUser[]>([]);
  
  // Filter und Suche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Status-Update mit Admin-Kommentar
  const handleStatusUpdate = async (requestId: string, status: string, comment?: string) => {
    await VerificationService.updateVerificationStatus(requestId, status, comment, currentAdminId);
  };
  
  // Dokument-Download für Admins
  const handleDownloadDocument = async (fileUrl: string, fileName: string) => {
    const blob = await VerificationService.downloadDocument(fileUrl);
    // Download-Logik
  };
};
```

#### Caretaker-Dashboard-Integration-Pattern
```typescript
// Verifizierungs-Tab im CaretakerDashboardPage
const [activeTab, setActiveTab] = useState<'uebersicht' | 'fotos' | 'texte' | 'kunden' | 'bewertungen' | 'sicherheit' | 'verifizierung' | 'mitgliedschaften'>('uebersicht');

// Verifizierungsstatus in Dashboard-Übersicht
{activeTab === 'uebersicht' && (
  <div className="space-y-8">
    {/* Verifizierungsstatus */}
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <div className={`${getVerificationStatusColor(verificationStatus)}`}>
          {getVerificationStatusIcon(verificationStatus)}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            Status: {getVerificationStatusText(verificationStatus)}
          </p>
        </div>
      </div>
    </div>
  </div>
)}
```

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
**Status**: Owner Dashboard Bug-Fix-Patterns dokumentiert, einschließlich Datenbank-Optimierung und Authentication-Verbesserungen  
**Nächste Überprüfung**: Nach umfangreichen Tests der Dashboard-Fixes

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

## Dashboard-Layout-Patterns

### Dashboard-Breiten-Konsistenz

#### Container-Klasse-Pattern
```typescript
// Einheitliche Container-Klasse für alle Dashboards
<div className="container-custom py-8">
  {/* Dashboard-Inhalt */}
</div>
```

**Zweck**: Konsistente Breite aller Dashboards mit Header/Navigation
**Vorteile**: 
- Gleiche maximale Breite (max-w-7xl) wie Header/Navigation
- Responsive Padding (px-4 sm:px-6 lg:px-8)
- Automatische Zentrierung (mx-auto)

#### Dashboard-Breiten-Migration
```typescript
// Vorher: Begrenzte Breite
<div className="max-w-4xl mx-auto py-8 px-4">
  {/* Dashboard-Inhalt */}
</div>

// Nachher: Vollbreite mit container-custom
<div className="container-custom py-8">
  {/* Dashboard-Inhalt */}
</div>
```

**Zweck**: Migration von begrenzter zu voller Dashboard-Breite
**Vorteile**: 
- Bessere Raumnutzung auf größeren Bildschirmen
- Konsistente Breite mit Header/Navigation
- Einfachere Wartung durch einheitliche Container-Klasse

### 2-Spalten-Grid-Layout-Pattern

#### Responsive Grid-System
```typescript
// 2-Spalten-Grid mit Mobile-First Ansatz
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Linke Spalte */}
  <div className="space-y-8">
    {/* Sektion 1 */}
    <div>
      <h2>Sektion 1</h2>
      <div className="bg-white rounded-xl shadow p-6">
        {/* Inhalt */}
      </div>
    </div>
    
    {/* Sektion 2 */}
    <div>
      <h2>Sektion 2</h2>
      <div className="bg-white rounded-xl shadow p-6">
        {/* Inhalt */}
      </div>
    </div>
  </div>

  {/* Rechte Spalte */}
  <div className="space-y-8">
    {/* Sektion 3 */}
    <div>
      <h2>Sektion 3</h2>
      <div className="bg-white rounded-xl shadow p-6">
        {/* Inhalt */}
      </div>
    </div>
  </div>
</div>
```

**Zweck**: Optimale Raumnutzung durch 2-Spalten-Layout
**Vorteile**: 
- Mobile-First responsive Design
- Logische Gruppierung verwandter Sektionen
- Konsistente Abstände zwischen Sektionen
- Bessere Benutzererfahrung auf größeren Bildschirmen

#### Grid-Spalten-Struktur
```typescript
// Linke Spalte: Hauptfunktionen
<div className="space-y-8">
  {/* Leistungen */}
  <div>
    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-2">
      <PawPrint className="w-5 h-5" /> Leistungen
    </h2>
    <div className="bg-white rounded-xl shadow p-6 relative">
      {/* Leistungen-Inhalt */}
    </div>
  </div>

  {/* Verfügbarkeit */}
  <div>
    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-900">
      <Calendar className="w-5 h-5" /> Verfügbarkeit
    </h2>
    <div className="bg-white rounded-xl shadow p-6">
      {/* Verfügbarkeit-Inhalt */}
    </div>
  </div>

  {/* Übernachtungs-Verfügbarkeit */}
  <div>
    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-2">
      <Moon className="w-5 h-5" /> Übernachtungen
    </h2>
    <div className="bg-white rounded-xl shadow p-6">
      {/* Übernachtungs-Inhalt */}
    </div>
  </div>
</div>

// Rechte Spalte: Qualifikationen
<div className="space-y-8">
  {/* Qualifikationen */}
  <div>
    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-2">
      <Shield className="w-5 h-5" /> Qualifikationen
    </h2>
    <div className="bg-white rounded-xl shadow p-6 relative">
      {/* Qualifikationen-Inhalt */}
    </div>
  </div>
</div>
```

**Zweck**: Logische Gruppierung von Dashboard-Sektionen
**Vorteile**: 
- Hauptfunktionen in der linken Spalte
- Zusätzliche Informationen in der rechten Spalte
- Konsistente Icon-Verwendung für Sektionen
- Einheitliche Karten-Struktur

### Dashboard-Layout-Konsistenz

#### Einheitliche Sektion-Struktur
```typescript
// Standard-Sektion-Struktur für alle Dashboard-Sektionen
<div>
  <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 mb-2">
    <Icon className="w-5 h-5" /> Titel
  </h2>
  <div className="bg-white rounded-xl shadow p-6 relative">
    {/* Sektion-Inhalt */}
  </div>
</div>
```

**Zweck**: Konsistente Struktur für alle Dashboard-Sektionen
**Vorteile**: 
- Einheitliches visuelles Erscheinungsbild
- Konsistente Icon-Verwendung
- Einheitliche Abstände und Schatten
- Einfache Wartung und Erweiterung

#### Responsive Abstände
```typescript
// Konsistente Abstände zwischen Sektionen
<div className="space-y-8">
  {/* Sektionen mit einheitlichen Abständen */}
</div>
```

**Zweck**: Konsistente Abstände zwischen Dashboard-Sektionen
**Vorteile**: 
- Einheitliche visuelle Hierarchie
- Bessere Lesbarkeit
- Konsistente Benutzererfahrung

### Dashboard-Layout-Integration

#### Tab-Integration mit Grid-Layout
```typescript
// Tab-Inhalt mit Grid-Layout
{activeTab === 'uebersicht' && (
  <>
    {/* 2-Spalten Grid Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Linke Spalte */}
      <div className="space-y-8">
        {/* Sektionen */}
      </div>

      {/* Rechte Spalte */}
      <div className="space-y-8">
        {/* Sektionen */}
      </div>
    </div>
  </>
)}
```

**Zweck**: Grid-Layout in bestehende Tab-Struktur integrieren
**Vorteile**: 
- Nahtlose Integration in bestehende Navigation
- Konsistente Tab-Erfahrung
- Optimale Raumnutzung

#### JSX-Struktur-Konsistenz
```typescript
// Korrekte JSX-Struktur für Grid-Layout
{activeTab === 'uebersicht' && (
  <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        <div>
          <h2>Titel</h2>
          <div className="bg-white rounded-xl shadow p-6">
            {/* Inhalt */}
          </div>
        </div>
      </div>
    </div>
  </>
)}
```

**Zweck**: Korrekte JSX-Struktur für Grid-Layout
**Vorteile**: 
- Vermeidung von JSX-Syntax-Fehlern
- Konsistente Komponenten-Struktur
- Einfache Wartung und Erweiterung

## UI-Modal-System-Patterns

### ConfirmationModal-Architektur

#### Wiederverwendbare Modal-Komponente
```typescript
// ConfirmationModal.tsx - Zentrale Modal-Komponente für Bestätigungsdialoge
export interface ConfirmationModalProps {
  isOpen: boolean;
  type?: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  confirmText = 'Bestätigen',
  cancelText = 'Abbrechen',
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      default:
        return <Info className="h-8 w-8 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 mr-3">
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors ${getConfirmButtonClass()}`}
            >
              {loading ? 'Wird ausgeführt...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

**Zweck**: Zentrale Modal-Komponente für alle Bestätigungsdialoge
**Vorteile**: 
- 4 verschiedene Modal-Typen mit entsprechenden Icons
- Anpassbare Titel, Nachrichten und Button-Texte
- Elegante Animationen mit CSS-Klassen
- Loading-State für asynchrone Operationen
- Responsive Design für alle Bildschirmgrößen

#### Browser-Alert-Ersetzung-Pattern
```typescript
// Ersetzung von Browser-Alerts durch UI-Modals
const AdvertisementManagementPanel = ({ currentAdminId }) => {
  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  
  const { addToast, toasts, removeToast } = useToast();

  // Modal helper functions
  const showConfirmModal = (
    type: 'info' | 'warning' | 'error' | 'success',
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setConfirmModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm
    });
  };

  const hideConfirmModal = () => {
    setConfirmModal(null);
  };

  // Validierungsfehler - Vorher: alert()
  if (!formData.link_url || !formData.link_url.trim()) {
    showConfirmModal(
      'warning',
      'Link-URL erforderlich',
      'Bitte geben Sie eine Link-URL ein.',
      () => hideConfirmModal()
    );
    return;
  }

  // Lösch-Bestätigung - Vorher: window.confirm()
  const handleDelete = async (id: string) => {
    showConfirmModal(
      'warning',
      'Werbeanzeige löschen',
      'Sind Sie sicher, dass Sie diese Werbeanzeige löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
      async () => {
        hideConfirmModal();
        try {
          await advertisementService.deleteAdvertisement(id);
          addToast({
            type: 'success',
            title: 'Erfolgreich gelöscht',
            message: 'Werbeanzeige wurde erfolgreich gelöscht.'
          });
        } catch (error) {
          showConfirmModal(
            'error',
            'Fehler beim Löschen',
            'Fehler beim Löschen der Werbeanzeige. Bitte versuchen Sie es später erneut.',
            () => hideConfirmModal()
          );
        }
      }
    );
  };

  return (
    <div>
      {/* Komponenten-Inhalt */}
      
      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          type={confirmModal.type}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={hideConfirmModal}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};
```

**Zweck**: Ersetzung von Browser-Alerts durch elegante UI-Modals
**Vorteile**: 
- Bessere UX durch konsistente, moderne Dialoge
- Mehr Informationen und Kontext in Nachrichten
- Responsive Design und bessere Accessibility
- Integration mit Toast-System für Erfolgsmeldungen
- Nicht-blockierende Benutzerführung

#### Modal-State-Management-Pattern
```typescript
// Modal-State-Management mit TypeScript
interface ModalState {
  isOpen: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  onConfirm: () => void;
}

const useConfirmModal = () => {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const showModal = useCallback((
    type: ModalState['type'],
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
      onConfirm
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(null);
  }, []);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal('info', title, message, onConfirm || hideModal);
  }, [showModal, hideModal]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal('warning', title, message, onConfirm || hideModal);
  }, [showModal, hideModal]);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal('error', title, message, onConfirm || hideModal);
  }, [showModal, hideModal]);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal('success', title, message, onConfirm || hideModal);
  }, [showModal, hideModal]);

  return {
    modalState,
    showInfo,
    showWarning,
    showError,
    showSuccess,
    hideModal
  };
};
```

**Zweck**: Wiederverwendbares Modal-State-Management
**Vorteile**: 
- Typisierte Modal-Verwaltung
- Einfache API für verschiedene Modal-Typen
- Memoized Callbacks für Performance
- Wiederverwendbar in verschiedenen Komponenten

### Modal-Integration-Patterns

#### Admin-Panel-Integration
```typescript
// Integration in Admin-Panels
const AdminPanel = () => {
  const { modalState, showWarning, showError, hideModal } = useConfirmModal();
  const { addToast } = useToast();

  const handleDangerousAction = async () => {
    showWarning(
      'Gefährliche Aktion',
      'Diese Aktion kann nicht rückgängig gemacht werden. Sind Sie sicher?',
      async () => {
        hideModal();
        try {
          await performDangerousAction();
          addToast({
            type: 'success',
            title: 'Erfolgreich',
            message: 'Aktion wurde erfolgreich ausgeführt.'
          });
        } catch (error) {
          showError(
            'Fehler',
            'Die Aktion konnte nicht ausgeführt werden.',
            () => hideModal()
          );
        }
      }
    );
  };

  return (
    <div>
      {/* Panel-Inhalt */}
      
      {modalState && (
        <ConfirmationModal
          isOpen={modalState.isOpen}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
          onConfirm={modalState.onConfirm}
          onCancel={hideModal}
        />
      )}
    </div>
  );
};
```

**Zweck**: Standardisierte Modal-Integration in Admin-Panels
**Vorteile**: 
- Konsistente Modal-Verwendung
- Einfache Integration mit useConfirmModal Hook
- Kombiniert mit Toast-System für vollständiges Feedback

## Toast-Notification-Patterns

### Toast-System-Architektur

#### Toast-Komponenten-Struktur
```typescript
// Toast.tsx - Einzelne Toast-Komponente
interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animation einblenden
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close nach duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  return (
    <div className={cn(
      'transform transition-all duration-300 ease-in-out',
      isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      'bg-white rounded-lg shadow-lg border-l-4 p-4 min-w-80 max-w-md',
      type === 'success' && 'border-green-500',
      type === 'error' && 'border-red-500',
      type === 'warning' && 'border-yellow-500',
      type === 'info' && 'border-blue-500'
    )}>
      {/* Toast-Content */}
    </div>
  );
};
```

**Zweck**: Einzelne Toast-Komponente mit Animationen und Auto-Close
**Vorteile**: 
- Sanfte Ein-/Ausblend-Animationen
- Automatisches Schließen nach konfigurierbarer Zeit
- Manuelles Schließen möglich
- 4 verschiedene Typen (success, error, warning, info)

#### Toast-Container-Pattern
```typescript
// ToastContainer.tsx - Container für alle Toasts
const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
};
```

**Zweck**: Container für alle Toasts mit Positionierung oben rechts
**Vorteile**: 
- Feste Positionierung (fixed top-4 right-4)
- Hoher Z-Index (z-50) für Überlagerung
- Vertikale Stapelung mit Abständen
- Automatisches Rendering nur bei vorhandenen Toasts

#### useToast Hook Pattern
```typescript
// useToast.ts - Hook für Toast-Management
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      id,
      ...options,
      onClose: (id: string) => removeToast(id)
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  return { toasts, showSuccess, showError, showWarning, showInfo, removeToast };
};
```

**Zweck**: Zentrale Toast-Verwaltung mit einfachen Methoden
**Vorteile**: 
- Einfache API für verschiedene Toast-Typen
- Automatische ID-Generierung
- Callback-basierte Toast-Entfernung
- Memoized Callbacks für Performance

### Toast-Integration-Patterns

#### Komponenten-Integration
```typescript
// CaretakerDashboardPage.tsx - Toast-Integration
function CaretakerDashboardPage() {
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const handleRequestApproval = async () => {
    try {
      await AdminApprovalService.requestApproval(user.id);
      
      // Erfolgs-Benachrichtigung anzeigen
      showSuccess(
        'Profil erfolgreich eingereicht!',
        'Ihr Profil wurde zur Freigabe eingereicht. Sie erhalten eine Benachrichtigung, sobald es von einem Administrator überprüft wurde.',
        6000
      );
      
    } catch (error: any) {
      // Fehler-Benachrichtigung anzeigen
      const errorMessage = error?.message || 'Ein unbekannter Fehler ist aufgetreten.';
      showError(
        'Fehler beim Einreichen des Profils',
        errorMessage,
        8000
      );
    }
  };

  return (
    <div className="container-custom py-8">
      {/* Dashboard-Inhalt */}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
```

**Zweck**: Integration von Toast-System in bestehende Komponenten
**Vorteile**: 
- Einfache Integration mit useToast Hook
- Benutzerfreundliche Nachrichten statt alert()
- Konfigurierbare Dauer für verschiedene Nachrichten
- Automatische Positionierung oben rechts

#### Toast-Typen-Pattern
```typescript
// Toast-Typen mit spezifischen Styling
const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const getToastBorderColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'border-green-500';
    case 'error':
      return 'border-red-500';
    case 'warning':
      return 'border-yellow-500';
    case 'info':
      return 'border-blue-500';
  }
};
```

**Zweck**: Konsistente Styling-Patterns für verschiedene Toast-Typen
**Vorteile**: 
- Einheitliche Icon-Verwendung
- Konsistente Farbgebung
- Einfache Erweiterbarkeit für neue Typen

### Toast-Performance-Patterns

#### Animation-Optimierung
```typescript
// Optimierte Animationen mit CSS-Transitions
const Toast = ({ id, type, title, message, duration, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animation einblenden
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close nach duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  return (
    <div className={cn(
      'transform transition-all duration-300 ease-in-out',
      isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      'bg-white rounded-lg shadow-lg border-l-4 p-4 min-w-80 max-w-md'
    )}>
      {/* Toast-Content */}
    </div>
  );
};
```

**Zweck**: Optimierte Animationen für bessere Performance
**Vorteile**: 
- CSS-Transitions für Hardware-Beschleunigung
- Kontrollierte Animation-Timing
- Smooth Ein-/Ausblend-Effekte

#### Memory-Management
```typescript
// Automatische Cleanup für Toasts
const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Automatische Cleanup bei Komponenten-Unmount
  useEffect(() => {
    return () => {
      // Alle Toasts beim Unmount entfernen
      setToasts([]);
    };
  }, []);

  return { toasts, removeToast, /* ... */ };
};
```

**Zweck**: Automatische Memory-Verwaltung für Toasts
**Vorteile**: 
- Verhindert Memory-Leaks
- Automatische Cleanup bei Komponenten-Unmount
- Effiziente Toast-Verwaltung

---

**Letzte Aktualisierung**: 08.02.2025  
**Status**: UI-Modal-System-Patterns und Toast-Notification-Patterns dokumentiert  
**Nächste Überprüfung**: Nach Implementierung des Buchungssystems