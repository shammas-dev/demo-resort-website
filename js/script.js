/* Booking dock, WhatsApp actions, gallery. All data comes from config.js via Resort (components.js).
   Shell (header/footer/floating buttons) lives in components.js; page content in sections.js. */
const { cfg: CONFIG, waUrl, money } = Resort;
const RESORT_NAME = CONFIG.brandName;
const ROOMS = CONFIG.rooms || [];
const getRoom = (id) => ROOMS.find((r) => r.id === id);
const openWhatsApp = (msg) => window.open(waUrl(msg), "_blank", "noopener");

// DOM elements (only present on the home page)
const checkinInput = document.getElementById("checkin");
const checkoutInput = document.getElementById("checkout");
const roomTypeSelect = document.getElementById("roomType");
const guestsInput = document.getElementById("guests");
const nightsLabel = document.getElementById("nightsLabel");
const totalPriceEl = document.getElementById("totalPrice");
const bookingCtaText = document.getElementById("bookingCtaText");
const navbar = document.getElementById("navbar");

let checkinPicker, checkoutPicker;
let adultGuests = 2;
let childGuests = 0;
let roomCount = 1;

function isLivePriceEnabled() {
  return !(CONFIG.pricing && CONFIG.pricing.showLivePrice === false);
}

// 1. Fill booking dock from config
function applyBookingConfig() {
  if (ROOMS.length) {
    const minPrice = Math.min(...ROOMS.map((r) => r.price));
    document.querySelectorAll("[data-starting-price]").forEach((el) => (el.textContent = money(minPrice)));

    if (roomTypeSelect) {
      roomTypeSelect.innerHTML = ROOMS.map(
        (r) => `<option value="${Resort.esc(r.id)}">${Resort.esc(r.name)} — ${money(r.price)}/nt</option>`
      ).join("");
    }
  }
  if (bookingCtaText) {
    bookingCtaText.textContent = isLivePriceEnabled() ? "Book via WhatsApp" : "Get Quote on WhatsApp";
  }
}

// 2. Guests & rooms stepper (+ / -)
function updateCount(type, delta) {
  if (type === "adults") {
    adultGuests = Math.max(1, Math.min(30, adultGuests + delta));
    const el = document.getElementById("adultCount");
    if (el) el.textContent = adultGuests;
  } else if (type === "children") {
    childGuests = Math.max(0, Math.min(15, childGuests + delta));
    const el = document.getElementById("childCount");
    if (el) el.textContent = childGuests;
  } else if (type === "rooms") {
    roomCount = Math.max(1, Math.min(15, roomCount + delta));
    const el = document.getElementById("roomCount");
    if (el) el.textContent = roomCount;
  }

  const parts = [`${adultGuests} Adult${adultGuests > 1 ? "s" : ""}`];
  if (childGuests > 0) parts.push(`${childGuests} Kid${childGuests > 1 ? "s" : ""}`);
  parts.push(`${roomCount} Room${roomCount > 1 ? "s" : ""}`);

  if (guestsInput) guestsInput.value = parts.join(", ");
  calculateTotal();
}

// 3. Date pickers (d/M/Y, e.g. 18/Nov/2026)
function initDefaultDates() {
  if (!checkinInput || !checkoutInput || typeof flatpickr === "undefined") return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  checkinPicker = flatpickr(checkinInput, {
    dateFormat: "d/M/Y",
    minDate: "today",
    defaultDate: tomorrow,
    disableMobile: true,
    onChange: function (selectedDates) {
      if (selectedDates[0]) {
        const nextDay = new Date(selectedDates[0]);
        nextDay.setDate(nextDay.getDate() + 1);
        checkoutPicker.set("minDate", nextDay);
        if (checkoutPicker.selectedDates[0] <= selectedDates[0]) checkoutPicker.setDate(nextDay);
        calculateTotal();
      }
    }
  });

  checkoutPicker = flatpickr(checkoutInput, {
    dateFormat: "d/M/Y",
    minDate: dayAfter,
    defaultDate: dayAfter,
    disableMobile: true,
    onChange: calculateTotal
  });

  calculateTotal();
}

// 4. Rate calculator (booking dock)
function getBookingCalculation() {
  const checkinDate = checkinPicker ? checkinPicker.selectedDates[0] : null;
  const checkoutDate = checkoutPicker ? checkoutPicker.selectedDates[0] : null;
  const room = (roomTypeSelect && getRoom(roomTypeSelect.value)) || ROOMS[0] || { name: "", price: 0 };
  const baseRate = room.price;

  const pricing = CONFIG.pricing || { showLivePrice: true, baseAdultsPerRoom: 2, extraAdultPrice: 0, extraChildPrice: 0, gstPercent: 0 };

  let nights = 1;
  if (checkinDate && checkoutDate && checkoutDate > checkinDate) {
    nights = Math.max(1, Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)));
  }

  const includedAdults = roomCount * (pricing.baseAdultsPerRoom || 2);
  const extraAdults = Math.max(0, adultGuests - includedAdults);
  const perNightTotal = roomCount * baseRate + extraAdults * (pricing.extraAdultPrice || 0) + childGuests * (pricing.extraChildPrice || 0);

  let grandTotal = nights * perNightTotal;
  if (pricing.gstPercent && pricing.gstPercent > 0) grandTotal = Math.round(grandTotal * (1 + pricing.gstPercent / 100));

  const detailTags = [`${nights} Night${nights > 1 ? "s" : ""}`, `${roomCount} Room${roomCount > 1 ? "s" : ""}`];
  if (extraAdults > 0 && (pricing.extraAdultPrice || 0) > 0) detailTags.push(`+${extraAdults} Extra Adult`);
  if (childGuests > 0 && (pricing.extraChildPrice || 0) > 0) detailTags.push(`+${childGuests} Kid${childGuests > 1 ? "s" : ""}`);

  return {
    room,
    nights,
    roomCount,
    extraAdults,
    grandTotal,
    summaryLabel: detailTags.join(" • "),
    showLivePrice: pricing.showLivePrice !== false
  };
}

function calculateTotal() {
  if (!roomTypeSelect) return;
  const calc = getBookingCalculation();
  if (nightsLabel) nightsLabel.textContent = calc.summaryLabel;
  if (totalPriceEl) totalPriceEl.textContent = calc.showLivePrice ? money(calc.grandTotal) : "Custom Quote";
}

// 5. One-tap room selection from home cards
function selectRoomAndScroll(roomId) {
  if (!roomTypeSelect) return;
  roomTypeSelect.value = roomId;
  calculateTotal();
  const dock = document.getElementById("booking-dock");
  if (dock) dock.scrollIntoView({ behavior: "smooth", block: "center" });
}

// 6. WhatsApp actions
function bookViaWhatsApp() {
  if (!roomTypeSelect) return openWhatsApp(`Hi ${RESORT_NAME}! I'd like to check room availability.`);

  const calc = getBookingCalculation();
  const checkin = checkinInput.value || "Flexible";
  const checkout = checkoutInput.value || "Flexible";
  const guestsText = guestsInput ? guestsInput.value : `${adultGuests} Adults, ${roomCount} Room`;
  const stay = `${calc.room.name} × ${calc.roomCount} Room${calc.roomCount > 1 ? "s" : ""} (${money(calc.room.price)}/nt)`;

  const message = calc.showLivePrice
    ? `Hi ${RESORT_NAME}! I'd like to check availability & book:\n\n• *Stay:* ${stay}\n• *Check-in:* ${checkin}\n• *Check-out:* ${checkout}\n• *Guests:* ${guestsText}\n• *Breakdown:* ${calc.summaryLabel}\n• *Estimated Total:* ${money(calc.grandTotal)}`
    : `Hi ${RESORT_NAME}! Please share best rates & availability for:\n\n• *Stay:* ${stay}\n• *Check-in:* ${checkin}\n• *Check-out:* ${checkout}\n• *Guests:* ${guestsText} (${calc.nights} Night${calc.nights > 1 ? "s" : ""})`;
  openWhatsApp(message);
}

function quickBookRoom(roomId) {
  const room = getRoom(roomId);
  if (!room) return;
  openWhatsApp(`Hi ${RESORT_NAME}! I'm interested in booking the *${room.name}* (${money(room.price)}/night). Please share availability & best offer for my dates.`);
}

function quickBookPackage(packageId) {
  const pkg = (CONFIG.packages || []).find((p) => p.id === packageId);
  if (!pkg) return;
  openWhatsApp(`Hi ${RESORT_NAME}! I'd like to enquire about the *${pkg.name}* — ${pkg.duration} (${pkg.priceLabel}). Please share package availability.`);
}

function submitCustomEnquiry(event) {
  event.preventDefault();
  const val = (id) => document.getElementById(id).value;
  const notes = val("enqNotes") || "None";
  openWhatsApp(`Hi ${RESORT_NAME}! Custom Stay Enquiry:\n\n• *Name:* ${val("enqName")}\n• *Dates:* ${val("enqDates")}\n• *Guests:* ${val("enqGuests")}\n• *Notes:* ${notes}`);
}

// 7. Gallery filter + lightbox
function applyGalleryFilter(btn) {
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.remove("active", "bg-gold");
    b.classList.add("bg-white/10");
  });
  btn.classList.add("active", "bg-gold");
  btn.classList.remove("bg-white/10");

  const filter = btn.dataset.filter;
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.style.display = filter === "all" || item.dataset.category === filter ? "block" : "none";
  });
}

function openLightbox(item) {
  const modal = document.getElementById("lightboxModal");
  const image = item.querySelector("img");
  if (!modal || !image) return;
  document.getElementById("lightboxImg").src = image.src;
  document.getElementById("lightboxImg").alt = image.alt;
  document.getElementById("lightboxCaption").textContent = item.dataset.caption || "";
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeLightbox() {
  const modal = document.getElementById("lightboxModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// 8. Click handling for rendered content (works for elements created by sections.js)
document.addEventListener("click", (e) => {
  const t = (sel) => e.target.closest(sel);
  let el;
  if ((el = t("[data-select-room]"))) return selectRoomAndScroll(el.dataset.selectRoom);
  if ((el = t("[data-quick-room]"))) return quickBookRoom(el.dataset.quickRoom);
  if ((el = t("[data-quick-package]"))) return quickBookPackage(el.dataset.quickPackage);
  if ((el = t("[data-gallery-item]"))) return openLightbox(el);
  if ((el = t("[data-filter]"))) return applyGalleryFilter(el);
});

// 9. Home header: solid background after scrolling
if (navbar) {
  const onScroll = () => navbar.classList.toggle("navbar-scrolled", window.scrollY > 50);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// 10. Scroll reveal (content stays visible if IntersectionObserver is unavailable)
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) return items.forEach((el) => el.classList.add("active"));
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.1 }
  );
  items.forEach((el) => observer.observe(el));
}

// Boot
if (roomTypeSelect) roomTypeSelect.addEventListener("change", calculateTotal);
applyBookingConfig();
initDefaultDates();
initReveal();
