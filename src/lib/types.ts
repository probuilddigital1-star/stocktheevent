// Core TypeScript interfaces for StockTheEvent

export interface Item {
  id: string;
  name: string;
  namePlural: string;
  emoji: string;
  unit: string;
  unitSingular: string;
  servingsPerUnit: number;
  category: 'beverage' | 'food';
  subcategory?: 'alcohol' | 'non-alcohol' | 'appetizer' | 'main';
}

export interface EventType {
  id: string;
  name: string;
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

export interface CalculationResult {
  totalServings: number;
  unitsNeeded: number;
  unitsDisplay: string;
  perPersonServings: number;
  buffer: number;
  rawUnits: number;
  actualDrinkers: number;
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
  canonicalUrl: string;
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
