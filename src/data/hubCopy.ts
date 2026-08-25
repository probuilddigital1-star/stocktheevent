/**
 * hubCopy.ts - the intro prose for each hub page.
 *
 * Every figure quoted here is read from the generated page data, and every
 * intro was checked against that data before being committed. If the model
 * changes, these numbers have to be rechecked; scripts do not rewrite them.
 *
 * Keys are "drink:{itemId}", "event:{eventId}" and "food:{foodItemId}".
 */

/** The question each drink hub answers, used as its H1. */
export const DRINK_HUB_QUESTION: Record<string, string> = {
  wine: 'How Much Wine for a Party?',
  beer: 'How Much Beer for a Party?',
  champagne: 'How Much Champagne for a Party?',
  spirits: 'How Much Liquor for a Party?',
};

/** The question each food hub answers, used as its H1. */
export const FOOD_HUB_QUESTION: Record<string, string> = {
  pizza: 'How Much Pizza for a Party?',
  wings: 'How Many Wings for a Party?',
  tacos: 'How Many Tacos for a Party?',
  sliders: 'How Many Sliders for a Party?',
  appetizers: 'How Many Appetizers for a Party?',
  bbq: 'How Much BBQ for a Party?',
};

const INTROS: Record<string, string> = {
  'drink:wine': `For 100 guests, wine on a full bar ranges from about 5 bottles at a 4th of July party to 41 bottles at a wedding, depending on how much of the bar wine carries at that event. Each 750 ml bottle pours five glasses, so the count scales with guest count: a 25-guest wedding needs about 12 bottles, and a 200-guest wedding needs about 76. These full-bar figures already include a 15 percent buffer for uneven drinkers and spills.

Wine's share of the bar varies by occasion, covering under 9 percent of the pours at a 4th of July party but close to 40 percent at a wedding, corporate event, or Thanksgiving gathering, where wine is often the leading drink. If wine is the only alcohol served, expect the total to jump well past the full-bar figure; a 100-guest wedding would need around 109 bottles instead of 41. Expect the heaviest draw in the first hour of any event, and stock accordingly rather than spreading the total evenly across the night.`,

  'drink:beer': `For 100 guests on a full bar, beer typically runs somewhere between 1 case and 17 cases, depending on the event: a wedding shower needs as little as 1 case, while a Super Bowl party can call for 17. That is because beer's share of the bar shifts dramatically by occasion, from 6.8 percent at a wedding shower up to 60.9 percent at a Super Bowl party, where it becomes the dominant pour. Each case holds 24 cans, and the totals above already build in a 15 percent buffer so the last hour does not run dry.

If beer is the only alcohol served, plan for more: a Super Bowl party can call for 27 cases and a wedding shower for 4, since guests lean harder on a single option when nothing else is poured. Expect the first hour to be the heaviest for beer specifically, since it is often the easy choice before people settle into wine or spirits. The table below gives the exact figure for your event and guest count.`,

  'drink:champagne': `For a full bar of 100 guests, champagne needs range from as few as 2 bottles for a casual event like a Labor Day party up to 66 bottles for a New Year's Eve celebration, with a typical wedding calling for about 19 bottles. Each bottle pours 6 flutes, and a buffer for spills and refills is already built into every quantity on this site. If champagne is the only alcohol being served, plan for considerably more: a wedding's 19 bottles becomes 114, and New Year's Eve climbs to 152 bottles for the same guest count.

Toast planning is a separate question, since every guest takes a glass for the toast, not just the people who drink. At 100 guests, that works out to 20 bottles for the toast alone, one flute per person. These figures scale with guest count as well; a wedding needs about 6 bottles at 25 guests and 36 bottles at 200, using that same 6-flute pour throughout. Chilling bottles well ahead of time keeps the toast moving once glasses start going around.`,

  'drink:spirits': `For a full bar serving 100 guests, spirits typically run between 1 and 14 bottles depending on the event: a wedding shower needs as little as 1 bottle, a corporate event about 3, a wedding about 6, a birthday party about 8, and a Halloween party as many as 14. That figure already builds in a 15 percent buffer, and it covers only spirits' share of a full bar poured alongside wine, beer, and champagne. A party serving spirits as the only alcohol needs far more, from 10 bottles at a wedding shower up to 32 at a New Year's Eve party.

A full bar's spirits count is usually in the low single digits, which covers the volume but not the variety. Even a small number of bottles should still include at least one each of vodka, gin, whiskey, rum, and tequila, since guests reach for a liquor by name rather than a pour of whatever happens to be open. The table below gives the exact bottle count for your event and guest count.`,

  'event:wedding': `A wedding reception for 100 guests over a five-hour open bar comes to 41 bottles of wine, 5 cases of beer, 19 bottles of champagne, and 6 bottles of spirits, about 447 drinks in total. Wine leads a wedding bar at roughly 37.5 percent of what gets poured. Champagne is the smallest share at 16.7 percent, with spirits at 20.8 percent and beer at 25 percent. Those figures already build in a 15 percent buffer for guests who pour heavier or stay through the last toast. The total scales with the guest list, from about 128 drinks at 25 guests to 829 at 200, which moves the wine count from 12 bottles to 76.

On the food side, if the spread is the main dish rather than one course among several, 100 guests works out to 26 pizzas, 59 pounds of wings, 20 dozen tacos, 25 dozen sliders, 34 platters of appetizers, or 30 pounds of BBQ or pulled pork, depending on what is on the menu.`,

  'event:graduation': `For a graduation party of 100 guests, a full bar comes to 14 bottles of wine, 9 cases of beer, 9 bottles of champagne, and 5 bottles of spirits, about 353 drinks with a 15 percent buffer built in. Beer leads at 43.5 percent, typical for a casual crowd, while champagne is the smallest share at 10.4 percent, mostly reserved for toasts. The total scales to about 101 drinks at 25 guests and 656 at 200, taking the beer count from 3 cases to 17. Graduation parties often mix generations, so a good share of guests may not be drinking at all, which is worth weighing before buying toward the higher end.

Food is sized separately, on the assumption it is the main dish rather than a side. At 100 guests, plan on 44 pizzas, 98 lbs of wings, 27 dozen tacos, 27 dozen sliders, 27 platters of appetizers, and 38 lbs of BBQ or pulled pork.`,

  'event:corporate': `For 100 guests at a three-hour corporate event, a full bar comes to 28 bottles of wine, 3 cases of beer, 7 bottles of champagne, and 3 bottles of spirits, about 260 drinks, with a buffer already worked into every number. Wine carries the bar at 39.1 percent, while champagne sits lowest at 13 percent, a split that fits a shorter format where guests tend to pace themselves around colleagues. The total runs about 74 drinks at 25 guests and 483 at 200, moving the wine count from 8 bottles to 52.

Food quantities assume the spread is the main dish, not a side table. For 100 guests that means 22 pizzas, 49 lbs of wings, 18 dozen tacos, 23 dozen sliders, 37 platters of appetizers, and 17 lbs of BBQ or pulled pork. With only three hours on the clock, many offices lean on appetizers and pizza that guests can eat standing up rather than a plated meal.`,

  'event:birthday': `A birthday party for 100 guests, using the default four-hour length, comes to 15 bottles of wine, 9 cases of beer, 6 bottles of champagne, and 8 bottles of spirits, about 380 drinks across a full bar. That total already includes a 15 percent buffer over straight consumption math. Beer leads at 47.8 percent of what gets poured, spirits follow at 26.1 percent, wine at 19.1 percent, and champagne is the smallest share at 7 percent. Scaling runs from about 109 drinks at 25 guests to 706 at 200, taking the beer count from 3 cases to 16.

Food figures on this page assume the dish is the main course. At 100 guests that is 48 pizzas, 108 pounds of wings, 25 dozen tacos, 25 dozen sliders, 24 platters of appetizers, or 33 pounds of pulled pork. Birthday parties vary more by guest list than most events here, so treat both tables as a starting point.`,

  'event:super-bowl': `For 100 guests over the game's five hours, a full bar comes to 17 cases of beer, 6 bottles of wine, 5 bottles of spirits, and 2 bottles of champagne, about 437 drinks in total. The numbers already include a 15 percent buffer, and each one is that drink's share of a single shared bar, not a separate order. Beer takes the largest share by a wide margin, at 60.9 percent, and champagne the smallest, at 4.3 percent. That fits the day: this is the most beer-forward event on the site, since cans in a cooler suit a game watched from a couch better than poured drinks. The total runs about 125 drinks at 25 guests and 812 at 200, moving beer from 5 cases to 30.

Food here is sized as the main dish: 48 pizzas, 128 pounds of wings, 25 dozen tacos, 30 dozen sliders, 34 platters of appetizers, and 37 pounds of BBQ or pulled pork for the same 100 guests.`,

  'event:holiday-party': `For 100 guests, a four-hour holiday party full bar comes to 35 bottles of wine, 3 cases of beer, 12 bottles of champagne, and 10 bottles of spirits, roughly 400 drinks, with a cushion already factored in for heavier pours. Wine and spirits tie for the largest share at 34.8 percent each. Beer follows at 17.4 percent, and champagne is the smallest at 13 percent. The total scales to about 114 drinks for 25 guests and 744 for 200, taking the wine count from 10 bottles to 64, so the same ratios hold whether the guest list is small or large.

On the food side, treating the spread as the main dish, 100 guests need around 40 platters of appetizers, 79 pounds of wings, 26 pizzas, 25 dozen sliders, 18 dozen tacos, and 20 pounds of pulled pork. A spread that leans heavier on apps and lighter on smoked meat fits a lot of hosting beyond Christmas week, including St. Patrick's Day, Cinco de Mayo, and Easter brunch crowds.`,

  'event:wedding-shower': `For 100 guests, a full wedding shower bar comes to 49 bottles of champagne, 31 bottles of wine, 1 case of beer, and 1 bottle of spirits, about 405 drinks, with a buffer already built in for pours and refills. Champagne leads by a wide margin at 50.8 percent, which fits a short three-hour daytime event where most guests have a drink or two rather than settling in for the afternoon. Wine follows at 33.9 percent, spirits at 8.5 percent, and beer is the smallest share at 6.8 percent. The total runs about 116 drinks at 25 guests and 750 at 200, taking the champagne count from 14 bottles to 91.

On the food side, with food serving as the main dish, plan on 37 platters of appetizers, 20 dozen sliders, 15 pizzas, 13 dozen tacos, 30 pounds of wings, and 10 pounds of pulled pork for 100 guests.`,

  'event:march-madness': `For a four-hour March Madness party with 100 guests, a full bar comes to 13 cases of beer, 6 bottles of wine, 6 bottles of spirits, and 2 bottles of champagne, about 364 drinks in total. Beer carries most of that weight at 56.5 percent, since a game-day crowd usually reaches for a can between plays instead of waiting on a pour. Spirits take 26.1 percent, wine 13 percent, and champagne barely factors in at 4.3 percent. The total scales to about 105 drinks at 25 guests and 677 at 200, moving beer from 4 cases to 24.

Food scales alongside it: treating the spread as the main dish for the same 100 guests calls for 48 pizzas, 123 pounds of wings, 25 dozen tacos, 30 dozen sliders, 32 platters of appetizers, and 33 pounds of pulled pork. Tournament games run back to back, and guests tend to filter in and out over the afternoon rather than show up all at once.`,

  'event:fourth-of-july': `For a 100-guest 4th of July party, a full bar comes to 15 cases of beer, 9 bottles of spirits, 5 bottles of wine, and 2 bottles of champagne, about 460 drinks in total, with a 15 percent buffer already included. Beer is the leading pour at 56.5 percent, which fits an outdoor, daytime cookout where cold cans move faster than wine or spirits once the heat sets in. Spirits take 30.4 percent, wine holds just 8.7 percent, and champagne is the smallest at 4.3 percent. The total scales to about 131 drinks at 25 guests and 855 at 200, taking beer from 5 cases to 28.

The food side is sized the same way, at 100 guests as the main dish: 26 pizzas, 98 pounds of wings, 25 dozen tacos, 32 dozen sliders, 27 platters of appetizers, and 50 pounds of pulled pork. Plan on more ice and cooler space than an indoor party needs.`,

  'event:labor-day': `For a five-hour Labor Day party of 100 guests, a full bar comes to 13 cases of beer, 9 bottles of spirits, 9 bottles of wine, and 2 bottles of champagne, about 431 drinks, with a buffer for spills and second pours already built in. Beer carries just over half the bar at 52.2 percent, the largest share of any category, while champagne sits lowest at 4.3 percent. Spirits take 30.4 percent and wine 13 percent. The total runs about 122 drinks at 25 guests and 801 at 200, moving the beer count from 4 cases to 24.

Food figures assume this spread is the main dish, not a side alongside a bigger meal. At 100 guests that comes to 30 pizzas, 98 lbs of wings, 27 dozen tacos, 32 dozen sliders, 27 platters of appetizers, and 46 lbs of pulled pork. The same profile carries over to Memorial Day, so these tables cover both ends of the summer cookout season.`,

  'event:halloween': `For 100 guests at a four-hour Halloween party, a full bar comes to 14 bottles of spirits, 13 bottles of wine, 6 cases of beer, and 3 bottles of champagne, about 372 drinks in total. Each figure already includes some cushion for spills, so there is no need to round up further. Spirits lead at 43.5 percent, the largest share here, beer takes 30.4 percent, wine 17.4 percent, and champagne trails at 8.7 percent. That split fits how Halloween tends to run: themed shots and batched cocktails carry more of the night than at most other events on the site. The total scales to about 106 drinks at 25 guests and 691 at 200, taking spirits from 4 bottles to 25.

On the food side, planning for food as the main dish at 100 guests means 44 pizzas, 98 pounds of wings, 23 dozen tacos, 25 dozen sliders, 34 platters of appetizers, and 23 pounds of pulled pork.`,

  'event:thanksgiving': `For 100 guests, a full Thanksgiving bar comes to 41 bottles of wine, 4 cases of beer, 6 bottles of champagne, and 6 bottles of spirits, about 352 drinks, with a 15 percent buffer already worked into every number. Wine leads here at 39.1 percent of the pour, ahead of beer and spirits, which are tied at 26.1 percent each, and champagne, the smallest at 8.7 percent. That lean toward wine fits how the day is usually served: guests are seated at a table for a few hours rather than moving around with a can in hand. The total runs about 101 drinks at 25 guests and 653 at 200, moving the wine count from 12 bottles to 75.

The food table uses the same 100-guest base, but treat those numbers with caution. They assume the dish is the entire meal, and at Thanksgiving it rarely is: the turkey and the sides are dinner, and something like 12 pizzas is really an extra spread.`,

  'event:new-years-eve': `For 100 guests, a full New Year's Eve bar comes to 66 bottles of champagne, 22 bottles of wine, 7 bottles of spirits, and 2 cases of beer, about 581 drinks in total. Champagne leads at 43.5 percent, ahead of wine and spirits, which are tied at 21.7 percent each, with beer the smallest share at 13 percent. That champagne share is the largest of any event on this site apart from a wedding shower. Midnight is a single fixed moment when nearly every guest wants a full flute, so bottles should be chilled and open before the countdown starts. These figures already include a 15 percent buffer, and the total scales to about 166 drinks at 25 guests and 1077 at 200, taking champagne from 19 bottles to 122.

With food as the main dish, 100 guests calls for 30 pizzas, 69 lbs of wings, 18 dozen tacos, 25 dozen sliders, 37 platters of appetizers, and 17 lbs of BBQ or pulled pork.`,

  'food:pizza': `For 100 guests eating pizza as the main dish, plan on somewhere between 12 and 48 pizzas, depending on the event; a Thanksgiving crowd needs about 12, a birthday party closer to 48. That range comes from 8 servings per pizza, with 3 servings per guest when pizza is the main dish and 2 per guest when it shares the table with other food. If pizza is one of several dishes on a buffet, use the lower servings-per-person figure and the pizza count drops. Every number here already includes a 15 percent buffer for extra slices and uneven eaters.

Party size scales in roughly a straight line: a birthday party needs 14 pizzas at 25 guests, 48 at 100, and 90 at 200, using the same per-guest math throughout. If the party runs long or guests arrive in waves, order pizza in two batches so the second round stays hot. The table below gives the exact figure for your event and guest count.`,

  'food:wings': `For a party of 100 guests, plan on somewhere between 30 and 128 pounds of wings, depending on the event. A wedding shower needs about 30 pounds, a wedding runs closer to 59 pounds, and a Super Bowl party, the highest of any event we calculate for, calls for about 128 pounds; graduation parties, 4th of July cookouts, and Labor Day parties each land around 98 pounds. The gap reflects how long the party runs and how much of the meal wings are carrying.

Wings are ordered by weight rather than by piece, figured at 10 servings per pound. When wings are the main dish, plan for 10 servings per person; when they are one of several dishes on a buffet, that drops to 6 servings per person, since guests fill up on other food too. A 15 percent buffer is already built into every total, so you do not need to pad the numbers yourself. Whatever the event, keep a warming tray going so the last batch out of the fryer holds up as well as the first.`,

  'food:tacos': `For 100 guests with tacos as the main dish, plan on about 25 dozen tacos, enough for 3 servings per person. That baseline holds for casual gatherings like birthday parties, Super Bowl parties, and 4th of July cookouts, but the right count shifts with the occasion: a Thanksgiving crowd needs closer to 8 dozen at the same headcount, since turkey carries the meal, while a graduation party can run up to 27 dozen, the highest of any event tracked here. Each quantity below already builds in a 15 percent buffer for extra helpings and stragglers, so there is little need to round up further.

If tacos are sharing the table with other dishes rather than anchoring the meal, cut the estimate to 2 servings per person instead of 3; a buffet spread stretches the same batch of shells and fillings across more plates. Tacos are ordered by the dozen here, with 12 servings in each, so a build-your-own taco bar with a few protein and topping options tends to use the quantity efficiently regardless of event size.`,

  'food:sliders': `For 100 guests, plan on about 25 dozen sliders if they are the main dish. That figure moves with the event: Thanksgiving runs closer to 13 dozen, while a 4th of July cookout can climb to 32 dozen. The count is built on 3 servings per person for a main dish, packed 12 to a dozen, with a 15 percent buffer already folded in so a few extra guests or a hungrier crowd will not leave the platter empty.

If sliders are one of several dishes rather than the centerpiece, the per-person figure drops to 2 servings, which lowers the total. That tends to fit sliders well; they hold up better than a full burger on a buffet line, and guests will often take one alongside tacos or wings rather than a full plate. Guest count scales in roughly a straight line too: a 25-guest birthday gathering needs about 7 dozen, and the same party at 200 guests needs around 46 dozen.`,

  'food:appetizers': `For 100 guests, plan on 24 to 40 platters of appetizers, depending on the event, when appetizers are the main food at the party. That range runs from a birthday party at the low end to a holiday party at the high end, with platters built at 30 servings each. The published figures assume a cocktail-reception setup, where appetizers carry the meal at 8 servings per person, with a buffer already built in for guests who go back for seconds or trays that get picked over unevenly. If appetizers are served alongside a full dinner instead of standing in for the meal, the per-person count drops to 6 servings, since guests are filling up elsewhere too.

Passed trays tend to empty faster than a stationary table, so plan extra circulation time if a server works the room instead of letting guests help themselves. Appetizers are ordered by the platter rather than by the piece, so the table below gives an exact order for your event and guest count.`,

  'food:bbq': `For a 100-guest party, cooked pulled pork typically runs from about 10 pounds up to 50 pounds, depending on the event and how much else is on the table. The calculators here work in pounds of cooked meat, figured at three servings per pound, and each total already includes a 15 percent buffer for latecomers and second helpings. That published amount assumes barbecue is the main dish, at one serving per guest; if it is sharing the table with tacos, sliders, or another entree, the plan drops to about half a serving per person, and the pounds you order come down with it.

Keep in mind you are buying raw meat, and the pork at the butcher counter needs to weigh more than the cooked figure shown. A long, slow cook can burn off roughly half the meat's mass as fat and moisture cook out, so the raw cut has to start out heavier. Starting the smoker the day before takes the time pressure off, since pulled pork holds and reheats well once it has rested.`,
};

/** The intro for a hub. Throws at build time if a key is missing, rather than shipping a blank page. */
export function hubIntro(key: string): string {
  const copy = INTROS[key];
  if (!copy) throw new Error(`[hubCopy] No intro written for "${key}". Add one to src/data/hubCopy.ts.`);
  return copy;
}
