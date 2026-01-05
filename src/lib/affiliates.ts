const AMAZON_TAG = 'probuild20-20';

export const affiliateLinks: Record<string, string> = {
  'corkscrew': `https://www.amazon.com/s?k=wine+corkscrew&tag=${AMAZON_TAG}`,
  'wine-glasses': `https://www.amazon.com/s?k=wine+glasses+party&tag=${AMAZON_TAG}`,
  'beer-glasses': `https://www.amazon.com/s?k=beer+glasses+pint&tag=${AMAZON_TAG}`,
  'champagne-flutes': `https://www.amazon.com/s?k=champagne+flutes&tag=${AMAZON_TAG}`,
  'shot-glasses': `https://www.amazon.com/s?k=shot+glasses+party&tag=${AMAZON_TAG}`,
  'ice-bucket': `https://www.amazon.com/s?k=ice+bucket+party&tag=${AMAZON_TAG}`,
  'cooler': `https://www.amazon.com/s?k=beverage+cooler+party&tag=${AMAZON_TAG}`,
  'bottle-opener': `https://www.amazon.com/s?k=bottle+opener&tag=${AMAZON_TAG}`,
  'cocktail-shaker': `https://www.amazon.com/s?k=cocktail+shaker+set&tag=${AMAZON_TAG}`,
  'party-cups': `https://www.amazon.com/s?k=party+cups+plastic&tag=${AMAZON_TAG}`,
  'napkins': `https://www.amazon.com/s?k=cocktail+napkins&tag=${AMAZON_TAG}`,
  'bar-tools': `https://www.amazon.com/s?k=bartender+kit&tag=${AMAZON_TAG}`,
};

export function getAffiliateLink(itemName: string): string | null {
  const normalized = itemName.toLowerCase();

  if (normalized.includes('corkscrew') || normalized.includes('opener')) {
    return affiliateLinks['corkscrew'];
  }
  if (normalized.includes('wine') && normalized.includes('glass')) {
    return affiliateLinks['wine-glasses'];
  }
  if (normalized.includes('beer') && (normalized.includes('glass') || normalized.includes('mug'))) {
    return affiliateLinks['beer-glasses'];
  }
  if (normalized.includes('champagne') && normalized.includes('flute')) {
    return affiliateLinks['champagne-flutes'];
  }
  if (normalized.includes('shot')) {
    return affiliateLinks['shot-glasses'];
  }
  if (normalized.includes('ice') && normalized.includes('bucket')) {
    return affiliateLinks['ice-bucket'];
  }
  if (normalized.includes('cooler')) {
    return affiliateLinks['cooler'];
  }
  if (normalized.includes('shaker') || (normalized.includes('cocktail') && !normalized.includes('napkin'))) {
    return affiliateLinks['cocktail-shaker'];
  }
  if (normalized.includes('cup') || normalized.includes('plastic')) {
    return affiliateLinks['party-cups'];
  }
  if (normalized.includes('napkin')) {
    return affiliateLinks['napkins'];
  }
  if (normalized.includes('bar') && normalized.includes('tool')) {
    return affiliateLinks['bar-tools'];
  }

  return null;
}
