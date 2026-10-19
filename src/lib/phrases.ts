/**
 * phrases.ts - small wording helpers whose answers live on the data.
 *
 * Event and food names go into sentences ("How Many Wings Do You Need for
 * Thanksgiving?"), and not every one takes the same words. The article lives on
 * the event (EventType.article, SeasonalEvent.article) and the quantity word on
 * the food (FoodItem.quantityWord), so templates and generators never string
 * check a name.
 */

/** "a wedding", "an Easter Brunch", or just "Thanksgiving" when the event takes no article. */
export function withArticle(owner: { article?: string }, text: string): string {
  const article = owner.article ?? 'a';
  return article === '' ? text : `${article} ${text}`;
}

/** "How Many" for foods you count (wings), "How Much" for the rest (pizza, any drink). */
export function howQuantity(food?: { quantityWord: 'much' | 'many' }): 'How Much' | 'How Many' {
  return food?.quantityWord === 'many' ? 'How Many' : 'How Much';
}
