import type { EventType } from '../lib/types';

// Extended EventType with food modifiers
export interface ExtendedEventType extends EventType {
  foodModifiers: Record<string, number>;
  foodTips: string[];
  foodBuyingGuide: string;
}

export const events: ExtendedEventType[] = [
  {
    id: 'wedding',
    name: 'Wedding',
    slug: 'wedding',
    description: 'Wedding reception celebration',
    defaultDuration: 5,
    modifiers: {
      wine: 1.2,      // Weddings drink more wine
      beer: 0.9,      // Beer slightly lower
      champagne: 1.5, // Toasts + celebration
      spirits: 1.0,   // Standard
    },
    foodModifiers: {
      pizza: 0.7,       // Less casual food at weddings
      wings: 0.6,       // Wings less common
      tacos: 0.8,       // Trendy for casual weddings
      sliders: 1.0,     // Popular at cocktail hour
      appetizers: 1.3,  // Heavy apps at weddings
      bbq: 0.9,         // BBQ weddings are a thing
    },
    foodTips: [
      "Plan 6-8 appetizer pieces per guest for a 1-hour cocktail hour before dinner.",
      "Sliders are a late-night hit after dancing starts - plan 2 per guest for after 10pm.",
      "If serving tacos, offer 3 protein options minimum for dietary variety.",
      "Food trucks are trendy - plan 20% extra as guests tend to go back for seconds.",
      "Passed appetizers disappear 40% faster than stationed ones - plan accordingly.",
    ],
    foodBuyingGuide: "For wedding receptions, appetizers during cocktail hour are essential. Plan 6-8 pieces per guest for a 1-hour cocktail hour. If you're doing late-night snacks (pizza, sliders, tacos), plan for 70% of guests still present to eat again around 10-11pm.",
    proTips: [
      "40% of all alcohol is consumed during cocktail hour - front-load your bar staff and ice.",
      "Offer 1-2 signature cocktails instead of a full bar to cut spirit costs by 40% and speed up service.",
      "Pre-pour wine at dinner tables 5 minutes before guests sit to prevent service bottlenecks.",
      "Order 10-15% extra and ask vendors about their return policy on unopened bottles.",
      "If dancing goes past 10pm, reopen a simplified bar: beer, wine, and 2 signature drinks only.",
    ],
    buyingGuide: "For weddings, plan a 60/40 split between red and white wine for fall/winter, or flip it for spring/summer. Budget $12-18 per bottle for a crowd-pleasing selection - guests can't tell the difference between $15 and $40 wine at a party. Consider having champagne for toasts separate from your open bar calculation.",
  },
  {
    id: 'graduation',
    name: 'Graduation Party',
    slug: 'graduation-party',
    description: 'Graduation celebration',
    defaultDuration: 4,
    modifiers: {
      wine: 0.7,      // Less wine at graduations
      beer: 1.25,     // More beer (younger crowd)
      champagne: 1.3, // Toasts expected
      spirits: 0.85,  // Mixed generations = less spirits
    },
    foodModifiers: {
      pizza: 1.2,       // Pizza is always a hit
      wings: 1.0,       // Standard
      tacos: 1.1,       // Trendy and popular
      sliders: 1.1,     // Easy to eat while mingling
      appetizers: 1.0,  // Standard
      bbq: 1.15,        // BBQ is popular at outdoor grads
    },
    foodTips: [
      "Graduation parties often span 4+ hours - plan for grazing, not a sit-down meal.",
      "Young adults eat more than you think - add 20% to your calculations for ages 18-25.",
      "Set up a separate kids' food station with pizza and sliders to keep parents happy.",
      "Outdoor graduation parties need food that won't spoil - keep hot foods hot and cold foods cold.",
      "Photo ops happen constantly - finger foods beat anything requiring utensils.",
    ],
    foodBuyingGuide: "Graduation parties are grazing events. Finger foods work best - pizza slices, sliders, wings, and appetizers that guests can grab while mingling. If your graduate is 21+, expect their friends to eat AND drink more than the older guests.",
    proTips: [
      "Set up a visible '21+ only' bar area and a killer mocktail station so younger guests feel included.",
      "Parents of graduates drink about 30% less than the graduate's friends - plan your ratios accordingly.",
      "Keep champagne cold but corked until group photo time - pop bottles for the shot!",
      "Outdoor graduations in summer need extra cold drinks and 2x the ice you think you need.",
      "Mix of generations means variety is key - have options for every age group.",
    ],
    buyingGuide: "Graduation parties typically skew toward beer and lighter drinks. Stock up on popular light beers and have a good selection of non-alcoholic options since many guests will be under 21. Sparkling cider is a great champagne alternative for toasts that includes everyone.",
  },
  {
    id: 'corporate',
    name: 'Corporate Event',
    slug: 'corporate-event',
    description: 'Professional corporate gathering',
    defaultDuration: 3,
    modifiers: {
      wine: 1.1,      // Wine is perceived as professional
      beer: 0.85,     // Less casual beer drinking
      champagne: 1.0, // Standard for toasts
      spirits: 0.7,   // -30% spirits (people cautious around colleagues)
    },
    foodModifiers: {
      pizza: 0.6,       // Too casual for most corporate
      wings: 0.5,       // Too messy
      tacos: 0.7,       // Can work for casual corporate
      sliders: 0.9,     // Acceptable finger food
      appetizers: 1.4,  // Heavy appetizers preferred
      bbq: 0.5,         // Too messy for suits
    },
    foodTips: [
      "Elegant finger foods that don't require utensils or create mess are ideal.",
      "Vegetarian and dietary options are essential - plan 30% of your spread as veg-friendly.",
      "Shorter events (2-3 hours) need less food - plan 4-5 appetizer pieces per person.",
      "Evening events consume 25% more food than lunch events.",
      "Avoid foods that stain (red sauces, turmeric) - people are in work clothes.",
    ],
    foodBuyingGuide: "Corporate events require elevated finger foods. Think caprese skewers, shrimp cocktail, bruschetta, and elegant cheese boards. Avoid anything too casual or messy. Budget $8-15 per person for appetizers at a cocktail reception.",
    proTips: [
      "Most corporate guests self-limit to 2 drinks max - don't over-order.",
      "Wine outsells beer 3:1 at corporate events - flip your usual ratio.",
      "40% of corporate guests leave within 90 minutes - peak consumption is minutes 15-60.",
      "Weekday events consume 35% less than Friday events.",
      "Always have premium non-alcoholic options prominently displayed.",
    ],
    buyingGuide: "Focus on quality over quantity for corporate events. Stock premium wines and craft options rather than bulk quantities. Have elegant non-alcoholic options visible - many professionals choose not to drink at work functions. A sophisticated sparkling water with citrus is always appreciated.",
  },
  {
    id: 'birthday',
    name: 'Birthday Party',
    slug: 'birthday-party',
    description: 'Birthday celebration',
    defaultDuration: 4,
    modifiers: {
      wine: 1.0,
      beer: 1.1,
      champagne: 1.2, // Birthday toasts
      spirits: 1.2,   // Shots happen at birthdays
    },
    foodModifiers: {
      pizza: 1.3,       // Pizza is classic birthday food
      wings: 1.1,       // Wings work well
      tacos: 1.0,       // Standard
      sliders: 1.0,     // Standard
      appetizers: 0.9,  // Less emphasis on apps
      bbq: 1.0,         // Standard
    },
    foodTips: [
      "Cake reduces other food consumption by 20% - factor this into your planning.",
      "Kids' birthday parties need 30% less food per person - shorter attention spans.",
      "Adult milestone birthdays (30, 40, 50) eat more - people linger longer.",
      "Late-night birthdays need late-night food - pizza arrives around 10pm.",
      "Set up food before activities and cake - people graze while waiting.",
    ],
    foodBuyingGuide: "Birthday party food depends heavily on the age group. Kids' parties: pizza and simple finger foods. Young adult birthdays: pizza, wings, and shareable platters. 40+ birthdays: more sophisticated appetizers and seated options.",
    proTips: [
      "Milestone birthdays (21st, 30th, 40th, 50th) consume 25% more than regular birthdays.",
      "Birthday parties have 3x more shots than any other event type - stock shooters.",
      "Consumption drops 60% during cake and presents - factor in 30-45 min of low drinking.",
      "Know your crowd's age - 21-30 year olds drink 30% more beer, 50+ drink 35% more wine.",
      "Consider a signature 'birthday cocktail' to make the guest of honor feel special.",
    ],
    buyingGuide: "Birthday parties vary wildly by age group. For 21-35, stock up on beer and mixers for cocktails. For 40+, increase your wine selection. Always have extra for milestone birthdays - people celebrate harder at 30, 40, and 50.",
  },
  {
    id: 'super-bowl',
    name: 'Super Bowl Party',
    slug: 'super-bowl-party',
    description: 'Super Bowl viewing party',
    defaultDuration: 5,
    modifiers: {
      wine: 0.5,      // Almost no one drinks wine at Super Bowl
      beer: 1.4,      // +40% beer - this is THE beer event
      champagne: 0.4, // Minimal unless your team wins
      spirits: 0.8,   // Some, but beer dominates
    },
    foodModifiers: {
      pizza: 1.3,       // Pizza is Super Bowl staple
      wings: 1.3,       // Wings are THE Super Bowl food (+30%)
      tacos: 1.0,       // Standard
      sliders: 1.2,     // Easy to eat while watching
      appetizers: 1.3,  // Chips, dips, finger foods
      bbq: 1.1,         // Pulled pork sliders are popular
    },
    foodTips: [
      "40% of all food is consumed during the first quarter - front-load your spread.",
      "Wings are the #1 Super Bowl food - err on the side of too many.",
      "Set up a separate kids station if families are coming - they eat differently.",
      "Prep dips in slow cookers - they stay warm and free up oven space.",
      "Use halftime to refresh ALL food stations - you have exactly 25 minutes.",
    ],
    foodBuyingGuide: "Super Bowl is the biggest food day of the year after Thanksgiving. Plan 10-12 wings per person, 3 slices of pizza, and plenty of chips and dip. Make everything shareable and easy to eat without utensils. Cold foods should stay cold, hot foods in warming trays or slow cookers.",
    proTips: [
      "Stock beer by the quarter: Q1 (30%), Q2 (25%), Q3 (20%), Q4 (25%) of total consumption.",
      "ALWAYS have 15% extra beer cold and ready - overtime games increase consumption by 50%.",
      "Use halftime to restock ALL coolers - you have exactly 25 minutes.",
      "Heavy food like wings and nachos reduces alcohol consumption by 15%.",
      "Light beers disappear fastest - they're easier to drink during a 4-hour game.",
    ],
    buyingGuide: "This is a beer event, period. Stock 70% light/domestic beers and 30% craft/premium options. Have coolers pre-staged in multiple locations so guests can grab drinks without blocking the TV. Buy ice in bulk - you'll need 3lbs per person for a Super Bowl party.",
  },
  {
    id: 'holiday-party',
    name: 'Holiday Party',
    slug: 'holiday-party',
    description: 'Holiday celebration',
    defaultDuration: 4,
    modifiers: {
      wine: 1.25,     // Holiday wine flows
      beer: 0.9,      // Less beer at holiday parties
      champagne: 1.4, // Celebration mode
      spirits: 1.15,  // Festive cocktails
    },
    foodModifiers: {
      pizza: 0.7,       // Less casual at holidays
      wings: 0.8,       // Some casual parties
      tacos: 0.7,       // Not holiday fare
      sliders: 1.0,     // Standard
      appetizers: 1.5,  // Heavy appetizers at holidays
      bbq: 0.6,         // Not holiday fare
    },
    foodTips: [
      "Holiday appetizers should be elevated - cheese boards, shrimp cocktail, stuffed mushrooms.",
      "Sweet treats are expected - have a dessert station with cookies and holiday candies.",
      "Warm appetizers disappear 40% faster in winter - plan accordingly.",
      "Dietary restrictions matter more at holidays - have vegetarian and gluten-free options clearly labeled.",
      "If it's a potluck, assume 30% of guests will forget to bring something.",
    ],
    foodBuyingGuide: "Holiday parties are about elevated comfort food. Plan 8-10 appetizer pieces per person for a cocktail-style party. Include a mix of hot and cold options, with at least one 'showstopper' like a cheese board or charcuterie spread.",
    proTips: [
      "Red wine outsells white 2:1 at winter holidays - adjust accordingly.",
      "Festive signature cocktails are expected - plan for mixers like cranberry juice and eggnog.",
      "70% of champagne at NYE is consumed between 11:30pm and 12:15am - time your chilling.",
      "Warm drinks like mulled wine and hot toddies are crowd pleasers in cold months.",
      "People drink 20% more at company holiday parties than other corporate events.",
    ],
    buyingGuide: "Holiday parties call for festive options. Stock extra red wine and have ingredients for 1-2 seasonal cocktails (mulled wine, spiked cider, or classic eggnog). For NYE specifically, double your champagne order and have everything chilled by 11pm.",
  },
  {
    id: 'wedding-shower',
    name: 'Wedding Shower',
    slug: 'wedding-shower',
    description: 'Bridal or wedding shower celebration',
    defaultDuration: 3,
    modifiers: {
      wine: 1.4,      // Wine-heavy event
      beer: 0.3,      // Minimal beer at showers
      champagne: 1.8, // Mimosas + toasts dominate
      spirits: 0.5,   // Limited cocktails
    },
    foodModifiers: {
      pizza: 0.4,       // Too casual
      wings: 0.3,       // Too messy/casual
      tacos: 0.5,       // Can work for casual showers
      sliders: 0.8,     // Mini sandwiches work
      appetizers: 1.4,  // Elegant apps expected
      bbq: 0.3,         // Too casual
    },
    foodTips: [
      "Elegant, bite-sized foods are the gold standard - tea sandwiches, fruit skewers, mini quiches.",
      "Sweet treats are essential - petit fours, macarons, and a beautiful cake or cupcakes.",
      "Plan 5-7 savory pieces and 2-3 sweet pieces per guest for a 2-3 hour event.",
      "Presentation matters more than quantity - use tiered trays and beautiful serving pieces.",
      "Dietary accommodations are essential - have vegetarian and gluten-free clearly labeled.",
    ],
    foodBuyingGuide: "Bridal showers call for elegant finger foods. Think tea sandwiches, fresh fruit displays, cheese boards, and beautiful desserts. Plan $12-20 per person for a nice spread. Avoid anything messy or requiring utensils.",
    proTips: [
      "Mimosa bars are the gold standard. Stock 1 bottle of sparkling per 3 guests, plus orange juice and peach nectar for variety.",
      "Skip heavy reds. Go 70% white/rosé (Pinot Grigio, Sauvignon Blanc) and 30% light red (Pinot Noir).",
      "Create one signature cocktail (Aperol Spritz, French 75) and batch it ahead of time - plan 2 servings per guest.",
      "25-30% of guests won't drink alcohol. Offer elegant non-alcoholic options like mocktails or flavored sparkling water.",
      "Afternoon timing means lower consumption - most guests have 1-2 drinks max.",
    ],
    buyingGuide: "For a 2-3 hour afternoon shower, plan for 1.3 drinks per guest. Champagne and wine dominate - stock 1 bottle of sparkling per 3 guests for mimosas, plus 1 wine bottle per 2 drinking guests. Buy 10-15% extra; unopened bottles can be returned or saved for the wedding. Prosecco is cost-effective for mimosas; save real Champagne for the toast.",
  },
  // ============================================================================
  // NEW EVENT TYPES FOR SEASONAL LANDING PAGES
  // ============================================================================
  {
    id: 'march-madness',
    name: 'March Madness Party',
    slug: 'march-madness-party',
    description: 'March Madness basketball viewing party',
    defaultDuration: 4,
    modifiers: {
      wine: 0.5,      // Low wine consumption
      beer: 1.35,     // Heavy beer event
      champagne: 0.4, // Minimal
      spirits: 0.85,  // Some mixed drinks
    },
    foodModifiers: {
      pizza: 1.3,       // Pizza is a staple
      wings: 1.25,      // Wings are huge for basketball (+25%)
      tacos: 1.0,       // Standard
      sliders: 1.2,     // Easy game food
      appetizers: 1.2,  // Chips and dips
      bbq: 1.0,         // Standard
    },
    foodTips: [
      "Tournament games can run 2+ hours each - plan for sustained snacking, not a single meal.",
      "Bracket pools mean people arrive at different times - keep food stations refreshed.",
      "Wings and pizza are the classic combo - plan for both.",
      "Overtime games increase consumption by 25% - have backup food ready.",
      "Multiple TV setups mean multiple food stations - don't make people miss the game.",
    ],
    foodBuyingGuide: "March Madness is similar to Super Bowl but spread over multiple games. Wings, pizza, and shareable appetizers are ideal. Plan 8-10 wings and 2-3 pizza slices per person per game session.",
    proTips: [
      "Games run back-to-back during opening weekend - people may stay 6-8 hours.",
      "Stock light beers for marathon watching sessions.",
      "Multiple games mean multiple peaks - don't front-load everything.",
      "Have non-alcoholic options for designated drivers and early bracket busts.",
      "Weekend games have 30% higher consumption than weekday games.",
    ],
    buyingGuide: "March Madness parties are beer-heavy but lighter than Super Bowl (longer duration, people pace themselves). Stock 70% light beers. Have coolers at every TV location. Plan 4-5 beers per person for a 4-hour session.",
  },
  {
    id: 'fourth-of-july',
    name: '4th of July Party',
    slug: 'fourth-of-july-party',
    description: 'Independence Day celebration',
    defaultDuration: 5,
    modifiers: {
      wine: 0.6,      // Less wine outdoors
      beer: 1.4,      // Heavy beer event
      champagne: 0.5, // Minimal
      spirits: 1.0,   // Standard for cocktails
    },
    foodModifiers: {
      pizza: 0.7,       // Less common - outdoor grilling preferred
      wings: 1.0,       // Grilled wings work
      tacos: 1.0,       // Standard
      sliders: 1.3,     // Burger sliders are classic
      appetizers: 1.0,  // Standard
      bbq: 1.5,         // BBQ is THE 4th of July food
    },
    foodTips: [
      "Outdoor grilling is expected - plan for burgers, hot dogs, and BBQ.",
      "Hot weather means lighter appetites - reduce food quantities by 10-15%.",
      "Keep cold foods cold - refresh ice every 90 minutes in summer heat.",
      "Fireworks timing matters - have lighter snacks for after dark.",
      "Patriotic presentation adds to the fun - use themed plates and decorations.",
    ],
    foodBuyingGuide: "4th of July is about grilled meats and outdoor eating. Plan 1 burger/hot dog + 1 side per person, or 6oz pulled pork with buns. Keep everything fresh with plenty of ice. Watermelon and cold sides are essential in summer heat.",
    proTips: [
      "Outdoor heat increases beer consumption by 25% - have more than you think.",
      "Ice melts FAST in July - buy 5lbs per person and have backup bags.",
      "Coolers in shade last 40% longer than those in sun.",
      "Red, white, and blue cocktails are a fun addition to the bar.",
      "People drink less after sunset when fireworks start - front-load your ice.",
    ],
    buyingGuide: "This is a daytime outdoor beer event. Stock heavily on light, refreshing beers and have plenty of ice. Mixed drinks with vodka and lemonade or margaritas are popular. Plan 5-6 drinks per person for a 5-hour party.",
  },
  {
    id: 'labor-day',
    name: 'Labor Day Party',
    slug: 'labor-day-party',
    description: 'Labor Day end of summer celebration',
    defaultDuration: 5,
    modifiers: {
      wine: 0.7,      // Slightly higher than 4th
      beer: 1.3,      // Still heavy beer
      champagne: 0.5, // Minimal
      spirits: 1.0,   // Standard
    },
    foodModifiers: {
      pizza: 0.8,       // Less common outdoors
      wings: 1.0,       // Standard
      tacos: 1.1,       // Summer tacos work great
      sliders: 1.3,     // Burger sliders popular
      appetizers: 1.0,  // Standard
      bbq: 1.4,         // End of summer BBQ tradition
    },
    foodTips: [
      "Last cookout of summer - make it count with premium BBQ.",
      "Weather can be unpredictable - have an indoor backup plan for food.",
      "Pool parties need poolside snacks that won't blow away.",
      "Kids go back to school soon - family-friendly food is key.",
      "Leftovers are expected - plan portions with next-day sandwiches in mind.",
    ],
    foodBuyingGuide: "Similar to 4th of July but slightly more relaxed. BBQ, grilled foods, and summer salads are perfect. This is often the last outdoor party of the year, so people tend to indulge a bit more.",
    proTips: [
      "End of summer means people are ready to indulge one last time.",
      "Weather can vary - have backup plans for rain.",
      "Pool parties need drinks near the pool AND inside.",
      "It's often slightly cooler than July - ice lasts longer.",
      "Monday holiday means people may drink a bit more than usual.",
    ],
    buyingGuide: "Similar to 4th of July but slightly higher consumption as people celebrate the end of summer. Plan 5-6 drinks per person with heavy beer emphasis.",
  },
  {
    id: 'halloween',
    name: 'Halloween Party',
    slug: 'halloween-party',
    description: 'Halloween costume party',
    defaultDuration: 4,
    modifiers: {
      wine: 0.9,      // Red wine fits the theme
      beer: 1.1,      // Standard beer
      champagne: 0.4, // Minimal
      spirits: 1.3,   // Specialty cocktails are key
    },
    foodModifiers: {
      pizza: 1.2,       // Pizza parties are common
      wings: 1.0,       // Standard
      tacos: 0.9,       // Less common
      sliders: 1.0,     // Standard
      appetizers: 1.3,  // Themed appetizers are big
      bbq: 0.7,         // Less common
    },
    foodTips: [
      "Themed food is expected - deviled eggs, 'finger' foods, spooky presentation.",
      "Sweet treats matter - have Halloween candy and themed desserts.",
      "Costumes make eating difficult - finger foods only, nothing messy.",
      "Purple, orange, and black food coloring elevates everything.",
      "Dry ice in punch bowls is dramatic but keep it away from kids.",
    ],
    foodBuyingGuide: "Halloween parties are all about presentation. Themed appetizers with spooky names, finger foods that won't mess up costumes, and plenty of candy. Budget for presentation supplies like themed plates and decorations.",
    proTips: [
      "Specialty cocktails with spooky names are a must - batch them ahead.",
      "Dark spirits (whiskey, dark rum) fit the theme better than clear spirits.",
      "Punch bowls with dry ice create amazing effects.",
      "People in elaborate costumes drink slower - they don't want to spill.",
      "Adult-only parties consume 40% more than family Halloween events.",
    ],
    buyingGuide: "Halloween parties are cocktail-heavy. Plan for 2-3 specialty cocktails per person plus regular bar options. Red wine fits the theme well. Have themed cups and garnishes.",
  },
  {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    slug: 'thanksgiving',
    description: 'Thanksgiving dinner celebration',
    defaultDuration: 4,
    modifiers: {
      wine: 1.3,      // Wine pairs with dinner
      beer: 0.8,      // Less beer at sit-down meals
      champagne: 0.9, // Some for toasts
      spirits: 0.9,   // Before/after dinner drinks
    },
    foodModifiers: {
      pizza: 0.3,       // Not Thanksgiving fare
      wings: 0.4,       // Not Thanksgiving fare
      tacos: 0.3,       // Not Thanksgiving fare
      sliders: 0.5,     // Maybe for appetizers
      appetizers: 1.2,  // Pre-dinner apps
      bbq: 0.5,         // Not traditional
    },
    foodTips: [
      "Turkey is 1-1.5 lbs per person (includes bone weight).",
      "Appetizers before dinner should be light - 3-4 pieces per person max.",
      "Plan 3-4 side dishes total - not 3-4 per person.",
      "Dessert is non-negotiable - 1 pie per 6-8 guests.",
      "Leftovers are part of Thanksgiving - plan for turkey sandwiches.",
    ],
    foodBuyingGuide: "Thanksgiving is about the traditional spread: turkey (1-1.5 lbs per person), stuffing, mashed potatoes, gravy, cranberry sauce, and pie. Light appetizers before dinner only. Plan for leftovers!",
    proTips: [
      "Wine consumption peaks during dinner - have bottles ready at the table.",
      "Pre-dinner cocktails should be light so people can enjoy the meal.",
      "After-dinner drinks (port, brandy) are a nice touch.",
      "Football watching = beer in the afternoon before dinner.",
      "Designated drivers are essential - plan non-alcoholic options.",
    ],
    buyingGuide: "Thanksgiving is wine-heavy with the meal. Plan 1 bottle of wine per 2 adults at the table. Have a light cocktail option for pre-dinner and maybe some beer for football watching. Keep it classy.",
  },
  {
    id: 'new-years-eve',
    name: "New Year's Eve Party",
    slug: 'new-years-eve-party',
    description: "New Year's Eve celebration",
    defaultDuration: 5,
    modifiers: {
      wine: 1.1,      // Standard wine
      beer: 0.8,      // Less beer
      champagne: 2.0, // DOUBLE champagne - it's NYE!
      spirits: 1.2,   // Cocktails flow
    },
    foodModifiers: {
      pizza: 0.8,       // Some late-night pizza
      wings: 0.7,       // Not NYE fare
      tacos: 0.7,       // Not NYE fare
      sliders: 1.0,     // Late night sliders work
      appetizers: 1.4,  // Heavy appetizers
      bbq: 0.5,         // Not NYE fare
    },
    foodTips: [
      "Elegant appetizers are expected - this is a dressy event.",
      "Late-night food is essential - sliders or pizza around 12:30am.",
      "Heavy apps early, lighter as midnight approaches.",
      "Sweet treats for after midnight - champagne and dessert pair perfectly.",
      "Breakfast items for really late parties - mini quiches, bacon strips.",
    ],
    foodBuyingGuide: "NYE is about elegant appetizers and champagne. Plan 8-10 appetizer pieces per person for the main event, plus late-night snacks for after midnight. End with something sweet.",
    proTips: [
      "70% of champagne is consumed between 11:30pm and 12:15am - time your chilling.",
      "Have champagne COLD and ready to pour at 11:55pm.",
      "People pace themselves until 10pm then drinking accelerates.",
      "Late-night parties need designated drivers or Uber - plan ahead.",
      "Noisemakers and party favors should be near the champagne station.",
    ],
    buyingGuide: "This is THE champagne event. Plan 1 bottle per 3-4 guests for the midnight toast, plus additional for cocktails (French 75s, Kir Royale). Have regular bar options for earlier in the evening. Stock more than you think - better to have leftovers than run out at midnight.",
  },
];

export const getEventById = (id: string): ExtendedEventType | undefined => {
  return events.find(event => event.id === id);
};
