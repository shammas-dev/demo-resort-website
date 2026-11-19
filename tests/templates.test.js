const assert = require("assert");
const T = require("../js/templates.js");
const { loadConfigFile } = require("../scripts/check.js");
const path = require("path");
// tests use a fixed copy of the demo config, so they keep passing when a client replaces js/config.js
const cfg = loadConfigFile(path.join(__dirname, "fixtures", "demo-config.js"));
const clone = (o) => JSON.parse(JSON.stringify(o));
let n = 0;
const test = (name, fn) => { fn(); n++; console.log("  ok  " + name); };
const ctx = { page: "rooms", variant: "solid", hasStickyBar: false, year: 2026 };

test("bronze keeps white text readable (contrast >= 4.5) for any gold", () => {
  ["#C88A55", "#FFD700", "#E0B040", "#8A5A2B", "#FFFFFF"].forEach((gold) => {
    const v = T.themeVars({ theme: { gold } })["--c-bronze"].split(" ").map(Number);
    assert.ok(T.contrastOnWhite(v) >= 4.5, `${gold} -> ${v} = ${T.contrastOnWhite(v).toFixed(2)}`);
  });
});

test("a dark gold is left unchanged; explicit theme.bronze wins", () => {
  assert.equal(T.themeVars({ theme: { gold: "#8A5A2B" } })["--c-bronze"], "138 90 43");
  assert.equal(T.themeVars({ theme: { gold: "#C88A55", bronze: "#112233" } })["--c-bronze"], "17 34 51");
});

test("invalid colours are ignored, camelCase keys become css variables", () => {
  const v = T.themeVars({ theme: { forestLight: "#234736", gold: "nope" } });
  assert.equal(v["--c-forest-light"], "35 71 54");
  assert.equal(v["--c-gold"], undefined);
});

test("every mount renders clean HTML (no undefined / NaN / [object])", () => {
  T.MOUNTS.forEach((m) => {
    const html = m.render(cfg, { ...ctx, page: "home" });
    assert.equal(typeof html, "string", m.id);
    assert.ok(!/undefined|NaN|\[object/.test(html), `${m.id} contains undefined/NaN`);
  });
});

test("text from config is escaped (no HTML injection)", () => {
  const evil = { ...cfg, rooms: [{ ...cfg.rooms[0], name: '<script>alert(1)</script> & "Villa"' }] };
  const html = T.stayCards(evil) + T.roomsList(evil) + T.compareTable(evil);
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});

test("one card per room; compare table lists custom rows", () => {
  assert.equal((T.stayCards(cfg).match(/<article/g) || []).length, cfg.rooms.length);
  assert.ok(T.compareTable(cfg).includes("Private Pool / Tub"));
});

test("guests text is generated from capacity, or custom text wins", () => {
  assert.equal(T.guestsText({ maxAdults: 2, maxChildren: 1 }), "Max 2 Adults + 1 Child");
  assert.equal(T.guestsText({ maxAdults: 2, maxChildren: 2 }), "Max 2 Adults + 2 Children");
  assert.equal(T.guestsText({ maxAdults: 2, maxChildren: 0 }), "Max 2 Adults");
  assert.equal(T.guestsText({ guests: "Sleeps 6" }), "Sleeps 6");
  assert.equal(T.guestsText({}), "");
});

test("header marks the current page, has skip link and mobile menu", () => {
  const html = T.header(cfg, ctx);
  assert.ok(/aria-current="page"/.test(html) && html.includes("Skip to content") && html.includes('id="mobileMenu"'));
});

test("footer shows the policies link only when enabled", () => {
  assert.ok(T.footer(cfg, ctx).includes("policies.html"));
  assert.ok(!T.footer({ ...cfg, policies: { enabled: false } }, ctx).includes("policies.html"));
});

test("structured data: no invented rating, optional fields only when set", () => {
  const d = T.jsonLd(cfg, "https://example.com");
  assert.equal(d["@type"], "LodgingBusiness");
  assert.equal(d.aggregateRating, undefined);
  assert.equal(d.geo, undefined);
  assert.ok(d.priceRange.includes("₹"));
  const d2 = T.jsonLd({ ...cfg, seo: { geo: { lat: 11.5, lng: 76.1 }, social: ["https://x.com/a"] } }, "");
  assert.equal(d2.geo.latitude, 11.5);
  assert.deepEqual(d2.sameAs, ["https://x.com/a"]);
});

test("WhatsApp link keeps digits only and encodes the message", () => {
  const url = T.waUrl({ whatsappNumber: "+91 86064-11892" }, "Hi & bye\nline2");
  assert.equal(url, "https://wa.me/918606411892?text=Hi%20%26%20bye%0Aline2");
});

// ---------- different shapes of client ----------
const clean = (html, label) => assert.ok(!/undefined|NaN|\[object/.test(html), `${label} contains undefined/NaN`);
const allMounts = (c) => T.MOUNTS.forEach((m) => clean(m.render(c, { ...ctx, page: "home" }), m.id));

test("one room: centred card, no comparison table, sensible link text", () => {
  const c = clone(cfg); c.rooms = [c.rooms[0]];
  assert.ok(T.stayCards(c).includes("max-w-md"));
  assert.equal(T.compareTable(c), "");
  assert.ok(T.moreStays(c).includes("View details & rates") && !T.moreStays(c).includes("Explore all"));
  allMounts(c);
});

test("two and six rooms use matching grids", () => {
  const two = clone(cfg); two.rooms = two.rooms.slice(0, 2);
  assert.ok(T.stayCards(two).includes("md:grid-cols-2 max-w-4xl"));
  const six = clone(cfg); six.rooms = [...six.rooms, ...clone(six.rooms).map((r, i) => ({ ...r, id: "x" + i }))];
  assert.ok(T.stayCards(six).includes("lg:grid-cols-3"));
  assert.equal((T.stayCards(six).match(/<article/g) || []).length, 6);
  allMounts(six);
});

test("optional sections disappear completely when the config leaves them out", () => {
  const c = clone(cfg);
  c.story = null; c.experiences = null; c.trustBar = []; c.packages = []; delete c.gallery; c.rating = { show: false }; c.headerBadge = "";
  ["story", "experiences", "trustBar", "packageGrid"].forEach((fn) => assert.equal(T[fn](c), "", fn));
  assert.equal(T.galleryGrid(c) + T.galleryFilters(c), "");
  assert.ok(!T.heroPill(c).includes("★"));
  assert.ok(!T.header(c, { ...ctx, variant: "overlay" }).includes("Direct Rate Guarantee"));
  allMounts(c);
});

test("packages heading comes from config; 1 package is not stretched", () => {
  const c = clone(cfg); c.packages = [c.packages[0]]; c.pages.contact.packagesHeading = "Special Offers";
  const html = T.packageGrid(c);
  assert.ok(html.includes("Special Offers") && html.includes("max-w-xl"));
});

test("map: embed when set, link card when only a link exists, nothing when neither", () => {
  assert.ok(T.mapBlock(cfg).includes("<iframe"));
  const link = clone(cfg); link.mapEmbedUrl = "";
  assert.ok(!T.mapBlock(link).includes("<iframe") && T.mapBlock(link).includes("Google Maps"));
  const none = clone(cfg); none.mapEmbedUrl = ""; none.mapUrl = "";
  assert.equal(T.mapBlock(none), "");
});

console.log(`\n${n} tests passed`);
