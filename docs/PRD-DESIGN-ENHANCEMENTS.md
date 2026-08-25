# StockTheEvent Design Enhancement PRD

## Executive Summary

Transform StockTheEvent from a functional calculator into a **visually memorable, premium party planning experience**. The current design is clean but generic—using safe choices that blend in with countless other web tools. This PRD outlines a bold aesthetic direction that captures the **celebratory, sophisticated energy of great parties** while maintaining usability and conversion focus.

---

## Current State Analysis

### What Works
- Clear information hierarchy
- Functional calculator UX
- Reasonable mobile responsiveness
- Good content structure

### What Needs Improvement
| Area | Current State | Problem |
|------|---------------|---------|
| **Typography** | Playfair Display + system fonts | Generic pairing, lacks character |
| **Color** | Amber/orange/slate | Safe, predictable, lacks depth |
| **Layout** | Standard card grids | Cookie-cutter, forgettable |
| **Motion** | Basic fade/scale | Functional but uninspired |
| **Texture** | Flat, minimal | Sterile, lacks atmosphere |
| **Brand Identity** | Weak | No memorable visual signature |

---

## Design Direction

### Aesthetic Concept: **"Golden Hour Soirée"**

Inspired by the magical moment when warm evening light transforms any gathering into something special. Think: the glow of candlelight on champagne glasses, the warmth of a sunset cocktail hour, sophisticated yet approachable.

**Tone:** Elegant celebration • Warm confidence • Refined indulgence

**NOT:** Generic SaaS • Cold tech tool • Childish party themes

---

## Typography System

### Primary Font Pairing

| Role | Font | Why |
|------|------|-----|
| **Display** | **Fraunces** (Variable) | Soft serifs with personality, optical sizing, has "wonky" axis for playfulness |
| **Body** | **Instrument Sans** | Modern geometric sans with subtle warmth, excellent readability |
| **Accent/Numbers** | **DM Mono** | Monospace for calculations, clean and legible |

### Type Scale (fluid)

```css
--font-display: 'Fraunces', Georgia, serif;
--font-body: 'Instrument Sans', system-ui, sans-serif;
--font-mono: 'DM Mono', 'SF Mono', monospace;

/* Fluid scale using clamp() */
--text-hero: clamp(3rem, 8vw, 6rem);      /* Homepage hero */
--text-display: clamp(2rem, 5vw, 3.5rem);  /* Section titles */
--text-headline: clamp(1.5rem, 3vw, 2rem); /* Card titles */
--text-subhead: clamp(1.125rem, 2vw, 1.5rem);
--text-body: clamp(1rem, 1.5vw, 1.125rem);
--text-small: clamp(0.875rem, 1vw, 0.9375rem);
--text-micro: clamp(0.75rem, 0.8vw, 0.8125rem);
```

### Typography Treatments

- **Hero text**: Fraunces with `font-variation-settings: 'SOFT' 100, 'WONK' 1` for personality
- **Result numbers**: DM Mono, bold, with subtle letter-spacing
- **Labels**: Instrument Sans, all-caps, tracked wide, small
- **Body**: Instrument Sans, regular weight, generous line-height (1.6)

---

## Color System

### Core Palette

```css
/* Warm neutrals - sophisticated, not gray */
--cream-50: #FFFBF5;
--cream-100: #FFF7EB;
--cream-200: #FFEDD5;
--cream-300: #FFE0BD;

/* Rich amber spectrum - the "golden hour" */
--gold-400: #F6AD55;
--gold-500: #ED8936;
--gold-600: #DD6B20;
--gold-700: #C05621;

/* Deep wine accent - sophistication */
--wine-500: #9B2C2C;
--wine-600: #822727;
--wine-700: #63171B;

/* Champagne tints - sparkle */
--champagne-100: #FEF5E7;
--champagne-200: #FCEBC8;
--champagne-300: #F9D89A;

/* Forest green - success/CTA */
--forest-500: #276749;
--forest-600: #22543D;
--forest-700: #1C4532;

/* Deep chocolate - text */
--chocolate-800: #3D2F1F;
--chocolate-900: #2D2318;
--chocolate-950: #1A150E;
```

### Gradient System

```css
/* Hero gradient - warm atmospheric */
--gradient-sunset: linear-gradient(
  135deg,
  var(--champagne-100) 0%,
  var(--cream-100) 40%,
  var(--gold-400) 100%
);

/* Result card gradient - rich and warm */
--gradient-result: linear-gradient(
  145deg,
  var(--gold-500) 0%,
  var(--gold-600) 50%,
  var(--wine-600) 100%
);

/* CTA gradient - lush green */
--gradient-cta: linear-gradient(
  135deg,
  var(--forest-500) 0%,
  var(--forest-600) 100%
);

/* Subtle background texture */
--gradient-paper: radial-gradient(
  ellipse at 30% 20%,
  var(--champagne-100) 0%,
  var(--cream-50) 60%,
  var(--cream-100) 100%
);
```

---

## Visual Texture & Atmosphere

### Background Treatments

**1. Noise Texture Overlay**
```css
.texture-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  mix-blend-mode: multiply;
}
```

**2. Organic Blob Shapes**
- Soft, asymmetric background blobs using CSS gradients
- Positioned off-grid for visual interest
- Subtle blur (blur-3xl) for depth

**3. Glass Morphism Elements**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 8px 32px rgba(221, 107, 32, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
```

### Decorative Elements

**1. Confetti/Sparkle Accents**
- Small CSS-only sparkles on key interactions
- Subtle, not overwhelming
- Triggered on result updates

**2. Border Flourishes**
- Thin decorative lines with subtle gradients
- Small corner ornaments on featured cards
- Inspired by vintage cocktail menus

**3. Icon Style**
- Continue using emoji for approachability
- Add subtle drop shadows for depth
- Consider custom illustrated icons for key items

---

## Component Redesigns

### 1. Interactive Calculator (Homepage Hero)

**Layout Changes:**
- Asymmetric two-column layout (input 45%, result 55%)
- Input panel: cream background with paper texture
- Result panel: dramatic gradient with depth
- Overlapping elements to break the grid

**Input Panel:**
```
┌─────────────────────────────────────┐
│  [Decorative flourish]              │
│                                     │
│  WHAT ARE YOU SERVING?              │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ 🍷  │ │ 🍺  │ │ 🥂  │ │ 🥃  │   │
│  │Wine │ │Beer │ │Champ│ │Spir │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│  THE OCCASION                       │
│  ┌─────────────────────────────┐   │
│  │ Wedding Reception        ▼  │   │
│  └─────────────────────────────┘   │
│                                     │
│  DURATION          GUESTS          │
│  ═══════●═══       ═══●═════════   │
│      5 hours         100           │
│                                     │
└─────────────────────────────────────┘
```

**Result Panel (New Design):**
```
┌──────────────────────────────────────────┐
│  ┌────────────────────────────────────┐  │
│  │  ✦                              ✦  │  │
│  │           🍷                       │  │
│  │                                    │  │
│  │          24                        │  │ ← Massive DM Mono
│  │    bottles of wine                 │  │
│  │                                    │  │
│  │   ───────────────────────         │  │
│  │                                    │  │
│  │   120 servings  •  1.2 per guest  │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Get Your Complete Party Guide  →  │  │ ← Forest green CTA
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

**Drink Selection Buttons (Redesigned):**
- Rounded rectangles with subtle inner shadow
- Selected state: gold border + champagne fill + scale(1.02)
- Hover: subtle lift with shadow
- Checkbox replaced with small gold dot indicator

### 2. Answer Hero (Calculator Result Pages)

**Current:** Standard card with gradient
**New:** Dramatic, full-width celebration moment

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│    ┌──────────────────────────────────────────────────┐     │
│    │                                                  │     │
│    │                      🍷                          │     │
│    │                                                  │     │
│    │                     24                           │     │ ← 8xl+ with subtle glow
│    │              bottles of wine                     │     │
│    │                                                  │     │
│    │         for your 100-guest wedding              │     │
│    │                                                  │     │
│    │  ┌─────────┐  ┌─────────┐  ┌─────────┐         │     │
│    │  │   120   │  │   1.2   │  │    5    │         │     │
│    │  │servings │  │per guest│  │  hours  │         │     │
│    │  └─────────┘  └─────────┘  └─────────┘         │     │
│    │                                                  │     │
│    └──────────────────────────────────────────────────┘     │
│                                                              │
│    ✦ includes 15% buffer so you never run out               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Visual Details:**
- Subtle radial gradient emanating from the number
- Decorative corner flourishes
- Stats in pill-shaped cards with glass morphism
- Animated entrance (staggered fade + scale)

### 3. Shopping List Component

**Current:** Simple list with copy button
**New:** Premium checklist with visual hierarchy

```
┌─────────────────────────────────────────────────┐
│  YOUR SHOPPING LIST                    [Copy]   │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  ★ MAIN ITEM                              │ │
│  │                                           │ │
│  │  □  24 bottles of wine                    │ │
│  │     └─ Mix: 14 red, 10 white              │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  ESSENTIALS                               │ │
│  │                                           │ │
│  │  □  2 corkscrews                          │ │
│  │  □  50 wine glasses                       │ │
│  │  □  4 bags of ice                         │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Interaction:**
- Interactive checkboxes (local state)
- Crossed-out styling on check
- Celebratory micro-animation on all checked

### 4. Pro Tips Cards

**Current:** Basic amber circle + text
**New:** Editorial-style tip cards

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   "                                                 │  ← Large decorative quote mark
│                                                     │
│   At weddings, 70% of wine consumed                │
│   is white. Plan your mix accordingly.             │
│                                                     │
│   ─────────────────────────                        │
│   From a bartender with 30+ years experience       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5. Navigation & Header

**Current:** Simple logo + nav links
**New:** Refined, sticky header with personality

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  🥂 StockTheEvent         Calculators   About   [Get Guide]  │
│     ─────────────                                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Details:**
- Logo with small underline flourish
- Smooth scroll-triggered background blur
- CTA button with gold border on hover

### 6. Email Capture

**Current:** Green gradient box
**New:** Elegant, high-converting design

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     ✦  NEVER RUN OUT AGAIN  ✦                                  │
│                                                                 │
│     Get your personalized shopping list plus                   │
│     expert tips for hosting memorable events.                  │
│                                                                 │
│     ┌─────────────────────────────┐  ┌───────────────────┐    │
│     │ you@email.com               │  │  Get My Guide →   │    │
│     └─────────────────────────────┘  └───────────────────┘    │
│                                                                 │
│     Join 10,000+ party planners • Unsubscribe anytime          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Motion & Animation

### Principles
1. **Purposeful**: Every animation has meaning
2. **Quick**: Never delay the user (max 300ms for UI)
3. **Delightful**: Celebrate wins (result reveals, completions)
4. **Subtle**: Background motion is very slow/gentle

### Animation Library

```css
/* Entrance animations */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes reveal-number {
  0% { opacity: 0; transform: scale(0.8) rotateX(-20deg); }
  60% { transform: scale(1.05) rotateX(5deg); }
  100% { opacity: 1; transform: scale(1) rotateX(0); }
}

/* Micro-interactions */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(246, 173, 85, 0.4); }
  50% { box-shadow: 0 0 20px 4px rgba(246, 173, 85, 0.2); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

/* Background motion */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}
```

### Key Moments

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Page load | Staggered fade-up | 600ms total |
| Slider change | Number pulse | 200ms |
| Drink selection | Scale bounce + checkmark | 250ms |
| Result update | Number reveal + glow | 400ms |
| CTA hover | Lift + shadow | 150ms |
| Copy success | Checkmark + confetti | 500ms |

---

## Responsive Behavior

### Breakpoints

```css
--bp-sm: 640px;   /* Mobile landscape */
--bp-md: 768px;   /* Tablet */
--bp-lg: 1024px;  /* Desktop */
--bp-xl: 1280px;  /* Large desktop */
```

### Mobile Adaptations

**Calculator (Mobile):**
- Stack input → result vertically
- Full-width drink selection (2x2 grid)
- Sticky result summary at bottom of viewport
- Simplified slider with tap targets

**Result Cards:**
- Reduce number size (6xl instead of 8xl)
- Stack stats vertically on very small screens
- Maintain touch targets (min 44px)

---

## Accessibility

### Requirements
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Focus states: Visible, gold-colored ring
- Motion: Respect `prefers-reduced-motion`
- Screen readers: Proper ARIA labels on interactive elements

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Priorities

### Phase 1: Foundation (High Impact)
1. **Typography system** - New fonts, fluid scale
2. **Color system** - New palette with CSS variables
3. **Background textures** - Noise, gradients, blobs
4. **Button/card styling** - Glass morphism, new shadows

### Phase 2: Calculator Redesign
1. **Homepage calculator** - Full visual overhaul
2. **Result display** - Dramatic reveal animation
3. **Drink selection** - New toggle design
4. **Sliders** - Custom styling with better UX

### Phase 3: Content Pages
1. **Answer hero** - Premium result display
2. **Shopping list** - Interactive redesign
3. **Pro tips** - Editorial card style
4. **Math breakdown** - Better typography

### Phase 4: Polish & Delight
1. **Micro-interactions** - Hover states, success animations
2. **Page transitions** - Smooth navigation
3. **Email capture** - High-converting design
4. **Navigation** - Sticky header refinement

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time on page | Baseline | +20% |
| Calculator completions | Baseline | +15% |
| Email capture rate | Baseline | +25% |
| Bounce rate | Baseline | -10% |
| User satisfaction (survey) | N/A | 4.5/5 |

---

## Technical Notes

### Font Loading
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### CSS Architecture
- Use Tailwind's `@layer` for custom utilities
- CSS variables for theming
- Component-scoped styles in Astro components
- Global styles only for true global concerns

### Performance Considerations
- Fonts: Use `font-display: swap`
- Images: Continue using emoji (lightweight)
- Animations: CSS-only where possible, GPU-accelerated
- Blur effects: Limit backdrop-filter usage on mobile

---

## Appendix: Visual References

### Mood Board Keywords
- Sunset cocktail hour
- Vintage cocktail menu typography
- Warm candlelight
- Champagne bubbles
- Elegant celebration
- Golden hour photography
- Art deco bar design
- Premium spirits packaging

### Similar Aesthetic Examples
- Premium wine/spirits brand websites
- High-end restaurant menus
- Luxury event planning portfolios
- Editorial food photography sites

---

*PRD Created: January 2026*
*Last Updated: January 2026*
*Version: 1.0*
