# The Fit Monster — design log

How every visual decision on this site was picked: each idea was proposed, scored out of 10, criticised, rebuilt, and re-scored until it cleared 9. Only the final round ships.

**Brief.** The Fit Monster — Muscles Factory, Nazimabad No. 1, Karachi. One of the most expensive gyms in Pakistan, and proud of it ("We're not the cheapest gym in town"). The site has to look more expensive than any gym site in the country, feel aggressive and smooth, and must **not** resemble the Verzish build (direct competitor).

**Inferred:** audience = Karachi lifters who'll pay for quality, 18–40, on phones first · one action = start a WhatsApp chat to book a visit · tone = luxury-industrial, after dark.

---

## System

| Axis | Verzish (competitor — avoid) | Fit Monster (this build) |
| --- | --- | --- |
| Display face | Big Shoulders (tall, condensed) | **Tomorrow 800** — squared, wide, cut from the same geometry as the FIT MONSTER wordmark |
| Body | Archivo | **Geist** |
| Labels | Geist Mono | **JetBrains Mono**, used only for hours, weights, counters |
| Metal | Chrome silver | **Molten gold** — the logo yellow, heated |
| Signature 3D | — | **The Halo** — their own octagon LED ceiling, rebuilt in Three.js |
| Page shape | Marquee → mosaic → sticky stack → branches | Preloader dive → triptych hero → the Apology (their campaign as a scroll story) → Halo flythrough → disciplines → reels rail → voices → visit |

Palette is OKLCH, warm-tinted (hue 85), one accent. Light theme is warm bone with deep gold text; the preloader and the Halo stay dark in both themes on purpose (lights-off chapters).

---

## Rounds

### Preloader
- **v1 · 6/10** — logo fades in, progress bar. Every gym template does this.
- **v2 · 7.5/10** — MONSTER letters rise and fill with yellow from the bottom (Sohail-style). Good, but flat yellow reads as a progress bar, not metal.
- **v3 · 8.5/10** — fill becomes molten: a glowing crest line rides the fill, the gold has a moving foil sheen, 000→100 counter in mono. Still exits with a fade.
- **v4 · 9.4/10 ✅** — exit dives the camera through the **O** of MONSTER; the O's counter becomes the window into the hero video. Fonts + hero video are fetched during the 3 s, so nothing blinks after it lifts. First visit per session only; later pages get the curtain.

### Hero
- **v1 · 6/10** — full-bleed video cropped to landscape. The reels are vertical; cropping 720 px wide footage to 16:9 looks soft.
- **v2 · 7/10** — vertical video in a glass card beside the headline. Sharp, but small and polite — not aggressive.
- **v3 · 9.2/10 ✅** — **triptych**: three vertical panels cut into one 1920×1080 video, edits staggered so a cut lands somewhere on screen every ~1 s. Pixel-sharp, aggressive, unlike anything Verzish has. Phones get a single vertical montage (it's native there). Headline is their own line: *We're not for everyone.*

### Their campaign ("We're sorry")
- **v1 · 6.5/10** — post the 8 carousel images in a slider. Baked-in typos (EXCPECTATIONS, IN IN TOWN), and sliders hide content.
- **v2 · 8/10** — re-typeset each line live, over the clean lower half of each photo.
- **v3 · 9.1/10 ✅** — "The Apology": a pinned chapter. "We're sorry." holds on the left while each reason replaces the last with a photo cross-cut and a counter (01/06). Phones get a calm stacked version — no pinning on touch, no jank.

### 3D
- **v1 · 5.5/10** — spinning 3D logo. Gimmick.
- **v2 · 7/10** — barbell that loads plates on scroll. Already done for another gym in town.
- **v3 · 9.3/10 ✅** — **The Halo**: every photo of this gym has the same ceiling — white octagon LED rings and red X lights. Rebuilt in Three.js as a tunnel you fly through on scroll; the floor zones (iron, machines, turf & rig, cardio) arrive as glass cards between rings. It's their room, not a stock effect.
- **v4 (supporting) · 9/10 ✅** — a Hammer Strength–style round dumbbell (their rack) on Training and Membership: drag to turn it, pick a grip and it rotates to show which biceps head that grip trains (from their own infographic). Ambient Halo rings head the inner pages, so 3D is on every page without cost on every scroll.

### The machine (round 2)
- **v1 · 7/10** — a static 3D machine to rotate. Looks like a product viewer.
- **v2 · 9.2/10 ✅** — a lat-pulldown tower that actually works: pick the pin, the plates above it lift on their guide rods, pulleys turn, the cable runs and the bar comes down, with a live load / plates / reps readout. Scroll orbits the camera and moves the pin; chips set it by hand.

### Chrome (round 2)
- Menu is a compact dropdown under the nav with page thumbnails, not a full-screen takeover. Theme switch lives in a labelled pill at the bottom-left with a three-option popover (Dark / Light / Auto). Chat sits bottom-right and opens as a small card on phones.
- The campaign line stays in its own chapter; the hero, footer and membership page have their own copy.

### Glass
- **v1 · 6/10** — glass on every card. Muddy, slow on phones.
- **v2 · 9/10 ✅** — glass only where something moves behind it (video, 3D, photos): nav pill, hero stat bar, Halo cards, chat, menu. Solid surfaces everywhere else. Two tiers, one blur value.

### Menu
- **v1 · 6.5/10** — hamburger → list.
- **v2 · 8/10** — full-screen overlay, big Tomorrow links staggering in.
- **v3 · 9.2/10 ✅** — overlay links preview their page with a looping clip on hover (desktop); a live **Open now / Opens 6:30 AM** status from the real timings; WhatsApp + call chips thumb-reachable at the bottom on phones.

### Theme switch
- **v1 · 7/10** — instant swap.
- **v2 · 9.1/10 ✅** — a circle wipes out from the toggle (View Transitions), falls back to a 150 ms fade. Choice is remembered and set before first paint — no flash.

### Chat
- **v1 · 6/10** — floating WhatsApp icon.
- **v2 · 9/10 ✅** — "Front desk": answers hours (live open/closed), location, fees, trainers, ladies, equipment and visits from real data; understands Roman Urdu (*timing, fees kitni, kahan, larkiyan*); hands anything else to WhatsApp with the question pre-typed. Bottom sheet on phones that respects the keyboard and safe area.

### Motion grammar
One easing family (`expo-out` in, `expo-in` out), three durations. Titles rise from a mask, never fade-blink; text is never hidden before first paint without JS. Lenis smooth scroll on desktop, native on touch. Everything collapses for `prefers-reduced-motion`.

---

## Facts used (all from the gym's Google listing / their own posts)
Address, phone, opening hours, 4.7★ from 140 Google reviews, review quotes, Hammer Strength and Nautilus kit (visible in their photos), the campaign lines (typos fixed). **Nothing invented** — no fake member counts, no prices. Things still to confirm with the owner are listed in `README.md`.
