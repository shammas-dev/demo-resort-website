/* Shared site shell (header, mobile menu, footer, floating buttons) + small helpers.
   Rendered from config.js on every page, so a fix here fixes all pages. */
const Resort = (() => {
  const cfg = typeof RESORT_CONFIG !== "undefined" ? RESORT_CONFIG : {};
  const page = document.documentElement.dataset.page || "";

  // Escape text before putting config values into HTML
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "₹" + Number(n).toLocaleString("en-IN");
  // Resize Unsplash-style ?w=900 URLs; other URLs pass through unchanged
  const img = (url, w) => String(url || "").replace(/([?&]w=)\d+/, "$1" + w);
  const waUrl = (msg) => `https://wa.me/${String(cfg.whatsappNumber || "").replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  const get = (path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), cfg);

  return { cfg, page, esc, money, img, waUrl, get };
})();

(function renderShell() {
  const { cfg, page, esc, waUrl } = Resort;

  const WA_ICON = `<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.86 11.86 0 0012.07 0C5.49 0 .16 5.32.16 11.9c0 2.1.55 4.15 1.6 5.95L0 24l6.33-1.66a11.87 11.87 0 005.74 1.46h.01c6.58 0 11.92-5.33 11.92-11.9a11.83 11.83 0 00-3.48-8.42zM12.08 21.8h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.76.98 1-3.66-.24-.38a9.86 9.86 0 01-1.51-5.25c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 012.9 7c0 5.45-4.44 9.9-9.88 9.9zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/></svg>`;
  const PIN_ICON = `<svg class="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>`;

  // Replace a mount <div id="..."> with real markup (keeps sticky/fixed positioning working)
  function mount(id, html) {
    const el = document.getElementById(id);
    if (!el) return null;
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    const node = t.content.firstElementChild;
    el.replaceWith(node);
    return node;
  }

  const nav = cfg.nav || [];
  const hasStickyBar = !!document.querySelector("[data-sticky-bar]");

  // ---------- HEADER ----------
  const headerMount = document.getElementById("site-header");
  if (headerMount) {
    const overlay = headerMount.dataset.variant === "overlay";
    const desktopLinks = nav
      .map((n) => {
        const active = n.page === page;
        return `<a href="${esc(n.href)}" class="${active ? "text-gold font-semibold" : "hover:text-gold transition"}"${active ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`;
      })
      .join("");
    const mobileLinks = nav
      .map((n) => `<a href="${esc(n.href)}" class="block py-2 ${n.page === page ? "text-gold font-semibold" : "hover:text-gold transition"}">${esc(n.label)}</a>`)
      .join("");
    const ctaHref = overlay ? "#booking-dock" : "index.html#booking-dock";
    const ctaLabel = overlay ? "Check Rates" : "Book Direct";
    const badge =
      overlay && cfg.headerBadge
        ? `<span class="hidden lg:inline-flex items-center gap-1.5 text-xs bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>${esc(cfg.headerBadge)}</span>`
        : "";
    const headerClass = overlay
      ? 'id="navbar" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-5 md:px-12 text-white"'
      : 'class="sticky top-0 z-50 bg-forest/95 backdrop-blur-md py-4 px-5 md:px-12 text-white shadow-md"';

    const header = mount(
      "site-header",
      `<header ${headerClass}>
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a href="index.html" class="flex items-center gap-2" aria-label="${esc(cfg.brandName)} home">
            <span class="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white font-serif font-bold text-lg">${esc(cfg.logoInitial)}</span>
            <span class="font-serif text-2xl md:text-3xl font-semibold tracking-wide">${esc(cfg.shortName)}</span>
          </a>
          <nav class="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide" aria-label="Main">${desktopLinks}</nav>
          <div class="flex items-center gap-3">
            ${badge}
            <a href="${ctaHref}" class="bg-gold hover:bg-goldHover text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full transition shadow-lg">${ctaLabel}</a>
            <button type="button" id="menuToggle" class="md:hidden text-white p-2 -mr-2 cursor-pointer" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
        <div id="mobileMenu" class="hidden md:hidden bg-forest/95 backdrop-blur-lg border-t border-white/10 mt-3 rounded-2xl px-5 py-3 text-sm font-medium shadow-xl">${mobileLinks}</div>
      </header>`
    );

    const toggle = header.querySelector("#menuToggle");
    const menu = header.querySelector("#mobileMenu");
    const setOpen = (open) => {
      menu.classList.toggle("hidden", !open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(menu.classList.contains("hidden")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // ---------- FOOTER ----------
  const quickLinks = (cfg.footerLinks || [])
    .map((l) => `<li><a href="${esc(l.href)}" class="hover:text-gold transition">${esc(l.label)}</a></li>`)
    .join("");
  mount(
    "site-footer",
    `<footer class="bg-forest text-alabaster pt-16 ${hasStickyBar ? "pb-24" : "pb-12"} md:pb-12 px-5 md:px-12">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/15">
        <div>
          <h2 class="font-serif text-3xl font-semibold">${esc(cfg.brandName)}</h2>
          <p class="text-white/70 text-sm mt-3 leading-relaxed">${esc(cfg.address)}</p>
          <p class="text-gold text-sm font-medium mt-4">Check-in: ${esc(cfg.checkInTime)} • Check-out: ${esc(cfg.checkOutTime)}</p>
        </div>
        <div>
          <h3 class="font-semibold text-sm uppercase tracking-wider text-gold mb-4">Quick Links</h3>
          <ul class="space-y-2 text-sm text-white/80">${quickLinks}</ul>
        </div>
        <div>
          <h3 class="font-semibold text-sm uppercase tracking-wider text-gold mb-4">Direct Reservations</h3>
          <p class="text-sm text-white/80">Phone / WhatsApp: <a href="tel:+${esc(String(cfg.whatsappNumber).replace(/\D/g, ""))}" class="hover:text-gold transition">${esc(cfg.phoneDisplay)}</a></p>
          <p class="text-sm text-white/80 mt-1">Email: <a href="mailto:${esc(cfg.email)}" class="hover:text-gold transition">${esc(cfg.email)}</a></p>
          <a href="${waUrl(`Hi ${cfg.brandName}! I have a booking enquiry.`)}" target="_blank" rel="noopener noreferrer"
             class="inline-block mt-5 bg-gold hover:bg-goldHover text-white text-sm font-semibold px-6 py-3 rounded-xl transition">Chat with Reservations</a>
        </div>
      </div>
      <div class="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-white/50 gap-3">
        <p>© ${new Date().getFullYear()} ${esc(cfg.brandName)}. All rights reserved.</p>
        <p>${esc(cfg.footerNote || "")}</p>
      </div>
    </footer>`
  );

  // ---------- FLOATING MAP + WHATSAPP ----------
  const tip = (t) =>
    `<span class="hidden md:block absolute right-14 bg-charcoal text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow">${t}</span>`;
  mount(
    "site-floating",
    `<div class="fixed ${hasStickyBar ? "bottom-20" : "bottom-5"} md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-3">
      <a href="${esc(cfg.mapUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open resort location on Google Maps"
         class="group relative w-12 h-12 rounded-full bg-forest text-white shadow-2xl border-2 border-gold/60 flex items-center justify-center hover:bg-forestLight hover:scale-110 transition-all duration-300">${PIN_ICON}${tip("View Route Map")}</a>
      <a href="${waUrl(`Hi ${cfg.brandName}! I have a query.`)}" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
         class="group relative w-12 h-12 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300">${WA_ICON}${tip("Chat on WhatsApp")}</a>
    </div>`
  );
})();
