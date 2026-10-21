# The Fit Monster — Muscles Factory

Premium multi-page website for The Fit Monster, Nazimabad No. 1, Karachi. Built by [Nexlyr Solutions](https://nexlyr.solutions).

Static HTML/CSS/JS, no build step. Deploys to Vercel as-is (`vercel.json` turns on clean URLs and long caching for fonts and media).

## Pages
| File | What's on it |
| --- | --- |
| `index.html` | Molten-gold preloader that dives through the O, triptych video hero, animated 3D lat-pulldown machine (scroll to work the stack), "We're sorry" campaign chapter, the Halo 3D flythrough, disciplines, reels rail, coaches, Google reviews, timings + map |
| `training.html` | Four programmes, the Back Series exercise loops, 3D arm lab (drag the dumbbell, pick a biceps head and a weight) |
| `coaches.html` | Team, coaching rules, personal training steps, coach reels |
| `floor.html` | Filterable gallery of every photo and reel, with lightbox |
| `membership.html` | Three plans (rates on WhatsApp), what the price pays for, FAQ, enquiry form that opens WhatsApp |
| `visit.html` | Live open/closed status, address, timings, map, first-visit steps |
| `404.html` | 3D dumbbell, "This page skipped leg day." |

## Where things live
- `js/config.js` — **phone, WhatsApp, address, timings, Instagram, map links.** Every page, the menu status and the chat read from here.
- `css/tokens.css` — colours (OKLCH, dark + light themes), fonts, spacing, motion tokens.
- `css/site.css` — all components.
- `js/site.js` — preloader, page curtain, theme switch, smooth scroll, reveals, menu, Apology chapter, reels/lightbox, front-desk chat, forms.
- `js/scene-halo.js` — Three.js octagon-light tunnel (home) and ambient rings (inner page heroes).
- `js/scene-dumbbell.js` — Three.js dumbbell (training, 404).
- `js/scene-machine.js` — Three.js selectorised lat-pulldown tower: plates lift, pulleys turn, cable and bar move; scroll drives camera and pin.
- `media/video` — WebM (VP9) for every clip with an MP4 fallback for older iPhones. `media/poster` + `media/img` — WebP.
- `fonts/` — self-hosted Tomorrow, Geist, JetBrains Mono. `js/vendor/` — GSAP, ScrollTrigger, Lenis, Three.js (no CDNs).

## To confirm with the owner
- [ ] WhatsApp number: using the Google listing phone `+92 344 1070495` — confirm it's on WhatsApp (`js/config.js`).
- [ ] Instagram URL — add to `js/config.js` and it appears in the footer automatically.
- [ ] Plan names on Membership (Floor / Personal training / Floor + plan) and what each includes.
- [ ] Coach names (none are shown yet — nothing was invented). Owais Baloch is named in a member's Google review quote.
- [ ] Whether personal training includes diet guidance.
- [ ] Domain: sitemap, canonical tags and OG image use `https://fit-monster.nexlyr.solutions` — change in `sitemap.xml`, `robots.txt` and the page heads if it goes elsewhere.

Facts on the site (address, timings, 4.7★ from 140 Google reviews, review quotes) come from the gym's Google listing, Oct 2026. Campaign lines are from their own posts, with typos fixed.

Design reasoning, scored rounds and the system: see `DESIGN-NOTES.md`.
