# Changelog

## Phase 1: Foundation
- `config.js` is now the single source for brand, rooms, packages, gallery, story, experiences, nav, footer, page titles/descriptions and theme.
- Header, mobile menu, footer and floating buttons are rendered once (`js/components.js`) on every page.
- Fixed: no mobile navigation on rooms / gallery / contact pages.
- Fixed: `theme` colours in config.js had no effect (Tailwind used hard-coded hex). Colours are now CSS variables.
- Fixed: phone number mismatch on contact page, "6 stays" text with only 3 rooms, map embed hard-coded.
- Rating, trust bar, header badge and story stats are config-driven (set `rating.show:false` to hide invented figures).
- Rooms are selected by `id` (not by price); WhatsApp links for footer/floating buttons are real `<a>` links.
- Reveal animations no longer hide content if JS fails; reduced-motion respected; visible keyboard focus.
- Added Tailwind production build setup (`package.json`, `tailwind.config.js`, `src/input.css`). Still using the CDN until you run the build.
