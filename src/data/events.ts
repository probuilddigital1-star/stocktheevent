import type { EventType } from '../lib/types';

export const events: EventType[] = [
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
    proTips: [
      "Mimosa bars are the gold standard. Stock 1 bottle of sparkling per 3 guests, plus orange juice and peach nectar for variety.",
      "Skip heavy reds. Go 70% white/ros\u00e9 (Pinot Grigio, Sauvignon Blanc) and 30% light red (Pinot Noir).",
      "Create one signature cocktail (Aperol Spritz, French 75) and batch it ahead of time - plan 2 servings per guest.",
      "25-30% of guests won't drink alcohol. Offer elegant non-alcoholic options like mocktails or flavored sparkling water.",
      "Afternoon timing means lower consumption - most guests have 1-2 drinks max.",
    ],
    buyingGuide: "For a 2-3 hour afternoon shower, plan for 1.3 drinks per guest. Champagne and wine dominate - stock 1 bottle of sparkling per 3 guests for mimosas, plus 1 wine bottle per 2 drinking guests. Buy 10-15% extra; unopened bottles can be returned or saved for the wedding. Prosecco is cost-effective for mimosas; save real Champagne for the toast.",
  },
];

export const getEventById = (id: string): EventType | undefined => {
  return events.find(event => event.id === id);
};
