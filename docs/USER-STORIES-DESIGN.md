# StockTheEvent Design Enhancement - User Stories

Based on the PRD and mockup designs, these user stories define the implementation work for the "Golden Hour Soirée" design system.

---

## Epic 1: Design System Foundation

### US-1.1: Typography System Setup
**As a** developer
**I want to** implement the new typography system with Noto Serif, Space Grotesk/Manrope fonts
**So that** all text across the site has consistent, premium styling

**Acceptance Criteria:**
- [ ] Add Google Fonts: Noto Serif (display, 400/700/italic), Space Grotesk (mono, 300/700), Manrope (body, 400/500/600)
- [ ] Define CSS custom properties for font families (`--font-display`, `--font-mono-luxe`, `--font-body`)
- [ ] Implement fluid type scale using `clamp()` for responsive sizing
- [ ] Update Tailwind config with new font family definitions
- [ ] Create utility classes: `.font-display`, `.font-mono-luxe`, `.font-body`
- [ ] Ensure proper font-display: swap for performance

**Reference:** Mockup 1 header typography, result numbers in Space Grotesk

---

### US-1.2: Color Palette Implementation
**As a** developer
**I want to** implement the new warm color palette
**So that** the site has the "Golden Hour" aesthetic throughout

**Acceptance Criteria:**
- [ ] Define CSS variables for primary colors:
  - `--primary: #dfb22a` (golden)
  - `--champagne: #f5e9ce`
  - `--chocolate: #5a3f2a`
  - `--forest: #228b22`
  - `--wine: #8B0000`
  - `--cream-paper: #fbfaf9`
  - `--background-light: #fdf7e7`
- [ ] Update Tailwind extend colors configuration
- [ ] Replace all existing amber/slate colors with new palette
- [ ] Ensure WCAG AA contrast ratios for text on backgrounds
- [ ] Test color palette in both light context

**Reference:** Both mockups color schemes

---

### US-1.3: Background Textures & Atmosphere
**As a** user
**I want to** see subtle visual textures and organic shapes
**So that** the interface feels warm and premium, not flat/sterile

**Acceptance Criteria:**
- [ ] Implement noise texture overlay (SVG-based, 0.03 opacity)
- [ ] Add organic blob shapes with blur effect (`filter: blur(60px)`)
- [ ] Create `.sparkle-bg` pattern for subtle sparkle effect
- [ ] Position background elements using fixed positioning
- [ ] Ensure backgrounds don't interfere with content (`pointer-events-none`)
- [ ] Test performance on mobile devices

**Reference:** Mockup 1 shows organic blobs (top-right orange, bottom-left cream)

---

### US-1.4: Glass Morphism Card Component
**As a** user
**I want to** see elegant glass-effect cards
**So that** interactive elements feel modern and premium

**Acceptance Criteria:**
- [ ] Create `.glass-card` CSS class with:
  - `background: rgba(255, 255, 255, 0.4)`
  - `backdrop-filter: blur(12px)`
  - `-webkit-backdrop-filter: blur(12px)` for Safari
  - `border: 1px solid rgba(223, 178, 42, 0.3)`
- [ ] Add vendor prefixes for cross-browser support
- [ ] Test on Safari, Chrome, Firefox
- [ ] Ensure fallback for browsers without backdrop-filter support
- [ ] Create selected/hover states with border color change

**Reference:** Mockup 1 drink selection cards

---

### US-1.5: Sunset Gradient Component
**As a** user
**I want to** see a vibrant sunset gradient on result displays
**So that** calculation results feel celebratory and eye-catching

**Acceptance Criteria:**
- [ ] Create `.sunset-gradient` class:
  ```css
  background: linear-gradient(135deg, #ff8c42 0%, #f05a28 50%, #dfb22a 100%);
  box-shadow: 0 10px 30px -5px rgba(240, 90, 40, 0.4),
              inset 0 0 15px rgba(255, 255, 255, 0.3);
  ```
- [ ] Add corner flourish decorations (thin white borders)
- [ ] Ensure text remains readable with drop shadows
- [ ] Add subtle inner glow effect

**Reference:** Mockup 1 "YOU WILL NEED APPROX." result card

---

## Epic 2: Calculator Screen Redesign

### US-2.1: Header with Brand Accent
**As a** user
**I want to** see a refined header with the StockTheEvent branding
**So that** I immediately recognize the brand identity

**Acceptance Criteria:**
- [ ] Display "StockTheEvent" in Noto Serif bold, chocolate color
- [ ] Add golden underline accent (12px wide, 2px tall, rounded)
- [ ] Include hamburger menu icon on left
- [ ] Include profile button (golden background circle) on right
- [ ] Implement sticky behavior with backdrop blur on scroll
- [ ] Center branding with flex layout

**Reference:** Mockup 1 header design

---

### US-2.2: Drink Category Selection Grid
**As a** user
**I want to** select drink categories using visually appealing cards
**So that** choosing drinks feels engaging and intuitive

**Acceptance Criteria:**
- [ ] Display 2x2 grid of drink categories (Wine, Beer, Spirits, Cocktails)
- [ ] Each card uses glass morphism styling
- [ ] Include background image with low opacity (0.2) and hover zoom effect
- [ ] Show material icon for each category (wine_bar, sports_bar, liquor, local_bar)
- [ ] Selected state: golden border highlight
- [ ] Unselected state: transparent border, muted icon
- [ ] Implement multi-select functionality
- [ ] Cards are square aspect ratio

**Reference:** Mockup 1 "What are you serving?" section

---

### US-2.3: Custom Styled Sliders
**As a** user
**I want to** adjust guests and duration with beautiful custom sliders
**So that** the interaction feels premium and responsive

**Acceptance Criteria:**
- [ ] Custom slider track: `h-2 rounded-full bg-chocolate/10`
- [ ] Active portion: golden fill from left
- [ ] Custom thumb:
  - 24px white circle
  - 2px golden border
  - Drop shadow
  - Inner golden dot (8px)
- [ ] Display current value prominently (Space Grotesk bold)
- [ ] "Number of Guests" shows integer (e.g., "120")
- [ ] "Event Duration" shows decimal with "HRS" label (e.g., "4.5 HRS")
- [ ] Smooth transitions on value change
- [ ] Border separator between sliders

**Reference:** Mockup 1 slider designs

---

### US-2.4: Result Display Card
**As a** user
**I want to** see my calculation result in a dramatic, celebratory display
**So that** the answer feels impactful and memorable

**Acceptance Criteria:**
- [ ] Full-width card with sunset gradient
- [ ] Corner flourish decorations (top-left, bottom-right)
- [ ] Header: "YOU WILL NEED APPROX." - uppercase, tracked wide, 80% opacity
- [ ] Main number: 7xl font, Space Grotesk bold, white with text glow:
  `drop-shadow: 0 0 15px rgba(255,255,255,0.6)`
- [ ] Unit label: "Bottles" in Noto Serif italic
- [ ] Subtext with info icon: "CALCULATED FOR [selection] MIX"
- [ ] Animate number on value change (scale pop)

**Reference:** Mockup 1 "42 Bottles" result card

---

### US-2.5: Primary CTA Button
**As a** user
**I want to** see a prominent call-to-action button
**So that** I know how to proceed to detailed results

**Acceptance Criteria:**
- [ ] Full-width button below result card
- [ ] Forest green background (`#228b22`)
- [ ] White text, bold, 18px
- [ ] Arrow icon on right (Material Symbols: arrow_forward)
- [ ] Rounded corners (xl/12px)
- [ ] Box shadow with green tint
- [ ] Active state: scale(0.95) transition
- [ ] Text: "Get Full Breakdown"

**Reference:** Mockup 1 green CTA button

---

### US-2.6: Bottom Navigation Bar
**As a** user
**I want to** navigate between app sections
**So that** I can access different features easily

**Acceptance Criteria:**
- [ ] Fixed bottom position
- [ ] Glass morphism background with backdrop blur
- [ ] Four navigation items: Calc, Store, Events, Setup
- [ ] Material icons for each item
- [ ] Active state: golden color, filled icon
- [ ] Inactive state: chocolate/40 opacity
- [ ] Labels: 10px uppercase bold
- [ ] Top border with primary/10 opacity

**Reference:** Mockup 1 bottom navigation

---

## Epic 3: Shopping List & Tips Screen

### US-3.1: Page Header with Alternate Branding
**As a** user
**I want to** see contextual branding on secondary pages
**So that** I know I'm still within the StockTheEvent experience

**Acceptance Criteria:**
- [ ] Display "GOLDEN HOUR" as page title (or contextual title)
- [ ] Uppercase, tracked wide (0.1em)
- [ ] Sticky header with backdrop blur
- [ ] Menu icon left, share icon right
- [ ] Bottom border with primary/10 opacity

**Reference:** Mockup 2 header

---

### US-3.2: Hero Image Section
**As a** user
**I want to** see an atmospheric hero image
**So that** the page feels editorial and inspiring

**Acceptance Criteria:**
- [ ] Full-width image container with rounded corners (xl)
- [ ] Height: 192px (h-48)
- [ ] Dark overlay (bg-black/20) for text readability
- [ ] Italic caption at bottom: "Setting the Scene"
- [ ] Border with primary/20 opacity
- [ ] Box shadow for depth

**Reference:** Mockup 2 champagne glasses hero image

---

### US-3.3: Shopping List with Paper Texture
**As a** user
**I want to** see my shopping list on a paper-textured card
**So that** it feels like a tangible, curated list

**Acceptance Criteria:**
- [ ] Card with `.paper-texture` background (cream with subtle noise)
- [ ] Inner decorative border (2px inset, primary/10)
- [ ] Centered title: "The Essentials" - Noto Serif 26px bold
- [ ] Golden underline accent (12px wide)
- [ ] Border: primary/30 with rounded-xl corners
- [ ] Shadow for elevation

**Reference:** Mockup 2 "The Essentials" card

---

### US-3.4: Interactive Checkbox List Items
**As a** user
**I want to** check off items on my shopping list
**So that** I can track my preparation progress

**Acceptance Criteria:**
- [ ] Circular checkboxes (24px, `rounded-full`)
- [ ] Unchecked: 2px border primary/40, transparent fill
- [ ] Checked: primary/10 fill, solid primary border, golden checkmark
- [ ] Item labels: 16px medium weight
- [ ] Hover state: text changes to primary color
- [ ] Separator lines between items (primary/5)
- [ ] Smooth transition on check state change
- [ ] Local state persistence (no backend required)

**Reference:** Mockup 2 checklist items

---

### US-3.5: Add Item CTA
**As a** user
**I want to** add custom items to my list
**So that** I can personalize my shopping list

**Acceptance Criteria:**
- [ ] Full-width button within list card
- [ ] Golden background (primary color)
- [ ] White text, bold, uppercase tracking
- [ ] Text: "ADD ITEM"
- [ ] Rounded-lg corners
- [ ] Shadow for depth
- [ ] Hover: primary/90 opacity

**Reference:** Mockup 2 "ADD ITEM" button

---

### US-3.6: Editorial Pro Tips Section
**As a** user
**I want to** see expert tips in an editorial magazine style
**So that** I feel like I'm getting premium, curated advice

**Acceptance Criteria:**
- [ ] Section header: "The Host's Secret" - Noto Serif 22px bold
- [ ] Subheader: "EDITORIAL CURATION" - primary color, 12px uppercase, wide tracking
- [ ] Gap between section header and cards

**Reference:** Mockup 2 "The Host's Secret" header

---

### US-3.7: Pro Tip Cards with Quote Styling
**As a** user
**I want to** read tips in elegant quote-styled cards
**So that** the advice feels authoritative and memorable

**Acceptance Criteria:**
- [ ] White card with rounded-xl corners and subtle shadow
- [ ] Left border accent: 4px solid (wine or primary color, alternating)
- [ ] Large decorative quote mark (5rem Noto Serif, 0.2 opacity)
- [ ] Category label: uppercase, tracked wide, bold, 12px (e.g., "ATMOSPHERE")
- [ ] Quote text: Noto Serif 20px, relaxed line height
- [ ] Attribution line with golden dash and "PRO TIP #N" label
- [ ] Adequate padding (32px)

**Reference:** Mockup 2 tip cards

---

### US-3.8: Secondary Bottom Navigation
**As a** user
**I want to** navigate with a context-appropriate bottom nav
**So that** I can move between Home, Events, List, and Profile

**Acceptance Criteria:**
- [ ] Fixed bottom, full-width
- [ ] Glass morphism background (white/90 with blur)
- [ ] Four items: Home, Events, List, Profile
- [ ] Active state: wine color for "List", primary for others
- [ ] Filled icon for active state (`font-variation-settings: 'FILL' 1`)
- [ ] Material icons: home, calendar_today, shopping_bag, person
- [ ] Top border with primary/10

**Reference:** Mockup 2 bottom navigation

---

## Epic 4: Animation & Micro-interactions

### US-4.1: Page Load Animations
**As a** user
**I want to** see smooth entrance animations when the page loads
**So that** the experience feels polished and intentional

**Acceptance Criteria:**
- [ ] Implement staggered fade-up animation for main sections
- [ ] Cards animate in sequence with 100ms delays
- [ ] Animation duration: 500ms ease-out
- [ ] Use `animation-fill-mode: forwards` to maintain end state
- [ ] Respect `prefers-reduced-motion` media query

---

### US-4.2: Result Number Animation
**As a** user
**I want to** see the result number animate when it changes
**So that** updates feel responsive and engaging

**Acceptance Criteria:**
- [ ] Implement scale pop animation on number change:
  ```css
  @keyframes resultPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  ```
- [ ] Duration: 300ms ease-out
- [ ] Optional: Add subtle glow pulse effect
- [ ] Trigger on slider value change

---

### US-4.3: Slider Interaction Feedback
**As a** user
**I want to** feel tactile feedback when using sliders
**So that** the interaction feels responsive

**Acceptance Criteria:**
- [ ] Thumb scales up on hover (1.1x)
- [ ] Smooth transition (200ms)
- [ ] Active/dragging state maintains scale
- [ ] Value display updates in real-time
- [ ] Consider adding haptic feedback trigger for mobile

---

### US-4.4: Card Hover Effects
**As a** user
**I want to** see subtle hover feedback on interactive cards
**So that** I know elements are clickable

**Acceptance Criteria:**
- [ ] Drink cards: background image zooms (1.1x over 700ms)
- [ ] List items: text color shifts to primary
- [ ] General cards: slight shadow increase
- [ ] All transitions: 150-300ms easing

---

### US-4.5: Checkbox Animation
**As a** user
**I want to** see a satisfying animation when checking items
**So that** completing tasks feels rewarding

**Acceptance Criteria:**
- [ ] Checkmark draws in with SVG animation
- [ ] Background fill fades in smoothly
- [ ] Optional: subtle scale bounce on check
- [ ] Item text could get strikethrough with fade

---

## Epic 5: Responsive & Accessibility

### US-5.1: Mobile-First Responsive Layout
**As a** user on any device
**I want to** have an optimized experience
**So that** the app works well on mobile, tablet, and desktop

**Acceptance Criteria:**
- [ ] Calculator: single column on mobile, side-by-side on tablet+
- [ ] Bottom nav: visible on mobile, consider side nav on desktop
- [ ] Touch targets minimum 44px
- [ ] Appropriate spacing scales with viewport
- [ ] Test on 320px, 375px, 768px, 1024px, 1440px widths

---

### US-5.2: Accessibility Compliance
**As a** user with accessibility needs
**I want to** navigate and use the app with assistive technology
**So that** I can plan my events independently

**Acceptance Criteria:**
- [ ] All interactive elements have visible focus states (golden ring)
- [ ] Form inputs have associated labels
- [ ] ARIA labels on icon-only buttons
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Reduced motion mode disables/minimizes animations
- [ ] Screen reader announces slider values
- [ ] Skip navigation link for keyboard users

---

### US-5.3: Reduced Motion Support
**As a** user with motion sensitivity
**I want to** use the app without distracting animations
**So that** I can focus on planning without discomfort

**Acceptance Criteria:**
- [ ] Implement `@media (prefers-reduced-motion: reduce)` query
- [ ] Set animation-duration to 0.01ms
- [ ] Set transition-duration to 0.01ms
- [ ] Maintain functionality without motion
- [ ] Test with system setting enabled

---

## Epic 6: Component Migration

### US-6.1: Update BaseLayout Component
**As a** developer
**I want to** update the BaseLayout with new design system
**So that** all pages inherit the new styling

**Acceptance Criteria:**
- [ ] Add new Google Fonts links
- [ ] Update global CSS imports
- [ ] Add background texture and blob elements
- [ ] Update meta theme-color to new primary
- [ ] Ensure dark mode variables are set (if supporting)

---

### US-6.2: Migrate InteractiveCalculator Component
**As a** developer
**I want to** rebuild the calculator with new design
**So that** the homepage showcases the new aesthetic

**Acceptance Criteria:**
- [ ] Replace drink selection buttons with glass cards
- [ ] Implement new slider styling
- [ ] Create sunset gradient result display
- [ ] Update CTA button to forest green
- [ ] Preserve all calculation logic
- [ ] Test all interaction states

---

### US-6.3: Create ShoppingList Component
**As a** developer
**I want to** build the new shopping list component
**So that** result pages have the premium list experience

**Acceptance Criteria:**
- [ ] Paper texture card container
- [ ] Circular checkbox implementation
- [ ] Interactive check state with local storage
- [ ] Add item functionality (optional)
- [ ] Copy to clipboard maintains functionality

---

### US-6.4: Create ProTips Component
**As a** developer
**I want to** build the editorial pro tips cards
**So that** expert advice is displayed beautifully

**Acceptance Criteria:**
- [ ] Quote card with decorative elements
- [ ] Alternating border colors (wine/primary)
- [ ] Section header with subheading
- [ ] Dynamic content from existing tip data
- [ ] Responsive spacing

---

### US-6.5: Create BottomNavigation Component
**As a** developer
**I want to** build a reusable bottom navigation
**So that** mobile users can navigate between sections

**Acceptance Criteria:**
- [ ] Fixed positioning with z-index
- [ ] Glass morphism background
- [ ] Props for active state
- [ ] Navigation items configurable
- [ ] Handles page transitions

---

## Story Point Estimates

| Epic | Story | Points | Priority |
|------|-------|--------|----------|
| 1 | US-1.1 Typography | 3 | P0 |
| 1 | US-1.2 Colors | 2 | P0 |
| 1 | US-1.3 Backgrounds | 3 | P1 |
| 1 | US-1.4 Glass Cards | 2 | P0 |
| 1 | US-1.5 Sunset Gradient | 2 | P0 |
| 2 | US-2.1 Header | 2 | P0 |
| 2 | US-2.2 Drink Grid | 5 | P0 |
| 2 | US-2.3 Sliders | 5 | P0 |
| 2 | US-2.4 Result Card | 3 | P0 |
| 2 | US-2.5 CTA Button | 1 | P0 |
| 2 | US-2.6 Bottom Nav | 3 | P1 |
| 3 | US-3.1 Alt Header | 2 | P1 |
| 3 | US-3.2 Hero Image | 2 | P1 |
| 3 | US-3.3 Paper Card | 3 | P1 |
| 3 | US-3.4 Checkboxes | 3 | P1 |
| 3 | US-3.5 Add Item CTA | 1 | P2 |
| 3 | US-3.6 Tips Header | 1 | P1 |
| 3 | US-3.7 Tip Cards | 3 | P1 |
| 3 | US-3.8 Secondary Nav | 2 | P2 |
| 4 | US-4.1 Page Load | 3 | P1 |
| 4 | US-4.2 Number Anim | 2 | P1 |
| 4 | US-4.3 Slider Feedback | 2 | P1 |
| 4 | US-4.4 Card Hover | 2 | P2 |
| 4 | US-4.5 Checkbox Anim | 2 | P2 |
| 5 | US-5.1 Responsive | 5 | P0 |
| 5 | US-5.2 Accessibility | 5 | P0 |
| 5 | US-5.3 Reduced Motion | 2 | P1 |
| 6 | US-6.1 BaseLayout | 3 | P0 |
| 6 | US-6.2 Calculator | 8 | P0 |
| 6 | US-6.3 ShoppingList | 5 | P1 |
| 6 | US-6.4 ProTips | 3 | P1 |
| 6 | US-6.5 BottomNav | 3 | P1 |

**Total: ~93 Story Points**

---

## Implementation Order

### Phase 1: Foundation (P0) - ~35 points
1. US-1.1 Typography System
2. US-1.2 Color Palette
3. US-1.4 Glass Card Component
4. US-1.5 Sunset Gradient
5. US-6.1 BaseLayout Update
6. US-5.1 Responsive Foundation
7. US-5.2 Accessibility Foundation

### Phase 2: Calculator Redesign (P0) - ~24 points
1. US-2.1 Header
2. US-2.2 Drink Selection Grid
3. US-2.3 Custom Sliders
4. US-2.4 Result Display
5. US-2.5 CTA Button
6. US-6.2 Calculator Migration

### Phase 3: Secondary Pages (P1) - ~27 points
1. US-1.3 Background Textures
2. US-2.6 Bottom Navigation
3. US-3.1-3.4, 3.6-3.7 Shopping & Tips
4. US-4.1-4.3 Core Animations
5. US-5.3 Reduced Motion
6. US-6.3-6.5 Component Builds

### Phase 4: Polish (P2) - ~7 points
1. US-3.5 Add Item Feature
2. US-3.8 Secondary Nav
3. US-4.4-4.5 Enhanced Animations

---

*Document Version: 1.0*
*Created: January 2026*
*Based on: PRD-DESIGN-ENHANCEMENTS.md and mockup designs*
