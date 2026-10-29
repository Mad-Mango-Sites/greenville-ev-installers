# Greenville EV Charger Installers: static site

Hi Prem. This folder is the whole site. It's plain HTML, CSS and JavaScript with no build step and no backend. Push the folder contents to the root of a GitHub Pages repo and it works at `https://mad-mango-sites.github.io/<repo>/`. Every link and asset path is relative (none start with `/`), so the site also runs from any sub-path or straight from disk (`file://`).

## Structure

```
index.html                         Home
installers.html                    All installers (directory with filters and sort)
greenville.html, greer.html, simpsonville.html, mauldin.html,
taylors.html, travelers-rest.html, fountain-inn.html, easley.html     8 town pages
tesla-wall-connector-installers.html, panel-upgrade-for-ev-charger.html,
commercial-ev-charger-installers.html, multifamily-hoa-ev-charging.html,
nema-14-50-outlet-installers.html, ev-charger-repair.html             6 service pages
installers/<slug>.html             23 installer profiles
guides.html                        Guides hub
guides/<slug>.html                 5 guides (install cost, Duke Charger Prep Credit, permits city vs county,
                                   which utility serves me, federal 30C credit ended)
ev-charging-cost-calculator.html   Home charging cost calculator
how-we-rank.html, claim-or-correct-a-listing.html, about.html,
disclaimer.html, privacy.html, terms.html
css/styles.css                     All styles
js/main.js                         Nav toggle, directory filters/sort, calculator
data/installers.json               Listing data (also embedded in installers.html, see below)
images/                            logo.svg, logo-dark.svg, favicon.svg, favicon-16/32.png,
                                   apple-touch-icon.png, home-hero-768/1280/1920.jpg
```

52 HTML pages in total. All pages share the same header, nav and footer. Nav: Find an installer (8 towns) | Services (6) | Guides | Charging cost calculator | How we rank.

## Pages left out on purpose

This is the listing-only version, so these pages from the doc are **not** built. There are no files, placeholders or links for them:
- #42 Compare installers
- #43 Get up to 3 quotes (form)
- #44 Quote thank-you (part of the form flow)
- Phase 2 town pages (Five Forks, Spartanburg) were never in the phase 1 build. Their chips have been removed.

I also removed every "Get 3 quotes", "Request quotes" and "Compare" button/CTA, all compare checkboxes, the "How quotes work" block and the quote-request sections on Privacy and Terms. The full list of changes is in the hand-off report. Words like "Compare 23" in some doc page titles and meta descriptions stay because they're SEO copy, not buttons.

## Listing data: `data/installers.json`

One object per installer, in rank order. Fields:
`rank, slug, name, base, score, rating_text, rating_value_scored, review_count_scored, rating_source_scored, ev_evidence, coverage_text, towns_named, towns_listed, tags, jobs, brands, home_or_commercial, commercial_only, publishes_prices, phone, website, profile, town_scores`.

The cards are static HTML, so they show up without JavaScript and get indexed. On `installers.html`, `js/main.js` loads the JSON and uses it to filter and reorder those cards: town, job type, charger brand, home or commercial, "publishes prices", and sort by our score, review count or name. Filters are kept in the URL (`installers.html?town=easley&job=commercial`), and the home page search form uses the same parameters.
- Over http(s) it fetches `data/installers.json` with a relative path.
- When opened from `file://`, browsers block fetch, so it reads the copy embedded in `installers.html` as `<script type="application/json" id="installers-data">`. **If you edit the JSON, update the embedded copy too** (or ask me to regenerate the site).

## Charging cost calculator

Vanilla JS, nothing leaves the browser. Inputs: miles per day, efficiency (mi/kWh or kWh/100 mi toggle), Duke rate block, gas price, MPG. Outputs: miles a month (miles/day × 30.4 days), kWh, monthly home charging cost, monthly gas cost and the difference. Inputs are checked and give inline messages, so the page never shows NaN or negative results and never divides by zero (miles 0–1000, gas $0.50–$15, MPG 5–150, 0.5–10 mi/kWh, 10–200 kWh/100 mi).

Sources (all checked Oct 21, 2026):
- **Electricity:** Duke Energy Carolinas, LLC, Schedule RS (South Carolina), Fifty-Ninth Revised Leaf No. 11, effective for service on and after March 1, 2026 (PSCSC Docket 2025-172-E, Order 2025-769). https://www.duke-energy.com/-/media/pdfs/for-your-home/rates/electric-sc/scschedulers.pdf
  Energy charge 13.8125¢/kWh for the first 1,000 kWh a month and 14.4661¢/kWh above 1,000 kWh. There are no seasonal or time-of-use prices. The calculator uses the first block unless the user says the home already uses more than 1,000 kWh. Not modeled (listed on the page): the $11.96 basic customer charge, riders (EE, EDIT-1, PC, PTC, CARE, Storm Securitization), fuel/environmental/avoided capacity/DERP adjustments, DERP fixed charge, sales tax and municipal fees, time-of-use and other Duke schedules, charging losses, public charging, charger and install cost, and other utilities.
- **Gas default:** $3.833/gal, AAA South Carolina average for regular, "Price as of 10/21/26" (https://gasprices.aaa.com/?state=SC). Update it in `ev-charging-cost-calculator.html` (input `#c-gas`) and in the source note.
- **MPG default:** 25.6 mpg, EPA 2025 Automotive Trends Report (EPA-420-R-26-001, Feb 2026): estimated real-world fuel economy for model year 2024 vehicles excluding BEVs and PHEVs. https://www.epa.gov/system/files/documents/2026-02/420r26001.pdf
- **EV efficiency:** no default. I couldn't find an official average, so the field starts empty and points users to fueleconomy.gov.

I wrote the calculator page's meta title and description myself (they aren't in the doc): "EV Charging Cost Calculator for Greenville, SC | Home vs Gas" / "Estimate the monthly cost to charge an EV at home on Duke Energy Carolinas' SC residential rate and compare it with gas for the same miles. Sources shown."

## Images

- Logo: concept A (`images/logo.svg` in the header, `images/logo-dark.svg` in the footer). The favicon set comes from the same mark.
- Home hero: `images/home-hero-*.jpg`, Pexels photo 27355835 by Andersen EV (Pexels License, no attribution required). Retouched to remove brand marks. Served responsively with `srcset`.
- Doc image spots that were UI mockups are built in HTML/CSS: #3 installer card, #6 filter bar, #23 profile layout, #24–46 installer badges (initials), #49 guide cards, #51 utility flowchart, #55 cost stacked bar.
- Doc photo and illustration spots with no approved image are left out. Each one leaves only an HTML comment `<!-- image spot #N -->` in the source: photos #7–14 and #17–22 (the doc says not to reuse the hero on town pages) and illustrations #4, #5, #50, #52, #53, #54. #15/#16 belong to phase 2 pages. #47/#48 belonged to the removed compare and quote pages.

## Content notes / open items for Aaron

- Duke Energy Carolinas' home Charger Prep Credit cap is shown as **$1,236** everywhere. The $1,755 figure (Duke Energy Progress) has been removed.
- Ratings are Google ratings checked Oct 26, 2026. Scores follow the How we rank rubric, including SC LLR license lookups done Oct 26, 2026.
- Claim or correct a listing: the doc's form section isn't built because there's no submission channel yet. The text still says to tell us in the form, so it needs a contact channel (email or form service).
- About / Privacy / Terms: sections that needed a legal entity, site email, retention period or "last updated" date were left out (HTML comments mark where). Add them once those are decided. Privacy copy mentions analytics cookies, but no analytics is installed. Terms mention greenvilleevinstallers.com.
- Not included yet because they need the final domain: sitemap.xml, canonical URLs, structured data.
