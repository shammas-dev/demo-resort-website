# Resort Website Template  (v1.0.0)

A fast, static resort website with **direct WhatsApp booking**: live tariff estimate, weekend/season pricing, capacity warnings,
rooms, packages, gallery, SEO and link previews. No framework, no server, free hosting. **All client data lives in `js/config.js`.**

The full guide is in [`docs/Resort-Website-Template-Complete-Guide.pdf`](docs/Resort-Website-Template-Complete-Guide.pdf):
features, how it works, new-client onboarding, feature requests, pricing and maintenance.

## Start a new client (about 10 minutes to a first preview)
```
git clone <this template> client-name && cd client-name
npm install
npm run new-client -- "Sunrise Resort" 919876543210 "Sunrise"   # writes js/config.js + images/placeholder.svg
npm run check
npm run build
python3 -m http.server 8080 -d dist                             # preview at http://localhost:8080
```
Then replace every placeholder in `js/config.js`, add the client's photos to `images/`, and before go-live set
`isDemo: false` and `siteUrl: "https://their-domain"`. The build then refuses to ship placeholder text or stock photos.

> Run `new-client` only in a client's copy, never in the template repo (it replaces `js/config.js`; the demo config lives in git history and `tests/fixtures/`).

## Commands
| Command | What it does |
|---|---|
| `npm run new-client -- "Name" 91XXXXXXXXXX` | start a client from the starter config |
| `npm run check` | validate `js/config.js` |
| `npm run build` | check, pre-render pages, SEO, sitemap, compile Tailwind, output in `dist/` |
| `npm test` | 49 automated tests (they use a fixed demo config, so they pass in any client repo) |

## Deploy (Cloudflare Pages)
Framework preset **None** · Build command `npm run build` · Output directory `dist` · Node 20 (`.nvmrc`).
Every branch gets a preview URL. GitHub Actions (`.github/workflows/ci.yml`) also runs tests and the build on every push and pull request.
After the first `npm install`, commit `package-lock.json` so builds are reproducible.

## Structure
```
index.html rooms.html gallery.html contact.html policies.html 404.html   page shells
js/config.js          <- the only file edited per client
js/templates.js       config -> HTML (used by the browser in development AND by the build)
js/components.js      puts templates on the page; menu; text bindings
js/pricing.js         price + capacity rules
js/script.js          booking dock, WhatsApp messages, gallery viewer
js/theme.js           colours + page title before first paint
js/tailwind-theme.js  Tailwind colours/fonts (one source for dev and build)
scripts/              check.js, build.js, init-client.js
starter/              starter config + placeholder image for new clients
tests/                pricing, templates, build, starter tests (+ fixtures/demo-config.js)
images/               the client's photos
docs/                 complete guide (PDF)
```

## Pricing settings (js/config.js > pricing)
| Setting | Meaning |
|---|---|
| `showLivePrice` | `true` = show estimate, `false` = "Custom Quote" |
| `baseAdultsPerRoom`, `extraAdultPrice`, `extraChildPrice` | included adults per room; per-night extras |
| `weekendPercent`, `weekendDays` | % added on weekend nights (`[5, 6]` = Fri and Sat nights). `0` = off |
| `seasons` | `{ name, from: "MM-DD", to: "MM-DD", percent }`, repeats yearly. `[]` = none |
| `gstPercent`, `taxNote` | `0` + note = "Taxes extra."; or a % added to the estimate |
| `roundTo` | round nightly rates (default ₹10) |

Weekend and season never stack: the higher % wins. Capacity (`maxAdults`, `maxChildren` per room) only shows a warning.

## Optional sections
Leave these out of the config and they do not appear: `story`, `experiences`, `trustBar: []`, `packages: []`, `rating.show: false`,
`headerBadge: ""`, `policies.enabled: false`. With one room the comparison table is hidden too.

## Colours
`theme.gold` is the decorative accent. A darker "bronze" is derived automatically for buttons and small text so white text stays readable (WCAG AA 4.5:1). Override with `theme.bronze`.
