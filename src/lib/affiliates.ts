const AMAZON_TAG = 'probuild20-20';

export const affiliateLinks: Record<string, string> = {
  // =============================================================================
  // DRINK ACCESSORIES
  // =============================================================================
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

  // =============================================================================
  // FOOD ACCESSORIES - COOKING & PREP
  // =============================================================================
  'air-fryer': `https://www.amazon.com/s?k=air+fryer+chicken+wings&tag=${AMAZON_TAG}`,
  'slow-cooker': `https://www.amazon.com/s?k=slow+cooker+party+dip&tag=${AMAZON_TAG}`,
  'warming-tray': `https://www.amazon.com/s?k=warming+tray+party&tag=${AMAZON_TAG}`,
  'chafing-dish': `https://www.amazon.com/s?k=chafing+dish+catering&tag=${AMAZON_TAG}`,
  'pizza-oven': `https://www.amazon.com/s?k=pizza+oven+outdoor&tag=${AMAZON_TAG}`,
  'smoker': `https://www.amazon.com/s?k=smoker+grill+bbq&tag=${AMAZON_TAG}`,
  'instant-pot': `https://www.amazon.com/s?k=instant+pot&tag=${AMAZON_TAG}`,

  // =============================================================================
  // FOOD ACCESSORIES - SERVING
  // =============================================================================
  'serving-platters': `https://www.amazon.com/s?k=serving+platters+party&tag=${AMAZON_TAG}`,
  'paper-plates': `https://www.amazon.com/s?k=paper+plates+heavy+duty&tag=${AMAZON_TAG}`,
  'disposable-utensils': `https://www.amazon.com/s?k=disposable+utensils+party&tag=${AMAZON_TAG}`,
  'food-trays': `https://www.amazon.com/s?k=food+trays+catering&tag=${AMAZON_TAG}`,
  'beverage-dispenser': `https://www.amazon.com/s?k=beverage+dispenser+party&tag=${AMAZON_TAG}`,
  'taco-holder': `https://www.amazon.com/s?k=taco+holder+stand&tag=${AMAZON_TAG}`,
  'pizza-cutter': `https://www.amazon.com/s?k=pizza+cutter&tag=${AMAZON_TAG}`,

  // =============================================================================
  // THEMED PARTY SUPPLIES
  // =============================================================================
  'football-party-supplies': `https://www.amazon.com/s?k=football+party+supplies&tag=${AMAZON_TAG}`,
  'super-bowl-decorations': `https://www.amazon.com/s?k=super+bowl+decorations&tag=${AMAZON_TAG}`,
  'team-plates': `https://www.amazon.com/s?k=football+party+plates&tag=${AMAZON_TAG}`,
  'basketball-party': `https://www.amazon.com/s?k=basketball+party+supplies&tag=${AMAZON_TAG}`,
  'graduation-party': `https://www.amazon.com/s?k=graduation+party+supplies&tag=${AMAZON_TAG}`,
  'july-4th-party': `https://www.amazon.com/s?k=4th+of+july+party+supplies&tag=${AMAZON_TAG}`,
  'halloween-party': `https://www.amazon.com/s?k=halloween+party+supplies&tag=${AMAZON_TAG}`,
  'christmas-party': `https://www.amazon.com/s?k=christmas+party+supplies&tag=${AMAZON_TAG}`,
  'nye-party': `https://www.amazon.com/s?k=new+years+eve+party+supplies&tag=${AMAZON_TAG}`,

  // =============================================================================
  // BBQ & OUTDOOR
  // =============================================================================
  'grill': `https://www.amazon.com/s?k=portable+grill+party&tag=${AMAZON_TAG}`,
  'grill-tools': `https://www.amazon.com/s?k=bbq+grill+tools+set&tag=${AMAZON_TAG}`,
  'meat-thermometer': `https://www.amazon.com/s?k=meat+thermometer+instant+read&tag=${AMAZON_TAG}`,
  'bbq-sauce': `https://www.amazon.com/s?k=bbq+sauce+variety+pack&tag=${AMAZON_TAG}`,
  'picnic-table': `https://www.amazon.com/s?k=picnic+table+folding&tag=${AMAZON_TAG}`,
  'outdoor-cooler': `https://www.amazon.com/s?k=large+cooler+wheels+party&tag=${AMAZON_TAG}`,
};

export function getAffiliateLink(itemName: string): string | null {
  const normalized = itemName.toLowerCase();

  // =============================================================================
  // DRINK ACCESSORIES
  // =============================================================================
  if (normalized.includes('corkscrew') || (normalized.includes('wine') && normalized.includes('opener'))) {
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
  if ((normalized.includes('cup') && normalized.includes('party')) || (normalized.includes('plastic') && normalized.includes('cup'))) {
    return affiliateLinks['party-cups'];
  }
  if (normalized.includes('bar') && normalized.includes('tool')) {
    return affiliateLinks['bar-tools'];
  }
  if (normalized.includes('bottle') && normalized.includes('opener')) {
    return affiliateLinks['bottle-opener'];
  }

  // =============================================================================
  // FOOD COOKING EQUIPMENT
  // =============================================================================
  if (normalized.includes('air') && normalized.includes('fryer')) {
    return affiliateLinks['air-fryer'];
  }
  if (normalized.includes('slow') && normalized.includes('cooker')) {
    return affiliateLinks['slow-cooker'];
  }
  if (normalized.includes('warming') && normalized.includes('tray')) {
    return affiliateLinks['warming-tray'];
  }
  if (normalized.includes('chafing') || (normalized.includes('buffet') && normalized.includes('dish'))) {
    return affiliateLinks['chafing-dish'];
  }
  if (normalized.includes('pizza') && normalized.includes('oven')) {
    return affiliateLinks['pizza-oven'];
  }
  if (normalized.includes('smoker') || (normalized.includes('bbq') && normalized.includes('grill'))) {
    return affiliateLinks['smoker'];
  }
  if (normalized.includes('instant') && normalized.includes('pot')) {
    return affiliateLinks['instant-pot'];
  }
  if (normalized.includes('grill') && normalized.includes('tool')) {
    return affiliateLinks['grill-tools'];
  }
  if (normalized.includes('thermometer') || normalized.includes('temp')) {
    return affiliateLinks['meat-thermometer'];
  }

  // =============================================================================
  // FOOD SERVING
  // =============================================================================
  if (normalized.includes('serving') && (normalized.includes('platter') || normalized.includes('tray'))) {
    return affiliateLinks['serving-platters'];
  }
  if (normalized.includes('paper') && normalized.includes('plate')) {
    return affiliateLinks['paper-plates'];
  }
  if (normalized.includes('plate') && !normalized.includes('paper')) {
    return affiliateLinks['paper-plates'];
  }
  if (normalized.includes('utensil') || normalized.includes('fork') || normalized.includes('spoon')) {
    return affiliateLinks['disposable-utensils'];
  }
  if (normalized.includes('taco') && normalized.includes('holder')) {
    return affiliateLinks['taco-holder'];
  }
  if (normalized.includes('pizza') && normalized.includes('cutter')) {
    return affiliateLinks['pizza-cutter'];
  }
  if (normalized.includes('napkin')) {
    return affiliateLinks['napkins'];
  }
  if (normalized.includes('dispenser')) {
    return affiliateLinks['beverage-dispenser'];
  }

  // =============================================================================
  // BBQ SPECIFIC
  // =============================================================================
  if (normalized.includes('bbq') && normalized.includes('sauce')) {
    return affiliateLinks['bbq-sauce'];
  }
  if (normalized.includes('grill') && !normalized.includes('tool')) {
    return affiliateLinks['grill'];
  }

  return null;
}
