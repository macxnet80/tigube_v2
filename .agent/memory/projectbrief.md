# Project Brief: Tigube v2 - Haustierbetreuungsplattform

## Projektübersicht

Tigube v2 ist eine moderne Web-Plattform zur Vermittlung von Haustierbetreuungsdiensten. Die Anwendung verbindet Tierhalter mit vertrauenswürdigen Tierbetreuern in ihrer Nähe.

## Kernfunktionalitäten

### Hauptfeatures
- **Suchfunktion**: Benutzer können nach verschiedenen Betreuungsdiensten suchen
- **Standortbasierte Suche**: PLZ/Ort-basierte Filterung
- **Terminplanung**: Von/Bis-Datum für Betreuungszeiten
- **Service-Kategorien** (u. a.): Hundebetreuung, Hundetagesbetreuung, Katzenbetreuung, Gassi-Service, Hausbesuche, Haussitting
- **Betreuer-Profile**: Detaillierte Profile der Tierbetreuer und Dienstleister
- **Owner-Profile** (`/owner/:userId`): Öffentliche Tierhalter-Profile (login-pflichtig), Datenschutz, Share-Settings
  - Kurzvorstellung (`short_intro`), langer Text „Über mich“ (`about_me`)
  - Keine Kontaktdaten auf der Public Page — Kommunikation über Chat
  - **Jobs** (Premium): offene Aufträge des Tierhalters, Liste auch unter `/jobs`
- **Benutzerregistrierung**: Registrierung und Anmeldung (deutsche URLs z. B. `/anmelden`, `/registrieren`)
- **Chat / Nachrichten**: Konversationen Tierhalter–Betreuer; **Bewerbung auf Jobs** per Chat (Premium Betreuer)
- **Favoriten-System**: Tierhalter können Betreuer/Dienstleister favorisieren

### Benutzerrollen
- **Owner (Tierhalter)**: Suchen, buchen, öffentliches Profil, optional Jobs einstellen (Premium)
- **Caretaker / Dienstleister-Typen**: Betreuung anbieten, auf Tierhalter-Jobs bewerben (Premium)
- **Admin**: Plattform-Verwaltung (eigene Pfade)
- **Partner**: Geschäftspartner (Caretaker-Dashboard)

## Technische Basis (Ist-Stand)

### Frontend
- **Vite 5** + **React 18** + **TypeScript**
- **React Router v6** (Lazy-Loading der Seiten)
- **Tailwind CSS**, **Lucide React**, **Headless UI** (u. a.)
- **Zustand** für globalen State wo nötig

### Backend/Services
- **Supabase**: Auth, PostgreSQL, RLS, Storage, Realtime je nach Feature
- Typen: `src/lib/supabase/database.types.ts` (Schema der DB)

### State & Utilities
- **React Context** (z. B. Auth)
- **date-fns**, **clsx** + **tailwind-merge**

## Geschäftsziele

1. Vertrauen zwischen Tierhaltern und Betreuern
2. Einfache Suche und klare Profile
3. Lokale Vernetzung
4. Qualität (Bewertungen, Verifizierung wo vorgesehen)
5. Mobile-First

## Aktuelle Version

- **Version**: 0.1.0 (package.json)
- **Status**: Aktive Entwicklung
- **Plattform**: Web (Vite SPA)
- **Deployment**: typisch Vercel/Netlify-kompatibel
