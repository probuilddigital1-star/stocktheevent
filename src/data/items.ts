import type { Item } from '../lib/types';

export const items: Item[] = [
  {
    id: 'wine',
    name: 'Wine',
    namePlural: 'Wine',
    emoji: '🍷',
    unit: 'bottles',
    unitSingular: 'bottle',
    servingsPerUnit: 5, // 5 glasses per 750ml bottle (5oz pour)
    category: 'beverage',
    subcategory: 'alcohol',
  },
  {
    id: 'beer',
    name: 'Beer',
    namePlural: 'Beer',
    emoji: '🍺',
    unit: 'cases',
    unitSingular: 'case',
    servingsPerUnit: 24, // 24 cans per case
    category: 'beverage',
    subcategory: 'alcohol',
  },
  {
    id: 'champagne',
    name: 'Champagne',
    namePlural: 'Champagne',
    emoji: '🥂',
    unit: 'bottles',
    unitSingular: 'bottle',
    servingsPerUnit: 6, // 6 flutes per bottle (4oz pour)
    category: 'beverage',
    subcategory: 'alcohol',
  },
  {
    id: 'spirits',
    name: 'Spirits',
    namePlural: 'Spirits',
    emoji: '🥃',
    unit: 'bottles',
    unitSingular: 'bottle',
    servingsPerUnit: 17, // 17 drinks per 750ml (1.5oz shots)
    category: 'beverage',
    subcategory: 'alcohol',
  },
];

export const getItemById = (id: string): Item | undefined => {
  return items.find(item => item.id === id);
};
