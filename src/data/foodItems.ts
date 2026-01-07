import type { Item } from '../lib/types';

// Food item interface extension
export interface FoodItem extends Item {
  servingsPerPerson: number;      // How many servings per person (as main dish)
  servingsPerPersonSide: number;  // How many servings per person (as side/appetizer)
  unitsPerServing: number;        // How many pieces/oz per serving
  unitType: 'count' | 'weight';   // Whether measured by count or weight
  orderUnit: string;              // What you order (pizzas, lbs, dozen)
  orderUnitSingular: string;      // Singular order unit
  servingsPerOrderUnit: number;   // Servings per order unit
}

export const foodItems: FoodItem[] = [
  {
    id: 'pizza',
    name: 'Pizza',
    namePlural: 'Pizzas',
    emoji: '🍕',
    unit: 'pizzas',
    unitSingular: 'pizza',
    servingsPerUnit: 8,           // 8 slices per pizza
    category: 'food',
    subcategory: 'main',
    servingsPerPerson: 3,         // 3 slices per person as main
    servingsPerPersonSide: 2,     // 2 slices per person as side
    unitsPerServing: 1,           // 1 slice = 1 serving
    unitType: 'count',
    orderUnit: 'pizzas',
    orderUnitSingular: 'pizza',
    servingsPerOrderUnit: 8,      // 8 slices per pizza
  },
  {
    id: 'wings',
    name: 'Wings',
    namePlural: 'Wings',
    emoji: '🍗',
    unit: 'lbs',
    unitSingular: 'lb',
    servingsPerUnit: 10,          // ~10 wing pieces per lb (party wings)
    category: 'food',
    subcategory: 'appetizer',
    servingsPerPerson: 10,        // 10 wing pieces per person as main
    servingsPerPersonSide: 6,     // 6 wing pieces per person as appetizer
    unitsPerServing: 1,           // 1 wing piece = 1 serving
    unitType: 'weight',
    orderUnit: 'lbs',
    orderUnitSingular: 'lb',
    servingsPerOrderUnit: 10,     // ~10 wing pieces per lb (party wings)
  },
  {
    id: 'tacos',
    name: 'Tacos',
    namePlural: 'Tacos',
    emoji: '🌮',
    unit: 'tacos',
    unitSingular: 'taco',
    servingsPerUnit: 1,           // 1 taco = 1 serving
    category: 'food',
    subcategory: 'main',
    servingsPerPerson: 3,         // 3 tacos per person as main
    servingsPerPersonSide: 2,     // 2 tacos per person as side
    unitsPerServing: 1,           // 1 taco = 1 serving
    unitType: 'count',
    orderUnit: 'dozen',
    orderUnitSingular: 'dozen',
    servingsPerOrderUnit: 12,     // 12 tacos per dozen
  },
  {
    id: 'sliders',
    name: 'Sliders',
    namePlural: 'Sliders',
    emoji: '🍔',
    unit: 'sliders',
    unitSingular: 'slider',
    servingsPerUnit: 1,           // 1 slider = 1 serving
    category: 'food',
    subcategory: 'main',
    servingsPerPerson: 3,         // 3 sliders per person as main
    servingsPerPersonSide: 2,     // 2 sliders per person as side
    unitsPerServing: 1,           // 1 slider = 1 serving
    unitType: 'count',
    orderUnit: 'dozen',
    orderUnitSingular: 'dozen',
    servingsPerOrderUnit: 12,     // 12 sliders per dozen
  },
  {
    id: 'appetizers',
    name: 'Appetizers',
    namePlural: 'Appetizers',
    emoji: '🍢',
    unit: 'pieces',
    unitSingular: 'piece',
    servingsPerUnit: 1,           // 1 piece = 1 serving
    category: 'food',
    subcategory: 'appetizer',
    servingsPerPerson: 8,         // 8 pieces per person for cocktail hour
    servingsPerPersonSide: 6,     // 6 pieces per person as side
    unitsPerServing: 1,           // 1 piece = 1 serving
    unitType: 'count',
    orderUnit: 'platters',
    orderUnitSingular: 'platter',
    servingsPerOrderUnit: 30,     // ~30 pieces per platter
  },
  {
    id: 'bbq',
    name: 'BBQ/Pulled Pork',
    namePlural: 'BBQ/Pulled Pork',
    emoji: '🍖',
    unit: 'lbs',
    unitSingular: 'lb',
    servingsPerUnit: 3,           // 3 servings per lb (5-6oz each)
    category: 'food',
    subcategory: 'main',
    servingsPerPerson: 1,         // 1 serving (6oz) per person as main
    servingsPerPersonSide: 0.5,   // Half serving (3oz) as side
    unitsPerServing: 6,           // 6oz per serving
    unitType: 'weight',
    orderUnit: 'lbs',
    orderUnitSingular: 'lb',
    servingsPerOrderUnit: 3,      // ~3 servings per lb (accounts for shrinkage)
  },
];

export const getFoodItemById = (id: string): FoodItem | undefined => {
  return foodItems.find(item => item.id === id);
};
