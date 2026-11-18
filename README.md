# Resort Website Template

Static, no-framework resort website with WhatsApp booking. **Everything client-specific lives in `js/config.js`.**

## Structure
```
index.html rooms.html gallery.html contact.html   page shells (rarely edited)
js/config.js          <- edit this per client
js/tailwind-theme.js  shared Tailwind theme (colours come from config)
js/theme.js           applies config colours + page titles before paint
js/components.js      header, mobile menu, footer, floating buttons
js/sections.js        rooms, packages, gallery, story, etc. rendered from config
js/script.js          booking calculator, WhatsApp messages, gallery
css/style.css         small custom CSS
```

## New client checklist
1. Copy the repo / create a branch for the client.
2. Edit `js/config.js`: name, WhatsApp number (digits only), address, map links, colours, rooms, packages, gallery.
3. Replace placeholder (Unsplash) images with the client's own photos (WebP, ~200 KB each) and update the paths in config.
4. Remove or replace every item marked `DEMO` (ratings, policies, claims). Do not publish invented figures.
5. Open each page on a phone-size screen and test every WhatsApp button.

## Tailwind: development vs production
Pages currently load the Tailwind CDN (fine for development, not for production). To switch:
```
npm install
npm run build:css      # creates css/tailwind.css
```
Then in each HTML `<head>` replace the two lines `cdn.tailwindcss.com` + `js/tailwind-theme.js` with
`<link rel="stylesheet" href="css/tailwind.css" />`. Re-run the build whenever you add new Tailwind classes.
