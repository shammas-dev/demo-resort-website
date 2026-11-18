/* Page content rendered from config.js (rooms, packages, gallery, story, etc.).
   Each renderer only runs if its mount element exists on the current page. */
(function renderSections() {
  const { cfg, esc, money, img, get } = Resort;
  const rooms = cfg.rooms || [];
  const $ = (sel) => document.querySelector(sel);
  const put = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; return !!el; };

  // Simple text/attribute bindings:  data-cfg="pages.rooms.heading"  data-cfg-src="hero.image"  data-cfg-alt="hero.imageAlt"
  document.querySelectorAll("[data-cfg]").forEach((el) => {
    const v = get(el.dataset.cfg);
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll("[data-cfg-src]").forEach((el) => {
    const v = get(el.dataset.cfgSrc);
    if (v) el.setAttribute("src", el.dataset.w ? img(v, el.dataset.w) : v);
  });
  document.querySelectorAll("[data-cfg-alt]").forEach((el) => {
    const v = get(el.dataset.cfgAlt);
    if (v) el.setAttribute("alt", v);
  });

  // ---------- HOME: hero price pill ----------
  if (rooms.length) {
    const min = Math.min(...rooms.map((r) => r.price));
    const r = cfg.rating || {};
    const rating = r.show ? `<span class="text-gold font-bold">★ ${esc(r.score)}</span><span>•</span>` : "";
    const note = cfg.hero && cfg.hero.priceNote ? ` (${esc(cfg.hero.priceNote)})` : "";
    put(
      "#heroPill",
      `<div class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium mb-6">
        ${rating}<span>Stays from <strong class="text-white">${money(min)} / night</strong>${note}</span>
      </div>`
    );
  }

  // ---------- HOME: trust bar ----------
  put(
    "#trustBar",
    (cfg.trustBar || [])
      .map(
        (t) => `<div class="text-center w-[calc(50%-1.25rem)] md:w-auto md:flex-1">
          <p class="text-gold font-bold text-base md:text-lg">${esc(t.title)}</p>
          <p class="text-white/70">${esc(t.text)}</p></div>`
      )
      .join("")
  );

  // ---------- HOME: stay cards ----------
  const badgeCls = ["bg-white/90 backdrop-blur-md text-forest", "bg-gold text-white", "bg-forest text-white"];
  put(
    "#stayCards",
    rooms
      .map(
        (r, i) => `<article class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col reveal">
        <div class="relative h-64 overflow-hidden group">
          <img src="${esc(img(r.image, 900))}" alt="${esc(r.name)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          ${r.badge ? `<span class="absolute top-3 left-3 ${badgeCls[i % 3]} text-xs font-bold px-3 py-1 rounded-full">${esc(r.badge)}</span>` : ""}
        </div>
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start gap-2">
              <h3 class="font-serif text-2xl font-semibold text-forest">${esc(r.name)}</h3>
              <div class="text-right"><span class="text-xl font-bold text-charcoal tabular-nums">${money(r.price)}</span><span class="block text-[11px] text-gray-500">per night</span></div>
            </div>
            <p class="text-gray-600 text-sm mt-3 leading-relaxed">${esc(r.shortDesc)}</p>
            <div class="flex flex-wrap gap-2 mt-4 text-xs font-medium text-gray-600">${(r.tags || []).map((t) => `<span class="bg-sand px-2.5 py-1 rounded-md">${esc(t)}</span>`).join("")}</div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-100">
            <button type="button" data-select-room="${esc(r.id)}" class="w-full bg-forest hover:bg-forestLight text-white text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer">Select & Book</button>
          </div>
        </div>
      </article>`
      )
      .join("")
  );

  put(
    "#moreStays",
    `<div class="mt-12 text-center reveal"><div class="inline-flex flex-col sm:flex-row items-center gap-4 bg-sand/80 border border-gray-200/80 px-6 py-4 rounded-2xl">
      ${cfg.moreStaysNote ? `<p class="text-sm text-gray-700">${esc(cfg.moreStaysNote)}</p>` : ""}
      <a href="rooms.html" class="inline-flex items-center gap-2 bg-forest hover:bg-forestLight text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm">Explore all ${rooms.length} stays & rates →</a>
    </div></div>`
  );

  // ---------- HOME: story ----------
  const s = cfg.story;
  if (s) {
    put(
      "#storyContent",
      `<div class="reveal">
        <span class="text-gold font-semibold text-xs uppercase tracking-widest">${esc(s.eyebrow)}</span>
        <h2 class="font-serif text-4xl md:text-5xl font-semibold text-forest mt-2 leading-tight">${esc(s.title)}</h2>
        <p class="text-gray-600 mt-5 leading-relaxed">${esc(s.text)}</p>
        <div class="grid gap-4 mt-8 pt-8 border-t border-gray-300/60" style="grid-template-columns:repeat(${(s.stats || []).length || 1},minmax(0,1fr))">
          ${(s.stats || []).map((x) => `<div><p class="font-serif text-3xl font-bold text-forest">${esc(x.value)}</p><p class="text-xs text-gray-500 mt-1">${esc(x.label)}</p></div>`).join("")}
        </div>
      </div>
      <div class="relative reveal"><img src="${esc(img(s.image, 1000))}" alt="${esc(s.imageAlt)}" loading="lazy" class="w-full h-[460px] object-cover rounded-t-full rounded-b-3xl shadow-xl" /></div>`
    );
  }

  // ---------- HOME: experiences ----------
  const ex = cfg.experiences;
  if (ex) {
    put(
      "#experiencesContent",
      `<div class="flex flex-col md:flex-row md:items-end justify-between mb-14 reveal">
        <div><span class="text-gold font-semibold text-xs uppercase tracking-widest">${esc(ex.eyebrow)}</span>
        <h2 class="font-serif text-4xl md:text-5xl font-semibold text-forest mt-2">${esc(ex.title)}</h2></div>
        <a href="gallery.html" class="text-forest font-semibold text-sm underline underline-offset-4 hover:text-gold transition mt-3 md:mt-0">Explore full photo gallery →</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${(ex.items || []).map((i) => `<div class="relative h-80 rounded-2xl overflow-hidden group reveal">
          <img src="${esc(img(i.image, 700))}" alt="${esc(i.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
            <h3 class="font-serif text-2xl font-semibold">${esc(i.title)}</h3><p class="text-xs text-white/80 mt-1">${esc(i.text)}</p></div></div>`).join("")}
      </div>`
    );
  }

  // ---------- ROOMS PAGE ----------
  put(
    "#roomsList",
    rooms
      .map((r, i) => {
        const flip = i % 2 === 1;
        return `<article class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 reveal">
          <div class="lg:col-span-6 ${flip ? "lg:order-2" : ""} h-80 md:h-96 rounded-2xl overflow-hidden">
            <img src="${esc(img(r.image, 1000))}" alt="${esc(r.name)}" loading="lazy" class="w-full h-full object-cover hover:scale-105 transition duration-500" />
          </div>
          <div class="lg:col-span-6 ${flip ? "lg:order-1" : ""} space-y-4">
            <div class="flex justify-between items-center gap-3">
              <span class="bg-sand text-forest text-xs font-bold px-3 py-1 rounded-full">${esc(r.area)} • ${esc(r.guests)}</span>
              <span class="text-2xl font-bold text-forest tabular-nums shrink-0">${money(r.price)} <span class="text-xs font-normal text-gray-500">/ night</span></span>
            </div>
            <h2 class="font-serif text-3xl md:text-4xl font-semibold text-forest">${esc(r.name)}</h2>
            <p class="text-gray-600 text-sm leading-relaxed">${esc(r.description || r.shortDesc)}</p>
            <ul class="grid grid-cols-2 gap-2 text-xs text-gray-700 pt-2">${(r.amenities || []).map((a) => `<li>✓ ${esc(a)}</li>`).join("")}</ul>
            <div class="pt-4"><button type="button" data-quick-room="${esc(r.id)}" class="bg-forest hover:bg-forestLight text-white text-sm font-semibold px-6 py-3 rounded-xl transition cursor-pointer">Book This Room on WhatsApp →</button></div>
          </div>
        </article>`;
      })
      .join("")
  );

  if ($("#compareTable") && rooms.length) {
    const labels = [];
    rooms.forEach((r) => Object.keys(r.compare || {}).forEach((k) => { if (!labels.includes(k)) labels.push(k); }));
    const row = (label, cell, bold) =>
      `<tr><td class="py-3.5 pr-4 font-medium">${esc(label)}</td>${rooms.map((r) => `<td class="py-3.5 px-4 ${bold ? "font-bold" : ""}">${cell(r)}</td>`).join("")}</tr>`;
    put(
      "#compareTable",
      `<table class="w-full text-left text-sm">
        <thead><tr class="border-b border-gray-200 text-gray-500 uppercase text-xs"><th class="py-3 pr-4">Feature</th>${rooms.map((r) => `<th class="py-3 px-4 text-forest">${esc(r.name)}</th>`).join("")}</tr></thead>
        <tbody class="divide-y divide-gray-100">
          ${row("Direct Tariff", (r) => `${money(r.price)} / night`, true)}
          ${row("Area", (r) => esc(r.area))}
          ${row("Guests", (r) => esc(r.guests))}
          ${labels.map((l) => row(l, (r) => esc((r.compare || {})[l] || "—"))).join("")}
        </tbody></table>`
    );
  }

  // ---------- CONTACT PAGE: packages ----------
  put(
    "#packageGrid",
    (cfg.packages || [])
      .map(
        (p) => `<div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <span class="${p.highlight ? "bg-gold/15 text-gold" : "bg-sand text-forest"} text-xs font-bold px-3 py-1 rounded-full">${esc(p.duration)}</span>
          <h3 class="font-serif text-3xl font-semibold text-forest mt-4">${esc(p.name)}</h3>
          <p class="text-2xl font-bold text-charcoal mt-2 tabular-nums">${esc(p.priceLabel)} <span class="text-xs font-normal text-gray-500">${esc(p.priceNote)}</span></p>
          <ul class="mt-4 space-y-2 text-sm text-gray-600">${(p.features || []).map((f) => `<li>• ${esc(f)}</li>`).join("")}</ul>
        </div>
        <button type="button" data-quick-package="${esc(p.id)}" class="mt-6 w-full bg-forest hover:bg-forestLight text-white font-semibold text-sm py-3 rounded-xl transition cursor-pointer">Enquire Package on WhatsApp →</button>
      </div>`
      )
      .join("")
  );

  // ---------- GALLERY PAGE ----------
  const g = cfg.gallery;
  if (g) {
    put(
      "#galleryFilters",
      (g.categories || [])
        .map(
          (c, i) => `<button type="button" data-filter="${esc(c.id)}" class="filter-btn ${i === 0 ? "active bg-gold" : "bg-white/10 hover:bg-white/20"} text-white text-xs md:text-sm font-semibold px-5 py-2 rounded-full transition cursor-pointer">${esc(c.label)}</button>`
        )
        .join("")
    );
    put(
      "#galleryGrid",
      (g.items || [])
        .map(
          (it) => `<button type="button" data-gallery-item data-category="${esc(it.category)}" data-caption="${esc(it.caption)}" class="gallery-item group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm text-left">
          <img src="${esc(img(it.src, 900))}" alt="${esc(it.alt || it.caption)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <span class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-end p-5 text-white font-serif text-xl">${esc(it.caption)}</span>
        </button>`
        )
        .join("")
    );
  }
})();
