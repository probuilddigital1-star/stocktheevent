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
    pluralName: 'Weddings',
    lowerName: 'wedding',
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
      "The appetizer table sizes a one-hour cocktail hour before dinner.",
      "Sliders are a late-night hit once dancing starts, so size a second round for whoever is still on the floor.",
      "If serving tacos, offer 3 protein options minimum for dietary variety.",
      "Food trucks are popular, and guests tend to go back for seconds, so plan a little extra.",
      "Passed appetizers tend to disappear faster than stationed ones, so plan accordingly.",
    ],
    foodBuyingGuide: "For wedding receptions, appetizers during cocktail hour are essential. The table above sizes the appetizers for a cocktail hour. If you are doing late-night snacks such as pizza, sliders, or tacos, size them for the share of guests still on the floor rather than the full list.",
    proTips: [
      "Cocktail hour is usually the heaviest stretch of the night, so front-load your bar staff and ice.",
      "Offering one or two signature cocktails instead of a full bar trims spirit costs and speeds up service.",
      "Pre-pour wine at dinner tables 5 minutes before guests sit to prevent service bottlenecks.",
      "Ask vendors about their return policy on unopened bottles before ordering, so buying long costs you little.",
      "If dancing goes past 10pm, reopen a simplified bar: beer, wine, and 2 signature drinks only.",
    ],
    buyingGuide: "For weddings, plan a 60/40 split between red and white wine for fall/winter, or flip it for spring/summer. Budget $12-18 per bottle for a crowd-pleasing selection - guests can't tell the difference between $15 and $40 wine at a party. Consider having champagne for toasts separate from your open bar calculation.",
  },
  {
    id: 'graduation',
    name: 'Graduation Party',
    pluralName: 'Graduation parties',
    lowerName: 'graduation party',
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
      "Young adults eat more than you would expect, so add a margin to your calculations for that age group.",
      "Set up a separate kids' food station with pizza and sliders to keep parents happy.",
      "Outdoor graduation parties need food that won't spoil - keep hot foods hot and cold foods cold.",
      "Photo ops happen constantly - finger foods beat anything requiring utensils.",
    ],
    foodBuyingGuide: "Graduation parties are grazing events. Finger foods work best - pizza slices, sliders, wings, and appetizers that guests can grab while mingling. If your graduate is 21+, expect their friends to eat AND drink more than the older guests.",
    proTips: [
      "Set up a visible '21+ only' bar area and a killer mocktail station so younger guests feel included.",
      "Parents of graduates usually drink less than the graduate's friends, so plan your ratios accordingly.",
      "Keep champagne cold but corked until group photo time - pop bottles for the shot!",
      "Outdoor graduations in summer need extra cold drinks and far more ice than you would expect.",
      "Mix of generations means variety is key - have options for every age group.",
    ],
    buyingGuide: "Graduation parties typically skew toward beer and lighter drinks. Stock up on popular light beers and have a good selection of non-alcoholic options since many guests will be under 21. Sparkling cider is a great champagne alternative for toasts that includes everyone.",
  },
  {
    id: 'corporate',
    name: 'Corporate Event',
    pluralName: 'Corporate events',
    lowerName: 'corporate event',
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
      "Vegetarian and dietary options are essential, so plan a solid share of the spread as veg-friendly.",
      "Shorter events need less food, and these tables already assume a three-hour corporate format.",
      "Evening events tend to go through more food than lunch events, since guests arrive hungrier.",
      "Avoid foods that stain (red sauces, turmeric) - people are in work clothes.",
    ],
    foodBuyingGuide: "Corporate events require elevated finger foods. Think caprese skewers, shrimp cocktail, bruschetta, and elegant cheese boards. Avoid anything too casual or messy. Price the spread against your own caterer's rates, which vary far more than the quantities do.",
    proTips: [
      "Most corporate guests self-limit to 2 drinks max - don't over-order.",
      "Wine outsells beer 3:1 at corporate events - flip your usual ratio.",
      "Many corporate guests leave within the first ninety minutes, and the early stretch is the busiest.",
      "Weekday events tend to run lighter than Friday events, when guests are in less of a hurry to leave.",
      "Always have premium non-alcoholic options prominently displayed.",
    ],
    buyingGuide: "Focus on quality over quantity for corporate events. Stock premium wines and craft options rather than bulk quantities. Have elegant non-alcoholic options visible - many professionals choose not to drink at work functions. A sophisticated sparkling water with citrus is always appreciated.",
  },
  {
    id: 'birthday',
    name: 'Birthday Party',
    pluralName: 'Birthday parties',
    lowerName: 'birthday party',
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
      "Cake takes the edge off everyone's appetite, so factor that into the rest of your planning.",
      "Kids' birthday parties need less food per person, since attention spans are shorter than appetites.",
      "Adult milestone birthdays (30, 40, 50) eat more - people linger longer.",
      "Late-night birthdays need late-night food - pizza arrives around 10pm.",
      "Set up food before activities and cake - people graze while waiting.",
    ],
    foodBuyingGuide: "Birthday party food depends heavily on the age group. Kids' parties: pizza and simple finger foods. Young adult birthdays: pizza, wings, and shareable platters. 40+ birthdays: more sophisticated appetizers and seated options.",
    proTips: [
      "Milestone birthdays such as a 21st, 30th, 40th or 50th tend to run heavier than an ordinary one.",
      "Birthday parties call for more shots than most other events, so keep shooters in the mix.",
      "Drinking slows noticeably during cake and presents, so expect a quiet stretch mid-party.",
      "Know your crowd's age. A younger group leans toward beer, while an older one leans toward wine.",
      "Consider a signature 'birthday cocktail' to make the guest of honor feel special.",
    ],
    buyingGuide: "Birthday parties vary wildly by age group. For 21-35, stock up on beer and mixers for cocktails. For 40+, increase your wine selection. Always have extra for milestone birthdays - people celebrate harder at 30, 40, and 50.",
  },
  {
    id: 'super-bowl',
    name: 'Super Bowl Party',
    pluralName: 'Super Bowl parties',
    lowerName: 'Super Bowl party',
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
      "Most of the food goes early in the game, so put the full spread out before kickoff.",
      "Wings are the #1 Super Bowl food - err on the side of too many.",
      "Set up a separate kids station if families are coming - they eat differently.",
      "Prep dips in slow cookers - they stay warm and free up oven space.",
      "Use halftime to refresh ALL food stations - you have exactly 25 minutes.",
    ],
    foodBuyingGuide: "Super Bowl is the biggest food day of the year after Thanksgiving. The table above sizes the wings and the pizza. Add chips and dip generously on top, since they are cheap and they go fast. Make everything shareable and easy to eat without utensils. Cold foods should stay cold, hot foods in warming trays or slow cookers.",
    proTips: [
      "Beer moves fastest early and again at the finish, so keep the coolers stocked from the first quarter on.",
      "Keep spare beer cold and ready. A game that runs to overtime can go through far more than expected.",
      "Use halftime to restock ALL coolers - you have exactly 25 minutes.",
      "Heavy food like wings and nachos slows drinking down, so a big spread stretches the bar further.",
      "Light beers disappear fastest - they're easier to drink during a 4-hour game.",
    ],
    buyingGuide: "This is a beer event, period. Stock 70% light/domestic beers and 30% craft/premium options. Have coolers pre-staged in multiple locations so guests can grab drinks without blocking the TV. Buy ice in bulk. It is the one supply worth over-buying, since a room full of coolers goes through more than seems reasonable.",
  },
  {
    id: 'holiday-party',
    name: 'Holiday Party',
    pluralName: 'Holiday parties',
    lowerName: 'holiday party',
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
      "Warm appetizers disappear faster than cold ones in winter, so plan accordingly.",
      "Dietary restrictions matter more at holidays - have vegetarian and gluten-free options clearly labeled.",
      "If it is a potluck, assume a fair number of guests will forget to bring anything.",
    ],
    foodBuyingGuide: "Holiday parties are about elevated comfort food. The table above sizes the appetizers for a cocktail-style party. Include a mix of hot and cold options, with at least one 'showstopper' like a cheese board or charcuterie spread.",
    proTips: [
      "Red wine outsells white 2:1 at winter holidays - adjust accordingly.",
      "Festive signature cocktails are expected - plan for mixers like cranberry juice and eggnog.",
      "Champagne on New Year's Eve goes almost entirely around midnight, so time your chilling for that window.",
      "Warm drinks like mulled wine and hot toddies are crowd pleasers in cold months.",
      "People drink more freely at a company holiday party than at an ordinary corporate event.",
    ],
    buyingGuide: "Holiday parties call for festive options. Stock extra red wine and have ingredients for 1-2 seasonal cocktails (mulled wine, spiked cider, or classic eggnog). For NYE specifically, double your champagne order and have everything chilled by 11pm.",
  },
  {
    id: 'wedding-shower',
    name: 'Wedding Shower',
    pluralName: 'Wedding showers',
    lowerName: 'wedding shower',
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
      "Weight the spread toward savory, with a smaller run of sweets alongside it.",
      "Presentation matters more than quantity - use tiered trays and beautiful serving pieces.",
      "Dietary accommodations are essential - have vegetarian and gluten-free clearly labeled.",
    ],
    foodBuyingGuide: "Bridal showers call for elegant finger foods. Think tea sandwiches, fresh fruit displays, cheese boards, and beautiful desserts. Price the spread against your own caterer's rates, which vary far more than the quantities do. Avoid anything messy or requiring utensils.",
    proTips: [
      "Mimosa bars are the gold standard. The table sizes the sparkling; add orange juice and peach nectar for variety.",
      "Skip heavy reds. Lean toward whites and rosé such as Pinot Grigio or Sauvignon Blanc, plus a light Pinot Noir.",
      "Create one signature cocktail such as an Aperol Spritz or a French 75, and batch it ahead of time.",
      "A good share of guests will not drink alcohol. Offer elegant non-alcoholic options like mocktails or sparkling water.",
      "Afternoon timing means lower consumption - most guests have 1-2 drinks max.",
    ],
    buyingGuide: "The table above sizes the bar for a short afternoon shower. Champagne and wine dominate the mix, so weight the order toward sparkling for mimosas with wine close behind. Buy 10-15% extra; unopened bottles can be returned or saved for the wedding. Prosecco is cost-effective for mimosas; save real Champagne for the toast.",
  },
  // ============================================================================
  // NEW EVENT TYPES FOR SEASONAL LANDING PAGES
  // ============================================================================
  {
    id: 'march-madness',
    name: 'March Madness Party',
    pluralName: 'March Madness parties',
    lowerName: 'March Madness party',
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
      "Overtime games run long and hungry, so keep backup food ready to go.",
      "Multiple TV setups mean multiple food stations - don't make people miss the game.",
    ],
    foodBuyingGuide: "March Madness is similar to Super Bowl but spread over multiple games. Wings, pizza, and shareable appetizers are ideal. The table above sizes the wings and the pizza for a full game session.",
    proTips: [
      "Games run back-to-back during opening weekend - people may stay 6-8 hours.",
      "Stock light beers for marathon watching sessions.",
      "Multiple games mean multiple peaks - don't front-load everything.",
      "Have non-alcoholic options for designated drivers and early bracket busts.",
      "Weekend games tend to run heavier than weekday games, since nobody is heading back to work.",
    ],
    buyingGuide: "March Madness parties are beer-heavy but lighter than Super Bowl (longer duration, people pace themselves). Stock 70% light beers. Have coolers at every TV location. The table above sizes the beer for a full tournament session.",
  },
  {
    id: 'fourth-of-july',
    name: '4th of July Party',
    pluralName: '4th of July parties',
    lowerName: '4th of July party',
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
      "Hot weather means lighter appetites, so trim food quantities a little from an indoor plan.",
      "Keep cold foods cold - refresh ice every 90 minutes in summer heat.",
      "Fireworks timing matters - have lighter snacks for after dark.",
      "Patriotic presentation adds to the fun - use themed plates and decorations.",
    ],
    foodBuyingGuide: "4th of July is about grilled meats and outdoor eating. The table above sizes the pulled pork, and buns and sides scale alongside it. Keep everything fresh with plenty of ice. Watermelon and cold sides are essential in summer heat.",
    proTips: [
      "Outdoor heat pushes beer consumption up, so buy more than you would for an indoor party.",
      "Ice melts fast in July. Buy more than seems reasonable and keep backup bags in the freezer.",
      "Coolers kept in the shade hold their ice far longer than those sitting in direct sun.",
      "Red, white, and blue cocktails are a fun addition to the bar.",
      "People drink less after sunset when fireworks start - front-load your ice.",
    ],
    buyingGuide: "This is a daytime outdoor beer event. Stock heavily on light, refreshing beers and have plenty of ice. Mixed drinks with vodka and lemonade or margaritas are popular. The table above sizes the bar for a full afternoon outdoors.",
  },
  {
    id: 'labor-day',
    name: 'Labor Day Party',
    pluralName: 'Labor Day parties',
    lowerName: 'Labor Day party',
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
    buyingGuide: "Similar to 4th of July but slightly higher consumption as people celebrate the end of summer. The table above sizes the bar, and beer carries most of it.",
  },
  {
    id: 'halloween',
    name: 'Halloween Party',
    pluralName: 'Halloween parties',
    lowerName: 'Halloween party',
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
      "Adult-only parties go through noticeably more than a family Halloween event does.",
    ],
    buyingGuide: "Halloween parties are cocktail-heavy. The table above sizes the spirits, and batching one or two specialty cocktails is the easiest way to serve them. Red wine fits the theme well. Have themed cups and garnishes.",
  },
  {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    pluralName: 'Thanksgiving dinners',
    lowerName: 'Thanksgiving',
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
      "Turkey is sized by weight per guest, and a bone-in bird weighs more than it actually serves.",
      "Appetizers before dinner should stay light, since the meal is the point.",
      "Count side dishes for the table as a whole, not for each guest.",
      "Dessert is non-negotiable - 1 pie per 6-8 guests.",
      "Leftovers are part of Thanksgiving - plan for turkey sandwiches.",
    ],
    foodBuyingGuide: "Thanksgiving is about the traditional spread: turkey, stuffing, mashed potatoes, gravy, cranberry sauce, and pie. Light appetizers before dinner only. Plan for leftovers!",
    proTips: [
      "Wine consumption peaks during dinner - have bottles ready at the table.",
      "Pre-dinner cocktails should be light so people can enjoy the meal.",
      "After-dinner drinks (port, brandy) are a nice touch.",
      "Football watching = beer in the afternoon before dinner.",
      "Designated drivers are essential - plan non-alcoholic options.",
    ],
    buyingGuide: "Thanksgiving is wine-heavy with the meal. The table above sizes the wine for the meal. Have a light cocktail option for pre-dinner and maybe some beer for football watching. Keep it classy.",
  },
  {
    id: 'new-years-eve',
    name: "New Year's Eve Party",
    pluralName: "New Year's Eve parties",
    lowerName: "New Year's Eve party",
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
    foodBuyingGuide: "NYE is about elegant appetizers and champagne. The table above sizes the appetizers for the main event. Add late-night snacks for after midnight on top of that. End with something sweet.",
    proTips: [
      "Champagne goes almost entirely in the window around midnight, so time your chilling for the countdown.",
      "Have champagne COLD and ready to pour at 11:55pm.",
      "People pace themselves until 10pm then drinking accelerates.",
      "Late-night parties need designated drivers or Uber - plan ahead.",
      "Noisemakers and party favors should be near the champagne station.",
    ],
    buyingGuide: "This is THE champagne event. The champagne page gives a separate toast figure, one flute per guest, on top of what the bar needs for cocktails like a French 75 or Kir Royale. Have regular bar options for earlier in the evening. Stock more than you think - better to have leftovers than run out at midnight.",
  },
];

export const getEventById = (id: string): ExtendedEventType | undefined => {
  return events.find(event => event.id === id);
};
