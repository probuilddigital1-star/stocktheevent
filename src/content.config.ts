import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const calculators = defineCollection({
  loader: glob({ pattern: '**/[!_]*.json', base: './src/content/calculators' }),
  schema: z.object({
    slug: z.string(),
    item: z.object({
      id: z.string(),
      name: z.string(),
      namePlural: z.string(),
      emoji: z.string(),
      unit: z.string(),
      unitSingular: z.string(),
      servingsPerUnit: z.number(),
      category: z.string(),
      subcategory: z.string(),
    }),
    event: z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      description: z.string(),
      defaultDuration: z.number(),
      modifiers: z.record(z.number()),
      proTips: z.array(z.string()),
      buyingGuide: z.string(),
    }),
    guestCount: z.object({
      value: z.number(),
      label: z.string(),
      tier: z.string(),
    }),
    calculation: z.object({
      totalServings: z.number(),
      unitsNeeded: z.number(),
      unitsDisplay: z.string(),
      perPersonServings: z.number(),
      buffer: z.number(),
      rawUnits: z.number(),
      actualDrinkers: z.number(),
    }),
    meta: z.object({
      title: z.string(),
      description: z.string(),
      h1: z.string(),
      canonicalUrl: z.string(),
    }),
    mathExplanation: z.array(z.object({
      step: z.number(),
      label: z.string(),
      formula: z.string(),
      result: z.string(),
      explanation: z.string(),
    })),
    shoppingList: z.array(z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
      affiliateCategory: z.string().optional(),
      notes: z.string().optional(),
    })),
    relatedPages: z.array(z.object({
      slug: z.string(),
      title: z.string(),
      relationship: z.string(),
    })),
  }),
});

export const collections = { calculators };
