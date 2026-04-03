# Design System — tigube v2

> Dieses Dokument beschreibt das visuelle Design-System der tigube-Plattform.  
> Schreibweise im UI immer **klein**: **tigube** (Ausnahme: rechtliche Firmierungen wie „tigube UG").

---

## 1. Designprinzipien

| Prinzip | Beschreibung |
|---|---|
| **Vertrauen** | Klare Struktur, keine überladenen Layouts — Nutzer sollen sich sicher fühlen |
| **Mobile-First** | Jede Komponente wird zuerst für kleine Bildschirme entworfen |
| **Utility-First** | Tailwind CSS – kein Custom CSS, wenn eine Utility-Klasse ausreicht |
| **Konsistenz** | Gleiche UI-Patterns auf Tierhalter- und Betreuer-Dashboards |
| **Barrierefreiheit** | `aria-*`-Attribute, Keyboard-Navigation, ausreichende Kontraste |

---

## 2. Farbpalette

### Primärfarbe — Olivgrün

tigube nutzt ein erdiges Olivgrün als Markenfarbe. Es steht für Natur, Vertrauen und Nähe.

| Token | Hex | Verwendung |
|---|---|---|
| `primary-50` | `#F5F6F0` | Hintergründe, aktive Nav-Einträge |
| `primary-100` | `#E0E3D7` | Badge-Hintergrund, leichte Akzente |
| `primary-200` | `#C2C9B4` | Borders, Trennlinien |
| `primary-300` | `#A3AF91` | Dekorative Elemente |
| `primary-400` | `#85956E` | Hover-States (sekundär) |
| **`primary-500`** | **`#667B4B`** | **Standard-Primärfarbe (Buttons, Links)** |
| `primary-600` | `#5A7537` | Hover auf primären Buttons, Nav-Aktivborder |
| `primary-700` | `#4E642F` | Aktive Texte, starke Akzente |
| `primary-800` | `#425327` | Dunkelakzent |
| `primary-900` | `#36421F` | Tiefster Ton |

```
primary DEFAULT = #5A7537
```

### Weitere Farben

| Token | Hex | Verwendung |
|---|---|---|
| `secondary` | `#F5F6F0` | Seitenhintergrund, Karten-BG-Varianten |
| `background` | `#F5F6F0` | Body-Hintergrund |
| `text` | `#222` | Standard-Textfarbe |
| `dark` | `#5A6B4B` | Dunklere Schrift-/UI-Variante |

### Semantische Farben (Tailwind-Standard)

| Bedeutung | Klassen | Hex (approx.) |
|---|---|---|
| Erfolg | `green-*` | `#16a34a` |
| Warnung | `yellow-*` / `amber-*` | `#d97706` |
| Fehler / Gefahr | `red-*` | `#dc2626` |
| Neutral / Sekundär | `gray-*` | `#6b7280` |
| Premium-Hinweis | `amber-500` | `#f59e0b` |

---

## 3. Typografie

### Schriftfamilie

```
font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
           Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif
```

Inter wird als primäre Schriftart verwendet — klar, modern und gut lesbar auf allen Bildschirmgrößen.

### Hierarchie

| Ebene | Tailwind | Größe (rem) | Gewicht |
|---|---|---|---|
| H1 | `text-4xl sm:text-5xl font-medium` | 2.25 / 3 | 500 |
| H2 | `text-3xl sm:text-4xl font-medium` | 1.875 / 2.25 | 500 |
| H3 | `text-2xl sm:text-3xl font-medium` | 1.5 / 1.875 | 500 |
| Body | `leading-relaxed` | 1 (16px) | 400 |
| Label / UI | `text-sm font-medium` | 0.875 | 500 |
| Caption | `text-xs` | 0.75 | 400 |

### Regeln
- Überschriften immer `font-medium leading-tight`
- Fließtext immer `leading-relaxed`
- `antialiased` global auf `body`

---

## 4. Abstände (Spacing)

Tailwind-Standard-Skala, angepasste Schlüsselwerte:

| Token | rem | px |
|---|---|---|
| `1` | 0.25 rem | 4 px |
| `2` | 0.5 rem | 8 px |
| `3` | 0.75 rem | 12 px |
| `4` | 1 rem | 16 px |
| `5` | 1.25 rem | 20 px |
| `6` | 1.5 rem | 24 px |
| `8` | 2 rem | 32 px |
| `10` | 2.5 rem | 40 px |
| `12` | 3 rem | 48 px |
| `16` | 4 rem | 64 px |
| `20` | 5 rem | 80 px |
| `24` | 6 rem | 96 px |

---

## 5. Layout

### Container

```css
.container-custom {
  @apply px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl;
}
```

Seitenweiter Wrapper für alle Hauptbereiche.

### Breakpoints (Tailwind-Standard)

| Name | Breite |
|---|---|
| `sm` | ≥ 640 px |
| `md` | ≥ 768 px |
| `lg` | ≥ 1024 px |
| `xl` | ≥ 1280 px |
| `2xl` | ≥ 1536 px |

### Dashboard-Layout (Sidebar + Hauptinhalt)

```
grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8
```

- **Sidebar**: `aside.lg:col-span-1` — `bg-white rounded-xl shadow` — `lg:sticky lg:top-4`
- **Hauptinhalt**: `section.lg:col-span-3 min-w-0`
- **Mobile Nav**: `ul flex-row lg:flex-col` + `overflow-x-auto scrollbar-hide`

### Such-/Marktplatz-Layout

Zweispaltig: linke Filterspate `lg:w-80`, rechts Ergebnisliste.  
Filterbereich sticky: `sticky top-8`.  
Hintergrund: `bg-gray-50 min-h-screen`.

### Seitenabschnitte

- Karten: `bg-white rounded-xl shadow-sm`
- Sektionshintergrund: `bg-gray-50`
- Trenner innerhalb: `border-t border-gray-100`

---

## 6. Komponenten

### Buttons

Basis: `inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`

| Variante | Klassen |
|---|---|
| `primary` | `bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500` |
| `secondary` | `bg-secondary-500 text-white hover:bg-secondary-600` |
| `outline` | `border border-gray-300 bg-white text-gray-700 hover:bg-gray-50` |
| `ghost` | `bg-transparent hover:bg-gray-100 text-gray-700` |
| `link` | `bg-transparent text-primary-600 hover:underline` |
| `green` | `bg-green-600 text-white hover:bg-green-700` |

| Größe | Klassen |
|---|---|
| `sm` | `px-3 py-1.5 text-sm` |
| `md` | `px-4 py-2` |
| `lg` | `px-6 py-3 text-lg` |

**Zustände**: `isLoading → opacity-70 cursor-not-allowed` · `disabled → opacity-50 cursor-not-allowed`

CSS-Klassen-Shortcuts (via `index.css`):
```css
.btn        → Basis
.btn-primary  → Primär
.btn-outline  → Outline
```

---

### Karten (Cards)

```css
.card {
  @apply bg-white rounded-xl shadow-sm overflow-hidden 
         border border-gray-100 transition-all duration-200 hover:shadow-md;
}
```

Standardkarte: weiß, `rounded-xl`, leichter Schatten, Hover-Schatten.

---

### Eingabefelder (Inputs)

```css
.input {
  @apply block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
         placeholder-gray-400 focus:outline-none focus:ring-2 
         focus:ring-primary-500 focus:border-primary-500;
}
```

Erweitert im Such-Stil (`layout="search"`):
- Icon links im Feld, `py-2.5`, `focus:ring-primary-500`

---

### Badges

Basis: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors`

| Variante | Klassen |
|---|---|
| `primary` | `bg-primary-100 text-primary-800 border border-primary-200` |
| `secondary` | `bg-gray-100 text-gray-800 border border-gray-200` |
| `success` | `bg-green-100 text-green-800 border border-green-200` |
| `warning` | `bg-yellow-100 text-yellow-800 border border-yellow-200` |
| `error` / `danger` | `bg-red-100 text-red-800 border border-red-200` |
| `outline` | `bg-transparent text-gray-700 border border-gray-300` |

„NEW"-Badge in Navigation:
```html
<span class="rounded bg-primary-600 px-1 py-0.5 text-[10px] font-bold uppercase leading-none text-white">
  NEW
</span>
```

Premium-Hinweis-Badge:
```html
<span class="bg-amber-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
  🔒 Premium
</span>
```

---

### Navigation (Header)

- **Desktop**: `hidden md:flex items-center space-x-8`
- **Aktiver Link**: `border-b-2 border-primary-500 text-gray-900`
- **Inaktiver Link**: `border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800`
- **Header**: `bg-white shadow-sm sticky top-0 z-50`
- **Mobile-Menü**: animiert via `animate-fade-in`; aktiver Eintrag `bg-primary-50 text-primary-700`

---

### Dashboard-Sidebar-Navigation

- Aktiver Eintrag: `bg-primary-50 text-primary-700 border border-primary-200`
- Icons: Lucide, `h-4 w-4 shrink-0 opacity-80`
- `aria-current="page"` auf aktivem Element

---

### Modals

- Statt `alert()` immer Modal-Komponenten verwenden (`ConfirmationModal`, `PaymentSuccessModal`, etc.)
- Basis: weißer Container, `rounded-xl`, Overlay dunkel

---

### Toast / Benachrichtigungen

- Library: `react-hot-toast` + eigene `Toast`-Komponenten
- Erfolg → grün, Fehler → rot, Info → primär

---

## 7. Icons

**Library**: [Lucide React](https://lucide.dev)

- Standard-Icon-Größe in Sidebar: `h-4 w-4`
- Standard in UI-Elementen: `h-5 w-5`
- Große Icons / Hero-Bereich: `h-6 w-6` bis `h-8 w-8`
- Import: `import { IconName } from 'lucide-react'`

Häufig genutzte Icons: `Menu`, `X`, `LogOut`, `SlidersHorizontal`, `ChevronDown`, `ChevronUp`

---

## 8. Animationen

Definiert in `tailwind.config.js` und `index.css`:

| Name | Klasse | Beschreibung |
|---|---|---|
| Einblenden | `animate-fade-in` | `opacity 0 → 1`, 300 ms |
| Einfahren | `animate-slide-up` | `translateY(10px) + opacity 0 → 1`, 400 ms |
| Langsames Pulsieren | `animate-pulse-slow` | 3 s Puls-Loop |
| Gradient-Animation | `animate-gradient-x` | 15 s Hintergrund-Loop |
| Modal einfahren | `animate-slideInUp` | 500 ms mit Scale |
| Erfolgs-Puls | `animate-pulseSuccess` | 2 s Scale-Puls |

---

## 9. Bilder & Assets

- **Logo**: `/Image/Logos/tigube_logo.svg` — `h-10 w-auto` im Header
- **Profilbilder**: rund via `rounded-full`, via `ProfileImageCropper` zugeschnitten
- **Crop-Vorschau**: `border-radius: 12px` (Rechteck-Crop im Uploader)

---

## 10. Footer

Grid mit **5 Spalten** auf Desktop:

```
lg:grid-cols-5: Logo | Für Tierhalter | Unternehmen | [weitere] | Marktplatz
```

Spalte „Marktplatz" enthält Link zu `/marktplatz/nutzungsbedingungen`.

---

## 11. Formulare

- Alle Formulare als **Controlled Components** (`useState`)
- Konsistente Klasse `.input` für Felder
- Submit-Button gesperrt bei fehlender Pflichterfüllung (z. B. NB-Checkbox)
- Fehler-Feedback inline unter dem Feld (`text-red-600 text-sm`)

---

## 12. Utilities

```typescript
import { cn } from '../../lib/utils'; // clsx + tailwind-merge
```

`cn()` für bedingte Klassen:

```typescript
cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' && 'primary-class'
)
```

---

## 13. Schnellreferenz — Häufige Tailwind-Kombinationen

```
Seitenhintergrund:    bg-gray-50 min-h-screen
Weiße Karte:          bg-white rounded-xl shadow-sm
Sticky Sidebar:       sticky top-8
Trennlinie:           border-t border-gray-100
Primär-Text:          text-primary-700
Sekundär-Text:        text-gray-600
Muted-Text:           text-gray-400
Primär-Hintergrund:   bg-primary-50
Primär-Button:        bg-primary-500 hover:bg-primary-600 text-white rounded-lg
Outline-Button:       border border-gray-300 bg-white text-gray-700 rounded-lg
Focus-Ring:           focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
Transition:           transition-colors duration-200
```
