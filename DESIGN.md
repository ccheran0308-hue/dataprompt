# Design Brief

**Purpose & Tone:** Professional, approachable analytics tool where users explore unfamiliar data patterns. Modern Data Studio aesthetic — confident and clear without corporate sterility.

**Aesthetic:** Modern Data Studio: grounded, intentional, distinctive. Minimal ornamentation. High-contrast zones. Restrained motion. Cyan + warm orange for accent and emphasis.

**Color Palette (Light Mode)**
| Token | OKLCH L C H | Usage |
|-------|------------|-------|
| Primary | 0.55 0.21 262 | Sidebar active, CTAs, primary interactions (cyan-blue) |
| Accent | 0.6 0.19 32 | Warm highlight, chart series, secondary CTAs (warm orange) |
| Muted | 0.93 0.01 0 | Secondary backgrounds, disabled states (light grey) |
| Destructive | 0.55 0.22 25 | Errors, delete actions (coral red) |
| Chart-1 | 0.62 0.23 262 | Cyan (primary chart color) |
| Chart-2 | 0.6 0.19 32 | Orange (secondary chart color) |
| Chart-3 | 0.65 0.16 180 | Teal (tertiary) |
| Chart-4 | 0.68 0.15 210 | Blue-teal (quaternary) |
| Chart-5 | 0.55 0.18 20 | Rust (quinary) |

**Typography**
- Display: Fraunces (bold, authoritative, identity)
- Body: GeneralSans (modern, high-legibility, 14-16px)
- Mono: GeistMono (code, data cells, query history)

**Elevation & Depth**
- Cards: subtle box-shadow (1px offset, low opacity)
- Elevated zones: stronger shadow for hover/active states
- No blur, no gradients, high contrast between light zones

**Structural Zones**
| Zone | Background | Border | Purpose |
|------|------------|--------|---------|
| Header | bg-card | border-b | Logo, app title, fixed top |
| Sidebar (left, ~280px) | bg-sidebar | border-r | Query history, favorites, query chips |
| Main Content | bg-background | none | Upload card, query input, results |
| Upload Card | bg-card | border | Large drag-drop zone, file picker button |
| Query Input | bg-card | border-b (sticky) | Text input + submit button |
| Results Container | bg-background | none | Stacked: summary text + optional chart |

**Spacing & Rhythm**
- 16px base grid
- Card padding: 24px (large), 16px (medium), 12px (compact)
- Density: low in main canvas (breathing room), medium in sidebar (compact history)
- Icon size: 20px (body), 24px (header)

**Component Patterns**
- Buttons: solid bg-primary, hover:opacity-90, no borders
- Input fields: bg-input, border-border, focus:ring-ring
- Cards: bg-card, shadow-card, rounded-md (subtle)
- Sidebar pill/chip: inline-flex, bg-muted hover:bg-primary/10, text-primary when active
- Charts: Recharts v2.15.1, custom stroke colors from --chart-* palette, minimal tooltips

**Motion & Interaction**
- Default transition: cubic-bezier(0.4, 0, 0.2, 1), 0.3s
- Results appear: fade-in + slide-up (0.3s)
- Chart series animation: 0.5s ease-out on load
- No bounce, no delay chains

**Signature Detail**
Sidebar query history rendered as distinct, clickable pill-shaped chips in monospace font. Each chip is an interactive breadcrumb — active query highlighted with bg-primary, text-primary-foreground. Hover state lightens background, creating a "smart ribbon" of recent queries. This asymmetric layout (fixed sidebar + scrollable canvas) differentiates from generic chat interfaces.

**Responsive**
Mobile-first: sidebar collapses to icon-only drawer on sm breakpoint. Upload card and chart stack vertically on sm. Query input sticky on all breakpoints.

**Dark Mode**
Intentional palette: darker backgrounds (0.12 L) with elevated cards (0.16 L). Chart colors adjusted for contrast. Cyan slightly brighter (0.75 L), orange slightly brighter (0.72 L). Same hierarchy, warmer feeling in dark.
