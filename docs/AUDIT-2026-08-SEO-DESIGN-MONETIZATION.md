# StockTheEvent Audit: SEO, Design, Monetization

Date: August 24, 2026 (updated the same evening with Search Console and Cloudflare data)
Scope: stocktheevent.com (live) and the `stocktheevent` repo (Astro 5, Tailwind 4, Cloudflare Pages)

## The short version

The analytics change the order of work. The site has almost no real visitors (about 50 US visits in the last 30 days; the other 1,590 are bot traffic from China and Singapore), Google has indexed about 105 of its 2,037 pages and treats most of those as copies of each other, and several of the indexed URLs are the redirecting non-www versions. So this is not an under-monetized site yet; it is an un-indexed one. Nothing in the monetization section matters until that changes, and the fixes below are ordered accordingly.

1. **Google has indexed about 5 percent of the site and calls the rest "very similar."** A `site:` search returns about 105 URLs, and without the duplicate filter Google shows only 17 distinct results before saying it "omitted some entries very similar to the 17 already displayed." A new domain with no links gets a small crawl budget, and 2,000 pages that differ by one number spend it on duplicates. The fix is a staged index (about 880 pages first, the rest `noindex` until those are in) plus content that makes each page different.
2. **Every calculator page gives Google the wrong address for itself, and Google believed it.** The canonical on 1,834 pages points to a URL that redirects; the 728 drink pages point to the non-www domain, which redirects twice. Google indexed the non-www versions for the calculator pages it did keep. It comes from two lines in the generator scripts, and the build overwrites any hand fix on every deploy.
3. **The headline number on every single-drink page is about five times what every other source says.** "109 bottles of wine for a 100-guest wedding" assumes wine is the only drink served. The Knot says 20 bottles for the same party (with a full bar), and the common rule of thumb (one bottle per two guests) gives 50. That is why nobody links to these pages and why a searcher leaves. Your own event splits already contain the fix.

Then, once traffic exists: the site earns nothing on the thing it recommends (no ads, no affiliate link on the alcohol, only Amazon search links for cups and corkscrews at 3 percent). Also: 1 MB of web fonts per page load, a 6 MB social share image, roughly 600 pages that say "Birthday Partys", a Cinco de Mayo page titled "Holiday Party" in every H2, and no event analytics.

## What the analytics say

Three sources, read together on August 24:

| Source | What it shows | Reading |
|---|---|---|
| Cloudflare Web Analytics, Jul 25 to Aug 24 | 1,640 visits. By country: China 1,500, Singapore 90, United States 50. Referrer: "None (direct)" for all 1,640. Browser: "Unknown" 1,800. Host: `stocktheevent.com` (apex) 1,500 vs `www` 900. Top paths after `/`: four calculator pages at exactly 30 visits each, one of them a noindexed 10-guest page. | About 97 percent is bot traffic hitting the apex domain with no referrer and no identifiable browser. Real human traffic is roughly 50 visits a month, one or two a day. |
| Search Console export | Time range "Last 24 hours": 0 clicks, 0 impressions, empty Queries and Pages tables. | A day with zero impressions across 2,037 URLs means the site is not ranking for anything, not even its own name. (The export is the default 24-hour view; the 16-month view will show more, see below.) |
| Google `site:stocktheevent.com` | "About 105 results." Unfiltered, Google shows 17 distinct results, then notes it omitted entries "very similar" to them. Indexed calculator URLs appear as `https://stocktheevent.com/wine-for-wedding-shower-250-guests` (no www, the version that redirects). Indexed hubs: home, `/food/`, `/calculators`, `/about`, `/privacy/`, one party page, one bar-setup page. | About 5 percent of the site is indexed, Google considers the calculator pages duplicates of each other, and the canonical bug is visible in the index itself. |

Two things to pull from Search Console next, because they turn this from a diagnosis into a page list:

1. Performance, date range "Last 16 months", export (Queries and Pages). Even a few hundred impressions will show which events and guest counts Google is willing to show.
2. Indexing, then Pages: the "Why pages aren't indexed" table. The counts for "Crawled, currently not indexed", "Discovered, currently not indexed", "Duplicate, Google chose different canonical than user", and "Page with redirect" tell us whether the problem is budget, quality, or the canonical bug, and the staged plan in 1.0 adjusts to that.

One more thing the Cloudflare report shows: the bot traffic makes your own analytics unreadable and it is hammering the apex domain. Turn on Bot Fight Mode (free) and add a WAF rule that challenges traffic from countries the site does not serve. Googlebot and Bingbot crawl from the US and are unaffected.

## What I checked, and what I could not

Checked: all page templates and components in `src/`, both generator scripts, the data files, the built HTML in `dist/`, the live sitemap (2,037 URLs), the live site in Chrome (response headers, redirects, canonical tags, font payloads, the 404 on `/logo.png`, the 6 MB OG image), the Cloudflare Web Analytics report, the Search Console export, and a live `site:` search. Facts about ad networks, affiliate programs, and Google's structured-data changes come from current sources listed at the end.

Not checked: Search Console's Indexing report and 16-month performance data (see the two requests above), email list size, and Amazon Associates earnings. PageSpeed Insights would not complete from here, so performance numbers come from live network requests rather than a Lighthouse score. Mobile rendering was reviewed in code, not on a device.

## Page inventory (from the live sitemap)

| Section | URLs | Notes |
|---|---|---|
| Drink calculators (`/wine-for-wedding-100-guests/`) | 728 | 4 drinks x 13 events x 14 guest counts |
| Food calculators (`/food/pizza-for-...`) | 1,092 | 6 foods x 13 events x 14 guest counts |
| Bar setup (`/bar-setup/wedding-100-guests/`) | 182 | 13 events x 14 guest counts, full-bar pages |
| Seasonal party pages (`/party/...`) | 14 | Hand-written, all titled "... 2026" |
| Category hubs (`/calculators/...`, `/food/`) | 19 | Card grids, no unique content |
| Home, About | 2 | |
| **Total** | **2,037** | 260 of these carry `noindex` (10 and 15 guests) but are still in the sitemap |

---

## Part 1: SEO

### 1.0 Get indexed first: a staged index, not 2,037 pages at once (critical, half a day plus waiting)

Google has kept about 105 of 2,037 URLs and says the rest are "very similar." That is the expected result for a new domain with no links and 1,820 pages that differ by one number. The way through is to ask for less and make each page earn its place:

1. **Stage 1 (now): index the six guest counts people actually search for.** Keep 25, 50, 75, 100, 150, and 200 indexable. They are already the rows in your quick-reference table and the buttons on the party pages. Set `noindex, follow` on 10, 15, 20, 30, 40, 125, 250, and 300 for drink, food, and bar-setup pages. The pages stay live and linked (the on-page guest stepper in 2.4 makes them reachable without a search engine), they just stop competing for budget. That leaves about 880 indexable URLs: 312 drink, 468 food, 78 bar-setup, 19 hubs, 14 party pages, home and about. The sitemap should contain exactly those.
2. **Make the remaining pages different from each other.** The visible FAQ (1.5), the full-bar versus only-drink numbers (1.6), a cost estimate at two price points, and ice, glass, and cooler math are all page-specific numbers. Together they are what turns "very similar" into "distinct."
3. **Fix the canonicals (1.1) in the same deploy**, then in Search Console request indexing for the 19 hubs and the 20 most valuable pages (wedding, birthday, Super Bowl, graduation at 50, 100, 150 guests), and use "Validate fix" on the duplicate and redirect reports.
4. **Give Google a reason to come back:** links (see 1.13), a monthly rebuild so `lastmod` moves, and Cloudflare Crawler Hints (Caching, Configuration), which pings Bing and others through IndexNow at no cost. Also add the site to Bing Webmaster Tools (it imports from Search Console in one click); Bing indexes new sites faster and DuckDuckGo uses its index.
5. **Stage 2 (when Search Console shows 70 percent or more of Stage 1 indexed, likely 6 to 8 weeks):** open 20, 30, 40, and 125. **Stage 3:** 250 and 300, if the 200-guest pages are getting impressions. The gate is data, not a date.

Set expectations: even done well, this is a two-to-three-month process for a domain this new. The work in Parts 2 and 3 is worth doing in the meantime, but traffic will follow indexing, not the other way round.

### 1.1 Canonical tags point at redirecting URLs (critical, ~1 hour to fix)

What is happening, verified live on August 24:

| Page type | Canonical in the HTML | URL that actually serves | Redirect hops |
|---|---|---|---|
| Drink calculators (728) | `https://stocktheevent.com/wine-for-wedding-100-guests` | `https://www.stocktheevent.com/wine-for-wedding-100-guests/` | 2 (apex to www, then trailing slash) |
| Food calculators (1,092) | `https://www.stocktheevent.com/food/pizza-for-...` (no slash) | `.../food/pizza-for-.../` | 1 |
| Seasonal party pages (14) | `.../party/cinco-de-mayo-party-calculator` (no slash) | `.../party/cinco-de-mayo-party-calculator/` | 1 |
| Bar setup, category hubs, home, about | Correct (www, trailing slash) | same | 0 |

Meanwhile the sitemap lists all 2,037 URLs with `www` and a trailing slash. So for 1,834 pages Google receives three signals: the sitemap says one URL, the canonical says another, and the canonical URL itself redirects to the first one. Google usually sorts this out, but it costs crawl budget on a 2,000-page site, and it is exactly the pattern behind "Duplicate, Google chose different canonical than user" and "Page with redirect" reports in Search Console.

Root cause:

- `scripts/generateData.ts` line 302: `canonicalUrl: \`https://stocktheevent.com/${slug}\`` (no www, no slash).
- `scripts/generateFoodData.ts` line 329: same pattern for food.
- `package.json` runs `npm run generate` (drink data only) before every build, so the JSON in the repo (which was hand-corrected to `www`) gets overwritten on each deploy. That is why the live drink pages disagree with the JSON files on your disk. Food data is never regenerated at build, which is why food pages still have `www` but no slash.
- Cloudflare Pages serves `slug/index.html` at `/slug/` and 308-redirects `/slug` to `/slug/`. Astro's `trailingSlash` setting alone does not change this for static output.

Fix (keep the URLs Google already knows, which are the trailing-slash versions):

1. Stop storing canonical URLs in JSON. In `BaseLayout.astro`, derive it: `new URL(Astro.url.pathname, Astro.site).href` with a trailing slash guaranteed. Remove the `canonicalUrl` prop from every page that passes it.
2. Set `trailingSlash: 'always'` in `astro.config.mjs` so dev and prod match.
3. Add a trailing slash to every internal link (DrinkSwitcher, RelatedPages, quick-reference tables, breadcrumbs, nav, footer, calculator CTA). Today every internal click on the site goes through a 308.
4. Add `generateFoodData` to the `generate` script so food data cannot drift from code again.

### 1.2 Sitemap lists 260 noindexed pages and has no `lastmod` (high, 20 minutes)

The 10-guest and 15-guest calculator pages carry `<meta name="robots" content="noindex, follow">` (good call) but are still in `sitemap-0.xml`. Google treats that as a mixed signal and it wastes crawl budget. Extend the sitemap `filter` in `astro.config.mjs` to exclude `-10-guests` and `-15-guests`, and add `lastmod` (the sitemap integration supports it) so Google can prioritize recrawling pages you change.

Also apply the same `noindex` rule to `/bar-setup/*-10-guests/` and `-15-guests/`; those 26 pages are indexable today.

### 1.3 `/logo.png` is a 404 and it is referenced on every page (high, 10 minutes)

`BaseLayout.astro` puts `https://www.stocktheevent.com/logo.png` in the Organization schema. The file does not exist (`public/` only has `favicon.svg`, `og-default.png`, `robots.txt`, `_redirects`). Add a real logo (PNG, at least 112x112) and while you are there fill in `sameAs` (any social profiles) so the Organization entity is not empty.

### 1.4 Breadcrumbs link to pages that do not exist (medium, 15 minutes)

`AnswerHero.astro` and the breadcrumb schema in `[slug].astro` link to `/calculators?item=wine` and `/calculators?event=wedding`. `calculators.astro` is static and ignores the query string, so these are just `/calculators/` with a redirect on top. The real hubs exist at `/calculators/wine/` and `/calculators/wedding/`. Point the visible breadcrumbs and the `BreadcrumbList` schema there. The footer "Beer Calculators" and "Wine Calculators" links have the same problem. On food pages the third and fourth breadcrumb items both point at the page itself; make item three the food hub once it exists (see 1.7).

### 1.5 The FAQ content exists only inside schema, not on the page (high, 1 hour)

Each calculator page generates six good question-and-answer pairs (`faqSchema` in `[slug].astro` and `food/[slug].astro`) but never renders them. Two problems: Google's structured-data guidelines say not to mark up content that is not visible on the page, and, more importantly, you are throwing away the most page-specific text you have. Render the six Q&As as a visible "Questions about [drink] for [event]" section above the related links. Keep the JSON-LD if you like, but note that FAQ rich results were removed from Google Search entirely on May 7, 2026, and HowTo rich results were dropped in 2023, so neither schema produces a visual result anymore. The visible text is what matters now.

### 1.6 The answer people search for is not the answer the page gives (critical for engagement, 1 to 2 days)

Your model is reasonable: 1.5 drinks per hour, 70 to 80 percent of guests drinking, a decay curve, a 15 percent buffer. The total comes to about 4.7 drinks per guest for a 5-hour wedding, close to The Knot's "one drink per hour, about five per evening." The problem is that each single-drink page assigns all of those drinks to one beverage:

| Source | Wine for a 100-guest wedding |
|---|---|
| stocktheevent.com | 109 bottles (4.7 glasses per person) |
| The Knot (updated Sept 2025) | 20 bottles (10 red, 8 white, 2 specialty), plus 17 champagne, 11 liquor, 100 beers |
| Common rule of thumb | 1 bottle per 2 guests = 50 bottles |
| Your own wedding split (wine is 37.5% of a four-drink bar) applied to your model | about 41 bottles with buffer |

Searchers comparing sources see 109 next to 20 and 50 and assume the site is wrong. That shows up as bounces and short visits on the pages that matter most. The fix is already in your data (`EVENT_SPLITS` in `InteractiveCalculator.astro`):

- Make the primary answer "as part of a full bar for this event" (share-weighted, no variety multiplier). For wine at a 100-guest wedding that is about 41 bottles (177 glasses).
- Show the current number as a secondary line: "If wine is the only alcohol you serve: 109 bottles."
- Update `meta.title` and `meta.description` to the primary number, and update the quick-reference table and the FAQ answers to match.
- Say plainly on the About page how the model compares to the one-drink-per-hour rule and why.

While you are in the model: the bar-setup pages multiply the full-bar total by 1.6 (`VARIETY_FACTORS[4]`), which puts the four-drink wedding at roughly 60 percent more alcohol than the single-drink pages already assume. That multiplier needs a justification on the page or it needs to go.

### 1.7 Category hubs are card grids with no content (high, half a day)

`/calculators/wine/` is a 200 KB page of 182 identical cards ("Wedding, 100 guests"), including links to the 28 noindexed pages. `/food/` has no per-food hubs at all; "Pizza Calculators" links straight to the 50-guest birthday leaf page. These hubs are your best shot at the broad queries ("wine calculator for party", "how much pizza for a party", "wedding alcohol calculator") because they can carry real content:

- An opening section that answers the broad question in plain numbers (one bottle per two guests, etc.).
- One table per hub: events down the side, six key guest counts across, each cell a link. That is 78 links in a form people can actually read.
- Per-event notes pulled from the existing `proTips` and `buyingGuide` text.
- Exclude noindexed guest counts from the grid.
- Add `/food/pizza/`, `/food/wings/`, and so on, mirroring `/calculators/[category]`.

### 1.8 Bar-setup pages are your best pages and they are hidden (high, 1 day)

"Wedding alcohol calculator" and "how much alcohol for a party of 50" are the real high-intent queries, and the full-bar pages are the honest answer to them. Today they are titled "Complete Bar for Wedding (100 guests) | StockTheEvent", they are not in the navigation, they are not linked from the drink pages except through a banner that only appears with a query string, and they have a bug: `EVENT_SPLITS` in `bar-setup/[...slug].astro` only defines 7 events, so 4th of July, Halloween, Thanksgiving, March Madness, Labor Day, and New Year's Eve fall back to the wedding split. The live 4th of July bar-setup page recommends 33 bottles of wine and 11 cases of beer for 100 guests, while the homepage calculator (which has all 14 splits) says beer should be 65 percent of that party.

Fix: share the split table from one module (`src/data/eventSplits.ts`) so the homepage, bar-setup, and single-drink pages all agree. Retitle bar-setup pages "[Event] Alcohol Calculator: [N] Guests (Wine, Beer, Spirits, Champagne)". Add "Full Bar" to the nav and a "Planning a full bar?" link on every single-drink page. Apply `noindex` at 10 and 15 guests like the other templates.

### 1.9 Content quality and trust signals (high, 1 day)

- **Grammar baked into ~600 pages.** `generateData.ts` line 163 writes `${event.name}s`, producing "Birthday Partys typically consume 10% more beer", "Holiday Partys", "Thanksgivings", on every drink page for those events, and the same text is inside the HowTo schema. Food titles and H1s read "How Much Pizza for a 50 Guests Birthday Party?" (should be "50-Guest").
- **Seasonal pages leak the base event name.** The Cinco de Mayo page's H2s read "Complete Holiday Party Calculators", "Holiday Party Essentials", "Ready to Plan Your Holiday Party?", and its FAQ schema asks "How much food do I need for a 50 person Holiday Party?". St. Patrick's Day and Easter have the same problem; Memorial Day says "Labor Day Party"; Tailgate says "Super Bowl Party". Use `seasonalEvent.title` for headings, not `baseEvent.name`.
- **Invented statistics presented as quotes.** The tip cards are styled as quotations under an "Editorial Curation" label: "40% of all alcohol is consumed during cocktail hour", "Birthday parties have 3x more shots than any other event type", "Parents of graduates drink about 30% less than the graduate's friends." None of these have a source. Google's quality guidance and its reviewers look for exactly this, and a reader who knows the topic will notice. Rewrite as hedged guidance ("expect the first hour to be the heaviest; front-load ice and staff") and drop the quotation styling.
- **"30+ years of experience", "Trusted by Event Planners", and a `Person` schema for a "StockTheEvent Team".** There is no named person anywhere on the site. Put your own name on it (Zachary Pearson, ProBuild Digital), explain how the formula was built and what it was checked against (The Knot, the one-drink-per-hour convention, standard pour sizes), and replace the fictional Person schema with a real one. A short "Methodology and sources" page linked from every calculator would do more for trust than any of the current badges.
- **Stale and inconsistent counts.** Homepage: "336 drink + event + guest combinations" and "1,820+ calculators". Footer: "2,000+ calculators ready". Calculator page CTA: "Browse All 336 Calculators". Pick one number and compute it from the data.

### 1.10 Titles that age (medium, 2 hours)

All 14 seasonal pages hardcode "2026" in the title, meta title, and H1 ("Super Bowl Party Calculator 2026"). Either drop the year (it is not helping for evergreen holiday queries) or generate it from the build date and trigger a monthly rebuild with a Cloudflare Pages deploy hook from n8n. The same rebuild can drive the "Seasonal" nav link, which currently points to March Madness year-round; pick the next upcoming event from `peakMonths` at build time.

### 1.11 Measurement (high, 2 hours)

The only analytics on the site is Cloudflare Web Analytics, which counts page views and nothing else. Your PRD's success metrics (calculator completions, email capture rate, time on page) cannot be measured today. Add PostHog (you already use it) or GA4 with these events: `calculator_result` (drink, event, guests, duration), `breakdown_click`, `affiliate_click` (with the product key), `email_submit` (with source), `copy_list`, `print_list`. Also confirm the site is verified in Search Console with the sitemap submitted; that is where the canonical problems above will show up as they clear.

### 1.12 Smaller technical items

- HTML is served with `Cache-Control: public, max-age=2678400` (31 days). That is almost certainly the zone's Browser Cache TTL setting in Cloudflare, since there is no `_headers` file. Returning visitors can see month-old pages after you deploy fixes. Set Browser Cache TTL to "Respect existing headers" and add a `public/_headers` file: HTML `max-age=0, must-revalidate`; `/_astro/*` `max-age=31536000, immutable`.
- The homepage CTA builds links like `/wine-for-wedding-100-guests?guests=97&duration=5`. Harmless with a correct canonical, but consider `history.replaceState` so those variants never become crawlable URLs.
- The quick-reference table only highlights "(you)" when the page's guest count is one of 25/50/75/100/150/200; pages for 30, 40, 125, 250, and 300 guests show no highlighted row. Include the page's own count in the table.
- `README.md` is still the Astro starter template. Not an SEO issue, but it is the first thing anyone (including a future Claude Code session) reads.

### 1.13 Links and distribution: nobody can find a site nobody links to (high, ongoing)

The index numbers say the domain has little or no link authority, and a calculator with numbers five times off (1.6) is not something a wedding blogger cites. Once the numbers are defensible, these are the channels that fit this site, in order of effort:

- **An embeddable calculator widget.** A one-line `<iframe>` or script embed of the interactive calculator, offered free to wedding planners, venues, party rental companies, and food bloggers, with a "Powered by StockTheEvent" link. Calculators are one of the few content types other sites embed and link to. Start with the local businesses you already talk to (venues and caterers around Ashtabula and Cleveland), then wedding planning blogs.
- **Pinterest.** Party planning is a Pinterest-first topic, and the per-page share images (2.2, "109 bottles of wine for 100 guests" as a card) are pins. Fourteen seasonal pages plus the hubs give a year of content; pin the guest-count cards in the weeks before each holiday.
- **Answer real questions.** Reddit (r/weddingplanning, r/Cooking, r/AskCulinary), Facebook party-planning groups, and Quora questions about "how much alcohol for a party" get asked weekly. Answer with the number and the reasoning, link the specific page.
- **Cross-links you already own.** freezerbatchcocktails.com already links here; add a contextual link from thepizzadoughformula.com (party pizza math) and any other portfolio site where it is a natural fit.
- **A short methodology page with your name on it (1.9)** is what makes the other three work; bloggers link to people, not to "StockTheEvent Team".

---

## Part 2: Design, UX, and performance

The "Golden Hour" system on the homepage and drink pages is the most finished part of the site, and it is still the reason the site reads as generated. The specific tells, the two directions that fix them, and a build prompt are below; the mockups are on their own canvas: https://claude.ai/code/artifact/2b4acae1-9e2a-4cfa-8603-3a48262ae3d2

### 2.0 Why it reads as templated

- **Emoji is the entire visual language.** A champagne-glass emoji is the logo, emoji are the product icons, every H2 starts with one, and every CTA band has a party popper. Emoji render differently on every device, cannot be recolored or sized consistently, and signal that nobody drew anything.
- **Gradient and glass on everything.** A sunset gradient answer card with glowing text, forest-gradient buttons, glass cards with backdrop blur, floating background blobs, "flourish corners", and a paper texture. Each one is a Tailwind default; stacked, they are the look people now recognize as generated on sight.
- **One component, used for everything: the rounded card that grows on hover.** Related links, occasions, trust badges, popular calculators, and the category pages (182 identical cards) all use it, so nothing has a hierarchy.
- **Three display fonts and no system.** Noto Serif, Manrope, and Space Grotesk, plus an icon font, plus tracked uppercase micro-labels on every card. Twenty-five font files a page is the performance cost; the visual cost is that nothing looks decided.
- **Trust theater.** "Trusted by Event Planners", "30+ Years Experience", an "Editorial Curation" label over tips styled as quotations with no source, and a Person schema for a team that does not exist. Readers who know the subject notice, and it undercuts the one thing the site has going for it, the printed arithmetic.
- **Marketing rhythm on what is a reference tool.** Every page ends in a full-width orange band asking "Planning a different event?", the homepage headline is "Plan the Perfect Party" (it could sit on any site), and everything is centered.
- **Two design systems.** Food, party, and bar-setup pages still use default Tailwind slate and orange, with their own answer card, their own math card, and their own shopping list.

What credible looks like for this site: a reference, not a landing page. The number is the hero, the arithmetic is the proof, tables beat cards, one accent color, two typefaces, icons that were drawn rather than typed, and a named person behind the numbers.

### 2.0a Direction A: Bar book (recommended to build first)

A reference manual. Nothing in it depends on photos you do not have yet, and it lands the "get indexed first" plan without waiting on a shoot.

| Token | Value |
|---|---|
| Paper, paper-2 | `#F5F6F3`, `#ECEEE9` |
| Ink, ink-2 | `#1B1F1D`, `#4B524E` |
| Rule | `#C7CDC8` |
| Accent, accent-soft | `#1F4D3A` (bottle green), `#E3EBE6` |
| Display type | Libre Caslon Text 400 and 700: H1 64/56 px, H2 32 to 34 px, item names 20 px |
| Text and numbers | Archivo 400/500/600: body 16 to 17 px, labels 12 px uppercase tracked 0.12em, big answer 148 px at weight 600 and width 105, all numbers tabular |
| Grid | 12 columns, 72 px margins at 1440, 32 px gutters; a 4-column section header beside 8 columns of content |
| Surfaces | None. Sections are separated by 1 px rules, not background bands; the only filled surfaces are the accent button and the selected state |
| Components | Ledger tables (uppercase th, 1 px rules, ink rule at the bottom of a total), bordered steppers with 44 px targets, square buttons with no radius, square checkboxes, line icons at 1.5 px stroke |
| Imagery | Line drawings of bottle, case, and glass as the illustration system; small still-life photos can come later without changing the layout |
| Motion | Focus states and a 150 ms color transition. No scale, no float, no glow, no page-load fades |

What the mockup shows: the calculator as a ledger on the homepage (inputs on the left, "Your bar" as a ruled table on the right), a rules-of-thumb table, a text index of occasions, the method with your name under it; a calculator page that leads with 41 bottles, shows 109 as the only-drink line, prints the six-line arithmetic, the by-guest-count table, a checklist shopping list with a "where to buy" box, three questions, and a nearby index; and the mobile version of that page.

### 2.0b Direction B: Editorial host

A magazine. Highest ceiling, and it is only as good as the photographs.

| Token | Value |
|---|---|
| White, ink, ink-2 | `#FBFAF8`, `#151312`, `#5A5450` |
| Rule | `#DAD5CF` |
| Accent | `#7A2E36` (oxblood) |
| Photo ground | `#1D2822` (the green wall) |
| Display type | Bodoni Moda 400/500: masthead uppercase tracked 0.12em, H1 72 to 88 px over photos, big answer 220 to 240 px, pull quotes in italic |
| Text | Karla 400/500/600, 16 to 17 px |
| Layout | Full-bleed photo bands with type over them, a calculator panel that overlaps the hero, four-up photo tiles for occasions, 7/5 and 8/4 splits, a dark footer |
| Imagery | 12 to 20 photographs: a hero still life (bottles and glassware on the green wall, wood table, warm side light), one shot per drink (4), one per food (6), occasion tiles (4 or more), a portrait |
| Motion | One reveal on the hero (photo fade, headline rise). Nothing else |

The mockup shows the homepage and the same calculator page in this treatment. Every dark block marked YOUR PHOTO is a shot you would need; until they exist the site would look unfinished, which is the real cost of this direction.

### 2.0c How to choose, and a way to have both

Both directions share the same page structure and the same components, so the honest recommendation is to build A now and treat B as a second pass: shoot photos over the fall, and if they are good, swap the type pair, the accent, and add the photo bands without rebuilding a single page. If you already know you want B, commit to the shot list first and build B directly; the prompt below takes a direction flag.

### 2.1 One megabyte of fonts per page (critical for mobile, half a day)

Verified on a live page load: 25 font files from fonts.gstatic.com totaling about 1.06 MB. The breakdown:

- Material Symbols Outlined: 320 KB for roughly ten icons (`info`, `arrow_forward`, `content_copy`, `print`, `mail`, `check`, four drink icons). The comment in `BaseLayout.astro` says "subsetted" but the URL does not subset.
- Noto Serif: multiple 60 to 187 KB files, because the Google Fonts CSS ships every script subset and the page's characters (curly quotes, multiplication signs, emoji) pull several of them in.
- Manrope and Space Grotesk: another dozen files.

The HTML itself is 13 KB compressed and the CSS is 64 KB. Fonts are 80 percent of the page weight and they are render-blocking through two external CSS requests. Fix: self-host Latin-only WOFF2 subsets of Manrope (400/600/700) and Noto Serif (400/700 plus italic 400) in `public/fonts/` with `font-display: swap` and a `<link rel="preload">` for the two used above the fold; drop Space Grotesk (use Manrope with `font-variant-numeric: tabular-nums` for the big numbers); replace Material Symbols with inline SVGs (ten small paths in one Astro component). Expected result: about 90 KB of fonts instead of 1,060 KB, and no external CSS on the critical path. This is the change most likely to move your Core Web Vitals.

### 2.2 The share image is 6 MB (high, 15 minutes)

`public/og-default.png` is 6,064,156 bytes (it is the raw Gemini export). X, LinkedIn, and Slack cap share images around 5 MB, so previews likely fail there, and every scraper downloads 6 MB. Export a 1200x630 JPG or WebP under 300 KB. Per-page OG images with the drink, event, and number are a nice follow-up (Astro can generate them at build with satori or a Cloudflare Worker), since "109 bottles" is exactly the kind of image people share.

### 2.3 Two visual systems (folds into the redesign)

Drink calculator pages, the homepage, and the hubs use the Golden Hour tokens (`--chocolate`, `--champagne`, glass cards). Food pages, party pages, and bar-setup pages still use default Tailwind `slate-900`, `orange-500`, `bg-slate-50`, with a different answer card, a different math-breakdown card, and a different shopping list. The PRD's Phase 3 ("Content Pages") never shipped. Move the three remaining templates onto the shared `AnswerHero`, `MathBreakdown`, `ShoppingList`, and `RelatedPages` components (they are generic enough with a couple of props) so there is one design to maintain.

### 2.4 Let people change the guest count on the page (high, half a day)

The answer card is static. The code in `[slug].astro` already recalculates when `?guests=` is in the URL, but there is no control on the page for it. Add a compact stepper or number input on the answer card ("Guests: 100 [-] [+]", "Hours: 5") that recalculates live, updates the URL with `replaceState`, and updates the shopping list. That turns 1,800 static pages into 1,800 working calculators and should lift time on page and shopping-list use, which are the two things that drive affiliate clicks.

### 2.5 Interaction and accessibility details (medium, 2 hours)

- The header "Try Calculator" button links to `/`, which does nothing on the homepage. Scroll to `#calculator` there; on inner pages consider linking to the bar-setup page for the current event instead.
- The guest slider is a 0 to 100 range with a hidden piecewise mapping, so keyboard and screen-reader users hear "33.3" instead of "100 guests". Add `aria-valuetext` and a paired number input.
- `<label>` elements in the calculator are not associated with their controls (`for`/`id`), and the drink buttons have no `aria-pressed`.
- `--chocolate-40` is chocolate at 55 percent opacity on cream; several small labels ("PER PERSON", table footnotes) will fall under the 4.5:1 contrast ratio. Check them and bump to `--chocolate-light`.
- The food page's sticky "Switch food" bar uses `top-16` while the header is taller than 64 px on desktop, so the two overlap by a few pixels while scrolling.
- Pro tips render straight double quotes inside a serif face at 20 px; if you keep the quote treatment, use real curly quotes. If you drop it (see 1.9), this goes away.
- No real imagery anywhere. Emoji keeps the site fast, but one or two of your own photos (you already shoot bar and cocktail setups for freezerbatchcocktails.com) on the homepage and hubs would separate the site from every other calculator, and they double as OG images.

### 2.6 What already works and should stay

The answer-first layout, the step-by-step math (a real differentiator; keep it, just make the numbers defensible), the printable shopping list with copy/print/email, the reduced-motion support, the skip link, the font-metric fallbacks in `global.css`, and the drink switcher. Do not redesign these.

---

## Part 3: Monetization

**Read this part as a plan for later, not for this month.** With about 50 real visits a month, no ad network will pay anything and AdSense may reject the site as low-value content; an application now costs a rejection you would have to appeal later. The scaffolding (ad slots that render nothing until an env var is set, the tracking events, product-level links) is cheap to build alongside the SEO work, so the prompts stay. Apply to Journey by Mediavine when Search Console shows impressions climbing and Cloudflare shows about 1,000 real sessions a month; apply to Total Wine and Instacart when there are pages worth sending people from.

Today the site has one revenue path: Amazon Associates search links (`amazon.com/s?k=wine+glasses+party&tag=probuild20-20`) on accessories, at Amazon's 3 percent Kitchen rate with a 24-hour cookie. There are no ads, no link on the alcohol or the food itself, no product (digital or otherwise), and the email list has no visible follow-up. In rough order of return on effort, once there is traffic:

### 3.1 Display ads (start now; this is the largest gap)

There is no ad code on the site at all, which is unusual for a 2,000-page calculator property. The page layout has natural slots that do not hurt the experience: directly under the three stat cards, between the math breakdown and the quick-reference table, above the related-calculator grid, and an anchor unit on mobile.

- Under 1,000 sessions a month: Google AdSense (Auto ads off, three manual slots).
- At 1,000+ monthly sessions: Journey by Mediavine (70 percent revenue share, and it graduates you to full Mediavine at $5,000 annual ad revenue). Party and food content is a category these networks pay well for.
- At 25,000 monthly page views: Raptive (75 percent share) becomes an option.

Check your Cloudflare Web Analytics sessions before choosing. Whichever you pick, add a consent banner for EU visitors and update the privacy policy, which currently promises "anonymous analytics" only.

### 3.2 Monetize the alcohol itself (the big-ticket item on every page)

A 100-guest wedding page recommends 109 bottles of wine today (about 41 once the change in 1.6 ships). At $15 a bottle that is $700 to $1,600, and the page earns nothing on it. Drizly is gone (shut down in 2024). Current options:

| Program | Commission | Cookie | Notes |
|---|---|---|---|
| Total Wine & More (via FlexOffers) | 4% | 1 day | Largest US selection, in-store pickup for party volumes |
| ReserveBar (via FlexOffers) | 4% | 30 days | Premium spirits and champagne; good fit for NYE, weddings, corporate |
| Instacart | 3% | shoppable links | Same-day delivery, alcohol in many states; also covers ice, cups, food |
| Wine.com | listed on CJ and Impact; check current terms | | Case pricing; cases of 12 map cleanly to your bottle counts |

Add a "Where to buy it" block right under the shopping list: "You need 41 bottles (about 3½ cases). Order for pickup at Total Wine, or same-day delivery on Instacart." One conversion at 4 percent of a $1,200 order is $48, more than a month of cup sales. Availability is state-dependent, so word it as options rather than a single button.

### 3.3 Fix the Amazon links you already have (2 hours)

Every affiliate link goes to an Amazon search results page, which converts poorly and shows the visitor competitors' listings. Replace the search links with specific products (a curated ASIN per category in `affiliates.ts`), show them as small product cards with a one-line "why" instead of a tiny "Buy" pill, and use the shopping-list quantities to link to the right pack size ("140 wine glasses: two 72-packs"). Adding "Ice: 120 lbs" with no link is a missed line; link bag ice to Instacart and ice buckets or coolers to a specific product. Consider Amazon's OneLink or Geniuslink later if you see non-US traffic.

### 3.4 Email: capture more, and use it (1 day)

The form posts to an n8n webhook, which is a good setup. Two problems: the webhook is public with no bot protection (add Cloudflare Turnstile, free, to both forms), and there is no visible sequence after "Check your inbox". A three-email sequence pays for itself: (1) the shopping list plus a "where to buy" block with the affiliate links above, (2) a T-minus-1-week checklist (chill timeline, ice, glassware), (3) day-before reminders with a link back to the bar-setup page. Also add a proper lead magnet on non-list pages: a printable "Party Bar Setup Sheet" PDF beats "Get Tips".

### 3.5 A small paid product (2 to 3 days, later)

You already have the data for a "Complete Party Planning Kit": editable Google Sheet or PDF with every event's quantities, a shopping checklist, a timeline, and a budget calculator, sold at $9 to $19 through Lemon Squeezy or Gumroad, promoted from the shopping list and the email sequence. This is low effort given the generators, and it is insulated from ad-rate swings.

### 3.6 Later: lead generation and sponsorship

Your notes on directory and lead-gen layers apply here: bartender hire, mobile bar, and party rental quotes by city are natural next to a bar-setup page, and event rental companies pay for leads. This needs traffic first, so it belongs after 3.1 through 3.4. The cross-promotion to freezerbatchcocktails.com is good; add it on the spirits and cocktail-hour contexts, not only the homepage.

---

## Part 4: Bugs and content errors found

| # | Where | Problem | Fix |
|---|---|---|---|
| 1 | `scripts/generateData.ts:302`, `generateFoodData.ts:329` | Canonical base is `https://stocktheevent.com` (no www, no slash) | Derive canonical in BaseLayout (see 1.1) |
| 2 | `package.json` build script | Food data never regenerated at build; drink data overwritten each deploy | Run both generators in `generate` |
| 3 | `generateData.ts:163` | `${event.name}s` produces "Birthday Partys", "Thanksgivings" on ~600 pages and in HowTo schema | Add a `plural` field to each event |
| 4 | `generateFoodData.ts:326-328` | "for 50 Guests Birthday Party" in title and H1 | "for a 50-Guest Birthday Party" |
| 5 | `party/[eventSlug].astro` | H2s, FAQ schema, and CTA use `baseEvent.name` (Cinco de Mayo shows "Holiday Party", Memorial Day shows "Labor Day Party", Tailgate shows "Super Bowl Party") | Use the seasonal event's own name |
| 6 | `bar-setup/[...slug].astro` | `EVENT_SPLITS` has 7 of 14 events; seasonal events use the wedding split (wine-heavy 4th of July) | Single shared `eventSplits.ts` |
| 7 | `BaseLayout.astro` | Organization `logo` points to `/logo.png` (404); `sameAs` empty | Add logo file and profiles |
| 8 | `BaseLayout.astro`, `AnswerHero.astro`, `[slug].astro` | Links and schema to `/calculators?item=...` and `?event=...` (query ignored) | Link to `/calculators/{id}/` |
| 9 | `food/[slug].astro` breadcrumbs | Items 3 and 4 both point to the current page | Item 3 should be the food hub |
| 10 | `astro.config.mjs` sitemap filter | 260 noindexed pages included; no `lastmod` | Filter `-10-guests` and `-15-guests`; add `lastmod` |
| 11 | `bar-setup/[...slug].astro` | No `noindex` on 10 and 15 guest pages (26 pages) | Match the other templates |
| 12 | `public/og-default.png` | 6,064,156 bytes | Export 1200x630 under 300 KB |
| 13 | `BaseLayout.astro` fonts | ~1.06 MB across 25 files; icon font unsubsetted | Self-host Latin subsets; inline SVG icons |
| 14 | `[slug].astro` quick-reference table | "(you)" row missing on 30/40/125/250/300 pages | Include the page's own guest count |
| 15 | `index.astro`, footer, `[slug].astro` CTA | "336", "1,820+", "2,000+" calculators | Compute one number from data |
| 16 | `BaseLayout.astro` nav | "Seasonal" always links to March Madness | Pick next event by `peakMonths` at build |
| 17 | `seasonalEvents.ts` | "2026" hardcoded in 14 titles, meta titles, H1s | Drop the year or generate from build date |
| 18 | Cloudflare zone setting | HTML cached in browsers for 31 days | Browser Cache TTL: respect headers; add `_headers` |
| 19 | `EmailCapture.astro`, `ShoppingList.astro` | Public webhook with no bot check | Add Turnstile |
| 20 | `about.astro` | `Person` schema for a fictional "StockTheEvent Team" | Real author, or remove |

---

## Part 5: Execution plan

Decision: build Direction A (Bar book) now; add Direction B (Editorial host) as a layer later, once the photos exist. The prompts in Part 6 are ordered so nothing gets built twice: content and structure land first, the redesign restyles them once, and the monetization scaffolding is added to the new templates rather than the old ones. Prompt 3 from the earlier draft is retired; its font and icon work is inside Prompt 8, and the share-image resize moved into Prompt 1.

### The order

| # | Prompt | What ships | Model | Effort | How to run | Done when | Then, by hand |
|---|---|---|---|---|---|---|---|
| 0 | P0 Guardrails | `CLAUDE.md` with the rules and tokens, a real README, `npm run check` (dist inspector), branch `redesign-a` | `sonnet` | default | One session | The check table prints for the current build | Nothing; commit |
| 1 | P1 Technical SEO | Canonicals derived in BaseLayout, staged index (6 guest counts), sitemap of about 880 URLs with `lastmod`, trailing slashes everywhere, breadcrumbs to real hubs, logo, `_headers`, both generators in `generate`, OG image under 300 KB | `sonnet` | default | One session; ship alone | Every canonical is www plus slash; sitemap count about 880; no internal href without a slash; tests pass | Deploy. Cloudflare: Bot Fight Mode, challenge rule for CN and SG, Crawler Hints, Browser Cache TTL to "respect existing headers". Search Console: submit the sitemap, request indexing for the 19 hubs and top 20 pages, "Validate fix" on duplicate and redirect reports, export 16 months, screenshot the Indexing report. Add Bing Webmaster Tools |
| 2 | P2 Content model | Shared event splits, full-bar primary answer with only-drink secondary, visible FAQ, plurals, seasonal names, computed counts | `opus` | default | Plan mode first (`opusplan` does this), then execute | Tests pass; the reported numbers for wine-for-wedding-100 read 41 and 109; the 4th of July bar-setup page is beer-forward | Deploy; spot-check ten pages across drinks, food, party, bar-setup |
| 3 | P6 Hubs and structure | Real hub pages with tables and intros, food hubs, bar-setup retitled and in the nav, seasonal rotation, methodology page, author block | `opus` | default | Plan mode first; fan the 23 hub intros out to `sonnet` subagents, integrate in the main session | Word count of `/calculators/wine/` up from about 1,100 to 1,600 or more; no dead links in the build | Deploy; request indexing for every hub again |
| 4 | P8 Redesign, Direction A | Tokens, self-hosted Libre Caslon and Archivo, Icon.astro, ledger calculator, new header and footer, calculator pages on shared components, food, party, bar-setup, hubs, about, methodology, 404 on the same system, on-page stepper, accessibility fixes | `best` (Fable 5 on Max, otherwise Opus) | `xhigh` | Plan mode first; execute as five commits (tokens and fonts and icons; layout, header, footer; homepage; calculator pages; everything else); a read-only reviewer subagent runs the acceptance list at the end; a Ralph loop only on that acceptance list | Acceptance list in the prompt passes; Lighthouse accessibility 95 or higher on two pages; fonts under 150 KB | Deploy to the branch preview, compare with the mockups, then merge and deploy. Replace `og-default.png` with one in the new style |
| 5 | P5 Affiliates | Product catalog with ASIN placeholders, product cards, where-to-buy retailers, ice and bulk items linked, cross-promo component | `sonnet` | default | One session | Every affiliate destination listed by retailer | Apply to Total Wine and ReserveBar (FlexOffers) and Instacart; fill the ASINs; set `enabled` on approved retailers |
| 6 | P4 Measurement and forms | Ad slots that render nothing until an env var is set, PostHog events, Turnstile on both forms, privacy page, consent banner | `sonnet` | default | One session | Events visible in PostHog from a test session; forms reject a missing token | Create the PostHog project and Turnstile keys; add token verification to the n8n workflow; leave `PUBLIC_AD_NETWORK` at `none` |
| 7 | P7 Distribution | Embeddable calculator page and snippet, per-page share images | `sonnet` (switch to `opus` if the image build fights back) | default | One session | Embed page renders in an iframe on another origin; OG images generated under 150 KB each | Send the first 20 outreach emails (local venues and caterers first); set up a Pinterest board per seasonal event; answer questions on Reddit with specific pages |
| Gate | Stage 2 index | Open 20, 30, 40, 125 in `src/data/indexing.ts` | `sonnet` | default | Small edit | Sitemap count rises; Search Console shows Stage 1 mostly indexed first | Only when Search Console says so, likely 6 to 8 weeks after P1 |
| Gate | Monetize | Set the ad env var, add the consent banner, open Stage 3 | `sonnet` | default | Small edits | Real sessions pass about 1,000 a month | Apply to Journey by Mediavine; then the paid kit, photos, lead-gen |
| Later | P9 Direction B layer | Editorial tokens behind a build constant, photo bands, occasion tiles, dark footer, Bodoni and Karla, editorial share images | `opus` | default | Plan mode first; only after 8 or more photos from the shot list exist | Both design values build cleanly with no template changes | Shoot the list in the prompt; pick the direction per page by looking, not by rule |

Rough calendar: P0 and P1 in the first two days, P2 by the end of week one, P6 and P8 in weeks two and three, P5 through P7 in week four. Search Console will not show the effect of P1 for two to six weeks, so the redesign is worth doing while you wait, not instead of waiting.

### Which model, and why

Anthropic's own rule of thumb for Claude Code is to use a smaller model when the work is routine and you can describe the edit precisely, a larger one when the problem is hard (architecture, unfamiliar ground, subtle bugs), and to leave effort at the default unless the model skipped a file, did not run the tests, or did not double-check its work. Applied here:

- **`sonnet` for P0, P1, P4, P5, P7 and the gates.** Every one of them is a precise spec with a mechanical acceptance check. Sonnet 5 is the default on Pro and Team Standard, so this is also the cheap path.
- **`opus` for P2 and P6.** They involve judgment about copy and the content model, and they touch the generators, the data, and several templates at once.
- **`best` with `xhigh` effort for P8.** It is the longest multi-step run in the plan, it rewrites every template, and it has the most ways to drift. `best` resolves to Fable 5 where your account has it (Max, and premium Team and Enterprise seats, with a weekly cap) and to Opus otherwise. Use plan mode first so the migration order is agreed before any file changes.
- **`opusplan`** is a good default alias for the whole project if you do not want to switch by hand: Opus while planning, Sonnet while executing. Set `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` so delegated work (the reviewer, the hub-intro writers) does not bill at the top rate.

### Agents, loops, and parallel sessions

The short answer: run the core sequence one prompt at a time, in one session each, on the `redesign-a` branch, and commit after every prompt. Use subagents inside a session for two specific things, and do not run the sequence in parallel.

- **Why not parallel.** P1, P2, P6, and P8 all edit `BaseLayout.astro`, `[slug].astro`, `food/[slug].astro`, and the generators. Two sessions in worktrees would spend the saved time on merges, and the redesign in P8 rewrites whatever the other session touched. A WIP limit of one prompt in flight is the faster path here. After P8, P5, P4, and P7 touch mostly separate files and could run as two worktrees if you want, but as one person reviewing the diffs, one at a time is still faster.
- **Where subagents earn their place.** (1) The reviewer at the end of P8: a read-only agent that runs the acceptance greps, the tests, and Lighthouse and reports, so the implementing context does not grade its own work. (2) Fan-out for P6: 23 short hub intros (13 events, 4 drinks, 6 foods) written by parallel subagents from the same brief, then integrated by the main session. Neither needs a framework; the built-in Agent tool and a `CLAUDE.md` that carries the rules are enough.
- **Ralph loops.** The acceptance checks in P1 and P8 are grep and test based on purpose, so they work as loop exit criteria. Use a loop for the last mile of P8 ("iterate until `npm run check` and `npm test` pass and no template contains an emoji or a gradient"), not for the whole redesign; a loop with a huge brief drifts and burns tokens on re-reading its own output.
- **What the framework actually is.** `CLAUDE.md` (rules, tokens, commands), `npm run check` (the dist inspector from P0), the Playwright suite, and Cloudflare branch previews. Every session, subagent, and loop inherits the rules from the first two, and the third and fourth are the gates. That is the whole system; anything heavier is overhead for a repo this size.
- **Context hygiene.** Start each prompt in a fresh session (or `/clear`), paste the prompt whole, and let plan mode read the repo first. Keep `CLAUDE.md` under about 150 lines so it stays in every context window.

## Part 6: Claude Code prompts

Each prompt is self-contained. Run them in the order in Part 5: P0, P1, P2, P6, P8, P5, P4, P7, then P9 when the photos exist. P3 is retired (its work moved into P1 and P8).

### Prompt 0: Repo guardrails

```
Set up repo guardrails for a series of Claude Code sessions on this Astro site.

1. Write CLAUDE.md at the repo root (replace any existing) with: what the site is (party quantity calculators; about 2,000 generated pages from scripts/generateData.ts and scripts/generateFoodData.ts; Astro 5 static build on Cloudflare Pages at https://www.stocktheevent.com/); the commands (npm run generate, npm run build, npm test, npm run check once it exists); and the rules every change must follow: all internal links end with a trailing slash; canonical URLs are derived in BaseLayout from Astro.site, never stored in data; indexability comes from src/data/indexing.ts once it exists; no emoji anywhere in templates or data copy; no CSS gradients, backdrop-filter, box-shadow, border-radius, or transform-on-hover; icons only through src/components/Icon.astro; at most two font families, self-hosted from public/fonts, never Google Fonts at runtime; numbers use tabular figures; copy is plain American English with no em dashes; every generated page has exactly one H1; new content sections go into shared components, never duplicated per template. Add a "design tokens" section listing the Bar book tokens (paper #F5F6F3, paper-2 #ECEEE9, ink #1B1F1D, ink-2 #4B524E, rule #C7CDC8, accent #1F4D3A, accent-soft #E3EBE6; display face Libre Caslon Text; text face Archivo) and note that they are the target system, applied in a later prompt. Keep the file under 150 lines.

2. Replace README.md (still the Astro starter template) with a real one: purpose, structure, generators, build, tests, deploy (Cloudflare Pages, _redirects, _headers), environment variables (none yet; a list to extend), and a pointer to CLAUDE.md.

3. Create scripts/checkSite.ts, runnable as npm run check after npm run build, that inspects dist/ and prints a table of PASS or FAIL with counts for: every canonical starts with https://www.stocktheevent.com/ and ends with "/"; no internal href lacks a trailing slash; sitemap URL count, and whether any sitemap URL has a guest count that is noindexed; every page has exactly one <h1>; no reference to fonts.googleapis.com or fonts.gstatic.com; no emoji code points in HTML text; total bytes in public/fonts if present. Exit non-zero only for checks named in a CHECKS_ENFORCED array at the top of the file, which starts empty; later prompts add checks to it as they are fixed. Add "check": "tsx scripts/checkSite.ts" to package.json.

4. Create a git branch redesign-a from main and commit these files with the message "Repo guardrails: CLAUDE.md, README, site checks".

Report the check table for the current build.
```

### Prompt 1: Canonicals, staged index, sitemap, logo, breadcrumbs

```
Fix technical SEO across the Astro site in this repo. Do not change any URL paths; keep the trailing-slash URLs that Cloudflare Pages already serves.

1. Canonical URLs. In src/layouts/BaseLayout.astro, stop accepting a canonicalUrl prop. Compute the canonical as new URL(Astro.url.pathname, Astro.site).href and ensure it ends with a trailing slash (except for file URLs). Use it for <link rel="canonical">, og:url, and the last BreadcrumbList item. Remove the canonicalUrl prop from every page that passes it (src/pages/[slug].astro, food/[slug].astro, party/[eventSlug].astro, calculators.astro, food/index.astro, about.astro, and any others). Remove canonicalUrl from the content schema in src/content.config.ts and from src/lib/types.ts, and stop writing it in scripts/generateData.ts (line ~302) and scripts/generateFoodData.ts (line ~329).

2. Staged index. Create src/data/indexing.ts exporting INDEXABLE_GUEST_COUNTS = [25, 50, 75, 100, 150, 200] and a helper isIndexable(guestCount). Use it in src/pages/[slug].astro, src/pages/food/[slug].astro, and src/pages/bar-setup/[...slug].astro to emit <meta name="robots" content="noindex, follow"> for every other guest count (replacing the current guestCount <= 15 checks). In astro.config.mjs set trailingSlash: 'always', and make the sitemap filter exclude every calculator, food, and bar-setup URL whose guest count is not in INDEXABLE_GUEST_COUNTS (parse the trailing -N-guests segment), plus /privacy, /terms, /unsubscribe, and /404. Enable lastmod in the sitemap integration. The built sitemap should contain about 880 URLs.

3. Internal links: every internal href in src/ must end with a trailing slash (or be '/'). Update DrinkSwitcher.astro, RelatedPages.astro, the quick-reference tables in [slug].astro and food/[slug].astro, AnswerHero.astro breadcrumbs, BaseLayout nav and footer, InteractiveCalculator.astro detailLink, party/[eventSlug].astro cards and script, bar-setup/[...slug].astro links, calculators.astro, calculators/[category].astro, food/index.astro, 404.astro, and about.astro. Add a small unit check or grep in the test suite that fails if any internal href in dist/ lacks a trailing slash.

4. Breadcrumbs: replace links to /calculators?item=X and /calculators?event=Y (visible breadcrumbs in AnswerHero.astro, the BreadcrumbList in [slug].astro, and the footer links in BaseLayout.astro) with /calculators/{itemId}/ and /calculators/{eventId}/. In food/[slug].astro make breadcrumb item 3 point to /food/ until food hubs exist.

5. Organization schema in BaseLayout.astro: point logo at /logo.png and create public/logo.png (a 512x512 PNG rendered from public/favicon.svg). Add a sameAs array (leave it empty only if no profiles are provided).

6. Bar setup: confirm src/pages/bar-setup/[...slug].astro uses the same isIndexable() rule as the other templates (step 2).

7. package.json: make the generate script run both generators: "tsx scripts/generateData.ts && tsx scripts/generateFoodData.ts".

8. Add public/_headers with: "/*" Cache-Control: public, max-age=0, must-revalidate; "/_astro/*" Cache-Control: public, max-age=31536000, immutable; "/fonts/*" same as _astro.

9. Replace public/og-default.png with a 1200x630 image under 300 KB (resize with sharp and save as JPEG quality 82, keeping the filename so existing tags work). Then add the canonical, trailing-slash, and sitemap checks to CHECKS_ENFORCED in scripts/checkSite.ts.

Run npm run build, then verify: grep dist for rel="canonical" and confirm every value starts with https://www.stocktheevent.com/ and ends with '/'; count URLs in dist/sitemap-0.xml (expect about 880) and confirm none has a guest count outside 25/50/75/100/150/200; confirm every page for another guest count contains the noindex meta; confirm no href="/..." without a trailing slash except "/". Run the Playwright tests. Report the counts.
```

### Prompt 2: The full-bar answer, visible FAQ, plurals, seasonal names, shared splits

```
Improve the calculator content model and fix generated-text bugs. Read scripts/generateData.ts, scripts/generateFoodData.ts, src/data/events.ts, src/data/seasonalEvents.ts, src/components/InteractiveCalculator.astro, src/pages/[slug].astro, src/pages/bar-setup/[...slug].astro, and src/pages/party/[eventSlug].astro first.

1. Create src/data/eventSplits.ts exporting EVENT_SPLITS (copy the 14-event table from InteractiveCalculator.astro) plus a helper drinkShare(eventId, itemId) that returns the normalized share of that drink across all four drinks. Import it in InteractiveCalculator.astro, bar-setup/[...slug].astro, and generateData.ts so all three use the same table. This fixes bar-setup pages for seasonal events, which currently fall back to the wedding split.

2. Primary answer on single-drink pages. In generateData.ts compute two results per page: fullBar (servings x drinkShare, no variety multiplier, then units with the 15% buffer) and onlyDrink (the current calculation). Store both in calculation. Make fullBar the primary number in meta.title, meta.description, meta.h1 copy, the AnswerHero big number, the quick-reference table, and the FAQ answers. Show onlyDrink as a secondary line on the answer card: "If {drink} is the only alcohol you serve: {n} {units}". Update the math breakdown to include a step "Share of the bar: {pct}% of drinks are {drink} at a {event}". Update tests/calculations.spec.ts and tests/calculator.spec.ts expectations.

3. Render the FAQ. Add a visible section "Questions about {drink} for a {event}" in [slug].astro and food/[slug].astro that lists the six questions and answers already built for faqSchema, using <details> elements with the first one open. Keep the JSON-LD.

4. Plurals. Add pluralName to each event in src/data/events.ts ("Birthday Parties", "Weddings", "Thanksgiving dinners", "New Year's Eve parties", etc.). In generateData.ts line ~163 use event.pluralName instead of `${event.name}s`. In generateFoodData.ts change the title to "How Much {Food} for a {N}-Guest {Event}? | {n} {units}" and the h1 to "How Much {Food} for a {N}-Guest {Event}?". Regenerate all JSON.

5. Seasonal names. In party/[eventSlug].astro, every heading, FAQ question, and CTA that currently uses baseEvent.name must use seasonalEvent.shortName (add shortName to each entry in seasonalEvents.ts, e.g. "Cinco de Mayo Party", "St. Patrick's Day Party", "Memorial Day Cookout", "Tailgate"). The base event is still used for the math.

6. Counts. Export a totalCalculators() helper from src/data (items x events x guestCounts for drinks, plus food) and use it on the homepage, footer, and the CTA in [slug].astro. Remove the hardcoded 336, 1,820+, and 2,000+ strings.

Build, run the tests, and paste the new title, description, and primary/secondary numbers for wine-for-wedding-100-guests and beer-for-fourth-of-july-party-100-guests, plus the bar-setup output for fourth-of-july-party-100-guests.
```

### Prompt 3: retired

The font and icon work is part of Prompt 8 (the redesign replaces the typefaces, so self-hosting the old ones first would be wasted), and the share-image resize is step 9 of Prompt 1.

### Prompt 4: Ads, analytics events, form protection

```
Add monetization and measurement scaffolding to this Astro site.

1. Ad slots. Create src/components/AdSlot.astro that renders a labeled container ("Advertisement") with a fixed min-height to prevent layout shift (min-height 280px on desktop, 250px on mobile) and accepts a slot id. Place three instances in src/pages/[slug].astro and src/pages/food/[slug].astro: after the stat cards under the answer, between the math breakdown and the quick-reference table, and above the related-calculator grid. Add one on bar-setup and party pages after the first results block. Read the ad network from an env var PUBLIC_AD_NETWORK ('adsense' | 'none', default 'none') and PUBLIC_ADSENSE_CLIENT; when adsense is set, load the AdSense script once in BaseLayout.astro and render <ins class="adsbygoogle"> units with data-ad-slot from the slot id. When 'none', render nothing (no empty boxes).

2. Analytics. Add PostHog via the snippet in BaseLayout.astro using PUBLIC_POSTHOG_KEY and PUBLIC_POSTHOG_HOST env vars (skip when the key is unset). Create src/lib/track.ts with a track(event, props) helper that no-ops when PostHog is absent. Fire: calculator_result (drinks, event, guests, duration, panel) on every recalculation in InteractiveCalculator.astro (debounced to 500 ms); breakdown_click on the detail CTA; affiliate_click (key, page) on every link with rel containing "sponsored" (delegate from BaseLayout); email_submit (source, eventType) on both forms; copy_list and print_list in ShoppingList.astro; guest_stepper_change if a stepper exists.

3. Bot protection. Add Cloudflare Turnstile (PUBLIC_TURNSTILE_SITE_KEY) to the forms in EmailCapture.astro and ShoppingList.astro, include the token in the JSON payload as turnstileToken, and add a short comment in both files noting that the n8n workflow must verify the token with the Turnstile siteverify endpoint before storing the email.

4. Update src/pages/privacy.astro to mention advertising cookies and PostHog analytics, and add a minimal consent banner component that only appears for visitors whose timezone or navigator.language suggests the EU/UK, gating the ad and analytics scripts until accepted.

Document the new env vars in README.md (replace the starter-template README with a real one describing the generators, build, tests, and env vars). Build and run tests.
```

### Prompt 5: Affiliate upgrade and "where to buy"

```
Upgrade affiliate monetization in this Astro site. Read src/lib/affiliates.ts, src/components/ShoppingList.astro, src/pages/food/[slug].astro, src/pages/party/[eventSlug].astro, src/pages/bar-setup/[...slug].astro, and src/pages/index.astro first.

1. Product-level links. Change affiliates.ts from search URLs to a product catalog: for each key store { name, asin, why, packSize?, packUnit? } and build https://www.amazon.com/dp/{asin}?tag=probuild20-20. Leave the ASIN fields as clearly marked placeholders (ASIN_TODO) with the intended product described in a comment, so they can be filled in later; when an ASIN is a placeholder, fall back to the current search URL so nothing breaks.

2. Product cards. Replace the small "Buy" pills in ShoppingList.astro and food/[slug].astro with a compact card row under the list: product name, the one-line why, and the quantity math when packSize is known (e.g. "140 glasses: 2 x 72-pack"). Keep rel="noopener sponsored" and target=_blank.

3. Where to buy the alcohol. Create src/components/WhereToBuy.astro that, given the drink, units, and event, renders a short block: "You need {n} {units} (about {cases} cases)." followed by up to three retailer options from a new src/lib/retailers.ts: Total Wine (pickup), Instacart (same-day delivery), ReserveBar (premium spirits and champagne). Each retailer entry has { name, blurb, url, enabled } where url is a template string with a {query} placeholder and enabled defaults to false; render only enabled retailers, and render a plain non-affiliate "Find it locally" line when none are enabled. Insert WhereToBuy directly under ShoppingList on drink pages and in the shopping list section on bar-setup pages. Add track('affiliate_click') on these links if src/lib/track.ts exists.

4. Ice and bulk items. In the generated shopping lists, give Ice, Coolers, and Cups an affiliateCategory so getAffiliateLink resolves them, and add matching catalog entries.

5. Cross-promotion. Add the freezerbatchcocktails.com promo block from index.astro as a component and show it on spirits calculator pages and on bar-setup pages under the spirits line.

Build, run tests, and list every affiliate destination now present in dist/ grouped by retailer.
```

### Prompt 6: Hubs, bar-setup repositioning, seasonal automation

```
Strengthen the hub pages and seasonal handling in this Astro site.

0. Working method: draft the 23 hub intros (13 events, 4 drinks, 6 foods) by fanning out to subagents, one brief and one agent per hub, each returning 120 to 180 words in plain American English with no em dashes and the numbers taken from the data; integrate them in the main session.

1. Hub content. Rewrite src/pages/calculators/[category].astro so each hub has: an intro paragraph answering the broad question for that drink or event in plain numbers (write these from the data: servings per unit, typical share of the bar, and the one-bottle-per-two-guests style rule); a table with events as rows and guest counts 25, 50, 75, 100, 150, 200 as columns, each cell linking to the calculator page and showing the primary units number; the event's first two proTips; and links to the matching food hub. Exclude 10 and 15 guest pages from any listing. Create src/pages/food/[category].astro with the same structure for the six foods and the 13 events, and update src/pages/food/index.astro to link to /food/{food}/ instead of leaf pages.

2. Bar setup. Retitle src/pages/bar-setup/[...slug].astro pages to "{Event} Alcohol Calculator: {N} Guests (Wine, Beer, Spirits, Champagne)" with a matching H1 and description, add "Full Bar" to the desktop and mobile nav in BaseLayout.astro (link to /bar-setup/wedding-100-guests/), and add a "Planning a full bar? See wine, beer, spirits, and champagne together for this event" link on every single-drink page under the answer card. Make sure these pages use the shared EVENT_SPLITS from src/data/eventSplits.ts.

3. Seasonal rotation. Add a nextSeasonalEvent() helper in src/data/seasonalEvents.ts that picks the event whose peakMonths contains the current build month or the nearest upcoming one, and use it for the "Seasonal" nav link and the seasonal card on the homepage. Remove the hardcoded year from title, metaTitle, and h1 in seasonalEvents.ts; instead append the current year at build time only in metaTitle. Document in README.md that a monthly rebuild (Cloudflare Pages deploy hook triggered from n8n on the 1st) keeps these current.

4. About and methodology. Replace the Person schema in src/pages/about.astro with a real author block (name and role supplied via a constant at the top of the file, marked TODO) and add src/pages/methodology.astro that explains the model in plain language, compares it with the one-drink-per-hour convention, lists standard pour sizes, and links to the sources. Link to it from the "Why trust this formula?" block on every calculator page.

Build, run tests, and report the word count of /calculators/wine/ before and after.
```

### Prompt 7: Embeddable widget and share images

```
Add two distribution features to this Astro site.

1. Embeddable calculator. Create src/pages/embed/index.astro: a stripped-down version of the InteractiveCalculator (no site header or footer, compact spacing, same math, same event and drink data) designed to run inside an iframe at 100% width and about 620px height, with a small "Powered by StockTheEvent" link (target=_top, rel=noopener) under the result that goes to the matching calculator page on www.stocktheevent.com with a utm_source=embed parameter. Send an X-Frame-Options-free response: add a public/_headers rule for /embed/* that sets Content-Security-Policy: frame-ancestors *. Add src/pages/embed-calculator.astro (a normal site page, indexable) that explains the widget, shows a live preview, and gives the copy-and-paste iframe snippet with a copy button. Link to it from the footer under "Free tools" and from the About page.

2. Per-page share images. Add a build step that generates a 1200x630 PNG for every indexable drink, food, and bar-setup page and for each party page using satori and resvg (npm: satori, @resvg/resvg-js), rendering the answer as a card: the drink or food emoji, the big number and unit, "for a {N}-guest {event}", and the site name. Write them to public/og/{slug}.png during npm run generate (skip files that already exist and are newer than the data file). Set og:image and twitter:image on those pages to the generated file; keep og-default.png for everything else. Add a pinterest-friendly data-pin-description on the answer card's image if one is rendered.

Build, run tests, and report: the embed page URL, the iframe snippet, the number of OG images generated, and the largest file size among them (target under 150 KB each).
```

### Prompt 8: Implement the redesign (Direction A, Bar book)

```
Redesign this Astro site to the "Bar book" direction. Treat this as a from-scratch visual system; keep all routes, data, generators, schema, and tests, and keep the content changes from earlier prompts (full-bar primary answer, visible FAQ, hubs, methodology page). Build the on-page guest stepper and the "Where to buy" box in this prompt with placeholder retailer entries (a later prompt fills the retailer catalog). The design tokens and component rules below are the spec, and CLAUDE.md carries the rules; do not reintroduce anything from the old "Golden Hour" system. Work in plan mode first and propose the migration order before editing; then execute as five commits: tokens, fonts, and icons; layout, header, and footer; homepage; calculator pages; everything else.

DIRECTION = "barbook" (the alternative "editorial" is described at the end; implement barbook unless told otherwise).

1. Tokens. Replace the :root block in src/styles/global.css with: --paper #F5F6F3, --paper-2 #ECEEE9, --ink #1B1F1D, --ink-2 #4B524E, --rule #C7CDC8, --accent #1F4D3A, --accent-soft #E3EBE6; --font-display 'Libre Caslon Text', Georgia, serif; --font-text 'Archivo', 'Helvetica Neue', Arial, sans-serif. Delete every gradient, glass, blob, texture, flourish, glow, shimmer, float, and fade-in rule and their classes; delete the custom scrollbar; keep the reduced-motion rule, focus-visible rule, and print rules (update selectors). Body background is --paper, text --ink, no page gradient.

2. Fonts. Self-host Latin subsets in public/fonts: Libre Caslon Text 400, 700, 400 italic; Archivo variable (wdth 62 to 125, wght 400 to 700) or static 400/500/600. @font-face with font-display: swap and unicode-range for Latin; preload the two used above the fold; remove every Google Fonts link and the Material Symbols stylesheet. Numbers everywhere use font-variant-numeric: tabular-nums. The big answer number uses Archivo at weight 600 and font-stretch 105%.

3. Icons. Create src/components/Icon.astro rendering inline SVG (24x24 viewBox, stroke currentColor, 1.5 px, round caps and joins, fill none) for: wine, beer, flute, spirit, bottle (24x64), case (64x44), glass (40x64), check, arrow, minus, plus, external, menu, print, copy, mail. Replace every emoji and every material-symbols span in src/ with Icon. After this step, grep src/ for emoji code points (U+1F300 to U+1FAFF, U+2600 to U+27BF) must return nothing except inside data files' proTips text, which you should also clean.

4. Layout system. A .container of max-width 1296px (1440 minus 72 px margins) with a 12-column grid and 32 px gutters; section headers occupy 4 columns beside 8 columns of content on desktop and stack on mobile. Sections are separated by 1 px --rule lines, never by background bands. No border-radius anywhere except the mobile checkbox focus ring. No box-shadow. No transform on hover. Buttons are square: primary is --accent fill with --paper text, secondary is a 1 px --ink border; both 44 px tall minimum with 14 to 18 px horizontal padding.

5. Header and footer (BaseLayout.astro). Header: 1 px --ink bottom border; left, the wordmark "Stock the Event" in the display face at 26 px weight 700 with a 12 px uppercase label "Party quantity calculators" beside it (hide the label under 900 px); right, text links Drinks, Food, Full bar, Occasions, How the math works; on mobile a menu icon and a simple stacked panel. Footer: 1 px --ink top border, four text columns (Drinks, Food, Site, Legal) plus the wordmark and the two disclosure lines; no dark background.

6. Homepage (index.astro and InteractiveCalculator.astro). H1 "How much should you buy?" in the display face at 64 px, a 19 px deck, and the calculator as a bordered ledger in the 7-column right area: left half inputs (a 2x2 grid of bordered drink toggles with Icon, selected state --accent-soft fill and --ink border, aria-pressed; occasion as a native select styled as a bordered row; guests and hours as bordered steppers with minus/plus buttons, a number input in the middle, aria-valuetext), right half "Your bar" as a table (icon, drink, big tabular number, unit) with a total row under an --ink rule, a one-line note, and the primary button. Remove the "Why trust", "Trusted by", "Popular calculators", "Pro Tip: Stock Your Bar" sections. Add: a "Rules of thumb" table (drink, standard pour, servings per unit, share of a wedding bar), a "By occasion" two-column text index with a one-line note per occasion, and a "How the math works" section with two paragraphs, a link to /methodology/, and an author block (name and role from a constant in src/data/site.ts marked TODO).

7. Calculator pages ([slug].astro and food/[slug].astro) on shared components: breadcrumb (text, slashes); H1 at 56 px; the answer row (148 px number, unit line in the display face at 34 px, a 16 px context line: "as part of a full bar, 5 hours · about 3½ cases · 177 glasses"); a ruled line with the only-drink figure; on the right a bordered "Adjust" box with the guest and hour steppers, the three other drinks for this event as bordered links, and the primary button to the bar-setup page. Then, each as a 4+8 section separated by rules: "How we got there" ledger table (label, formula in --ink-2, result right-aligned, total row under an --ink rule) with the one-line comparison to The Knot and a methodology link; "Quick reference" table with columns Guests, Full bar, Only this drink, Servings, with the current row filled --accent-soft; "Shopping list" as a checklist with square 22 px boxes, tabular quantities in a fixed-width column, and Copy, Print, Email as secondary buttons, beside the bordered "Where to buy" box; "Questions" as visible Q and A rows with the question in the display face at 20 px; "Nearby" as three text-index columns. No CTA band at the bottom; the footer follows the last section.

8. Food, party, bar-setup, hubs, about, methodology, 404: move onto the same components and tokens so nothing on the site uses Tailwind default colors. The party pages become an occasion page in the same ledger style; the bar-setup page uses the "Your bar" table as its answer. Delete unused components after migration.

9. Motion: only color transitions of 150 ms on interactive elements, and none when prefers-reduced-motion is set.

10. Acceptance checks. Add the font-host, emoji, and one-H1 checks to CHECKS_ENFORCED in scripts/checkSite.ts, then spawn a read-only reviewer subagent that runs: grep src/ for "gradient", "backdrop", "blur", "scale-1", "shadow-", "rounded-" and "animate-" (must return nothing in templates; rounded- allowed only on the mobile focus ring); npm run build; npm run check; npm test; Lighthouse accessibility on the homepage and one calculator page (95 or higher); total font bytes under 150 KB. The reviewer reports pass or fail per item; fix and re-run until everything passes, then report the final table.

Editorial variant (only if DIRECTION = "editorial"): tokens --paper #FBFAF8, --ink #151312, --ink-2 #5A5450, --rule #DAD5CF, --accent #7A2E36, --photo #1D2822; display face Bodoni Moda 400/500 with the masthead uppercase and tracked 0.12em, text face Karla; a full-bleed photo band component (src/components/PhotoBand.astro) that takes an image and renders the H1 over it in --paper; the homepage hero as a photo band with a calculator panel overlapping its bottom right; occasion pages get four-up photo tiles; the footer is --ink with --paper text; photos come from public/photos/{slug}.jpg with a plain --photo block as the fallback when a file is missing.
```

---


### Prompt 9: The Editorial host layer (later, once photos exist)

```
Add the "Editorial host" layer on top of the Bar book design, switchable with a build-time constant, without changing page structure.

Precondition: photos exist in public/photos/ (shot list at the end). If fewer than 8 of them exist, stop and report which are missing.

1. Design switch. In src/data/site.ts add DESIGN: 'barbook' | 'editorial'. In src/styles/global.css define the editorial tokens under html[data-design="editorial"]: --paper #FBFAF8, --ink #151312, --ink-2 #5A5450, --rule #DAD5CF, --accent #7A2E36, --photo #1D2822, --font-display 'Bodoni Moda', --font-text 'Karla'. BaseLayout sets data-design from the constant. Self-host Latin subsets of Bodoni Moda (400, 500, italic 400) and Karla (400, 500, 600) in public/fonts, loaded only in editorial mode.

2. Masthead and footer. In editorial mode the header is a centered uppercase wordmark in the display face, tracked 0.12em, with the nav split left and right; the footer is --ink with --paper text.

3. Photo bands. Create src/components/PhotoBand.astro: props src, alt, height, and a slot; renders the image with object-fit cover and the slot (breadcrumb and H1 in --paper) over the bottom left; when the file is missing it renders a --photo block with the alt text as a small label. Use it for the homepage hero (calculator panel overlapping the band's bottom right on desktop, stacked on mobile), above the answer on every calculator page (public/photos/{itemId}.jpg), and on occasion pages (public/photos/occasion-{eventId}.jpg).

4. Occasion tiles. On the homepage and the occasions hub, replace the text index with four-up photo tiles (image, name in the display face, one line) that fall back to the text index when photos are missing.

5. Answer typography in editorial mode: the big number in the display face at 220 px on desktop and 120 px on mobile, the unit line italic at 44 px; everything else keeps the Bar book measurements.

6. Motion: one hero reveal (image fades in over 400 ms, headline rises 12 px), disabled under prefers-reduced-motion. Nothing else.

7. Share images: when DESIGN is editorial, regenerate the OG images in the editorial style (display-face number on the --photo ground).

Acceptance: both DESIGN values build cleanly with no template changes; npm run check and npm test pass; Lighthouse accessibility stays at 95 or higher; total font bytes under 200 KB in editorial mode. Report screenshots of the homepage and one calculator page in both modes.

Shot list for public/photos (1600 px wide JPEG, under 250 KB each; warm side light, the green wall, the wood table): hero.jpg (bottles and glassware, wide), wine.jpg, beer.jpg, champagne.jpg, spirits.jpg, pizza.jpg, wings.jpg, tacos.jpg, sliders.jpg, appetizers.jpg, bbq.jpg, occasion-wedding.jpg, occasion-super-bowl.jpg, occasion-holiday-party.jpg, occasion-graduation.jpg, portrait.jpg.
```

---

## Sources used for external facts

- The Knot, wedding bar quantities for 100 guests (updated Sept 30, 2025): https://www.theknot.com/content/how-to-stock-the-bar-at-your-wedding
- Google removed FAQ rich results on May 7, 2026; HowTo removed in 2023: https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/ and https://developers.google.com/search/blog/2023/08/howto-faq-changes
- Cloudflare Pages trailing-slash redirects with Astro static output: https://realmorrisliu.com/thoughts/fixing-astro-seo-cloudflare-trailing-slash/
- Mediavine Journey (1,000+ sessions, 70%), Mediavine ($5k from Journey, 75%), Raptive (25k page views, 75%): https://thisweekinblogging.com/mediavine-raptive-requirements/
- Amazon Associates rates (Kitchen 3%, Grocery 1%, 24-hour cookie): https://getlasso.co/amazon-affiliate-commission-rate/
- Total Wine affiliate program (4%, 1-day cookie, FlexOffers): https://getlasso.co/affiliate/total-wine/
- ReserveBar affiliate program (4%, 30-day cookie): https://www.flexoffers.com/affiliate-programs/reservebar-affiliate-program/
- Instacart affiliate program (3%): https://www.affiliateprogramdb.com/alcohol-affiliate-programs/
- Cloudflare Crawler Hints (IndexNow, all plans): https://developers.cloudflare.com/cache/advanced-configuration/crawler-hints/
- Claude Code model configuration (aliases `best`, `fable`, `opus`, `sonnet`, `opusplan`; effort levels; subagent model): https://code.claude.com/docs/en/model-config
- Anthropic on choosing a model and effort level in Claude Code: https://claude.com/blog/claude-model-and-effort-level-in-claude-code
- Traffic and index data: your Cloudflare Web Analytics export (Jul 25 to Aug 24, 2026), your Search Console export (Aug 24, 2026, last 24 hours), and a live Google `site:stocktheevent.com` search on Aug 24, 2026
