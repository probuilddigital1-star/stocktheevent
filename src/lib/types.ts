// Core TypeScript interfaces for StockTheEvent

export interface Item {
  id: string;
  name: string;
  namePlural: string;
  /** Icon id rendered by src/components/Icon.astro. */
  icon: string;
  /** The standard pour this item's servings are counted in, e.g. "5 oz glass". Drinks only. */
  standardPour?: string;
  unit: string;
  unitSingular: string;
  servingsPerUnit: number;
  category: 'beverage' | 'food';
  subcategory?: 'alcohol' | 'non-alcohol' | 'appetizer' | 'main' | 'side';
}

// Extended food item with additional properties for food calculations
export interface FoodItem extends Item {
  servingsPerPerson: number;      // How many servings per person (as main dish)
  servingsPerPersonSide: number;  // How many servings per person (as side/appetizer)
  unitsPerServing: number;        // How many pieces/oz per serving
  unitType: 'count' | 'weight';   // Whether measured by count or weight
  orderUnit: string;              // What you order (pizzas, lbs, dozen)
  orderUnitSingular: string;      // Singular order unit
  servingsPerOrderUnit: number;   // Servings per order unit
}

export interface EventType {
  id: string;
  name: string;
  /** Plural form for generated copy, so we get "Thanksgiving dinners" rather than "Thanksgivings". */
  pluralName: string;
  /** Mid-sentence form. Proper nouns keep their capitals: "4th of July party", not "4th of july party". */
  lowerName: string;
  slug: string;
  description: string;
  defaultDuration: number;
  modifiers: Record<string, number>;
  proTips: string[];
  buyingGuide: string;
}

export interface GuestCount {
  value: number;
  label: string;
  tier: 'small' | 'medium' | 'large' | 'xlarge';
}

/** One resolved quantity: servings, the units to buy, and how it displays. */
export interface DrinkQuantity {
  totalServings: number;
  unitsNeeded: number;
  unitsDisplay: string;
  perPersonServings: number;
  buffer: number;
  rawUnits: number;
}

export interface CalculationResult {
  // Top-level fields carry the primary (full bar) answer, so existing consumers
  // pick it up without change.
  totalServings: number;
  unitsNeeded: number;
  unitsDisplay: string;
  perPersonServings: number;
  buffer: number;
  rawUnits: number;
  actualDrinkers: number;

  /** This drink's share of a full four-drink bar. The primary answer. */
  fullBar: DrinkQuantity;
  /** What you need if this drink is the only alcohol served. The secondary answer. */
  onlyDrink: DrinkQuantity;
  /** This drink's normalized share of the bar, 0 to 1. */
  barShare: number;
  /** Bottles for a one-flute-per-guest toast. Champagne pages only. */
  toastBottles?: number;
}

export interface MathStep {
  step: number;
  label: string;
  formula: string;
  result: string;
  explanation: string;
}

export interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  affiliateCategory?: string;
}

export interface RelatedPage {
  slug: string;
  title: string;
  relationship: 'same-item' | 'same-event' | 'same-guests' | 'adjacent-guests';
}

export interface PageMeta {
  title: string;
  description: string;
  h1: string;
}

export interface CalculatorPage {
  slug: string;
  item: Item;
  event: EventType;
  guestCount: GuestCount;
  calculation: CalculationResult;
  meta: PageMeta;
  mathExplanation: MathStep[];
  shoppingList: ShoppingItem[];
  relatedPages: RelatedPage[];
}

// =============================================================================
// FOOD-SPECIFIC TYPES
// =============================================================================

export interface FoodCalculationResult {
  totalServings: number;          // Total servings needed
  unitsNeeded: number;            // Units to order (pizzas, lbs, dozens)
  unitsDisplay: string;           // Display unit (plural/singular)
  perPersonServings: number;      // Servings per person
  buffer: number;                 // Buffer units added
  rawUnits: number;               // Units before buffer
  totalGuests: number;            // Total guests
  isMainDish: boolean;            // Whether calculating as main or side
}

export interface FoodCalculatorPage {
  slug: string;
  item: FoodItem;
  event: EventType;
  guestCount: GuestCount;
  calculation: FoodCalculationResult;
  meta: PageMeta;
  mathExplanation: MathStep[];
  shoppingList: ShoppingItem[];
  relatedPages: RelatedPage[];
  relatedDrinks: RelatedPage[];   // Cross-links to drink calculators
}

// =============================================================================
// SEASONAL LANDING PAGE TYPES
// =============================================================================

export interface AffiliateProduct {
  name: string;
  searchTerm: string;
}

export interface SeasonalEvent {
  slug: string;
  /** What this event is called in headings and CTAs. The base event drives math, not naming. */
  shortName: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subhead: string;
  eventType: string;              // Maps to event.id
  featuredDrinks: string[];       // Item IDs
  featuredFoods: string[];        // Food item IDs
  seasonalTips: string[];
  affiliateProducts: AffiliateProduct[];
  peakMonths: string[];
  year: number;
}
