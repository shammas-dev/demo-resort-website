const WHATSAPP_NUMBER = typeof RESORT_CONFIG !== "undefined" ? RESORT_CONFIG.whatsappNumber : "918606411892";
const RESORT_NAME = typeof RESORT_CONFIG !== "undefined" ? RESORT_CONFIG.brandName : "Vana Mist Resort";

// DOM Elements
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

// Check if Booking Dock should show live calculated total or Custom Quote
function isLivePriceEnabled() {
  if (typeof RESORT_CONFIG !== "undefined" && RESORT_CONFIG.pricing && RESORT_CONFIG.pricing.showLivePrice === false) {
    return false;
  }
  return true;
}

// 1. Apply Config Data Across All Pages
function applyResortConfig() {
  if (typeof RESORT_CONFIG === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--color-forest", RESORT_CONFIG.theme.forest);
  root.style.setProperty("--color-forest-light", RESORT_CONFIG.theme.forestLight);
  root.style.setProperty("--color-gold", RESORT_CONFIG.theme.gold);
  root.style.setProperty("--color-gold-hover", RESORT_CONFIG.theme.goldHover);

  document.querySelectorAll("[data-brand-name]").forEach((el) => (el.textContent = RESORT_CONFIG.brandName));
  document.querySelectorAll("[data-short-name]").forEach((el) => (el.textContent = RESORT_CONFIG.shortName));
  document.querySelectorAll("[data-logo-initial]").forEach((el) => (el.textContent = RESORT_CONFIG.logoInitial));
  document.querySelectorAll("[data-address]").forEach((el) => (el.textContent = RESORT_CONFIG.address));
  document.querySelectorAll("[data-phone]").forEach((el) => (el.textContent = RESORT_CONFIG.phoneDisplay));
  document.querySelectorAll("[data-email]").forEach((el) => (el.textContent = RESORT_CONFIG.email));

  // Sync Floating Map & WhatsApp Buttons
  const mapBtn = document.getElementById("floatingMapBtn");
  if (mapBtn && RESORT_CONFIG.mapUrl) mapBtn.href = RESORT_CONFIG.mapUrl;

  const waBtn = document.getElementById("floatingWhatsappBtn");
  if (waBtn && RESORT_CONFIG.whatsappNumber) {
    waBtn.href = `https://wa.me/${RESORT_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hi ${RESORT_CONFIG.brandName}! I have a query.`)}`;
  }

  // Always show room rates across hero pill, dropdown & cards
  if (RESORT_CONFIG.rooms && RESORT_CONFIG.rooms.length > 0) {
    const minPrice = Math.min(...RESORT_CONFIG.rooms.map((r) => r.price));
    document.querySelectorAll("[data-starting-price]").forEach((el) => {
      el.textContent = `₹${minPrice.toLocaleString("en-IN")}`;
    });

    if (roomTypeSelect) {
      roomTypeSelect.innerHTML = RESORT_CONFIG.rooms
        .map(
          (room) =>
            `<option value="${room.price}" data-name="${room.name}">${room.name} — ₹${room.price.toLocaleString("en-IN")}/nt</option>`
        )
        .join("");
    }
  }

  // Only Booking Dock CTA changes when showLivePrice is false
  if (bookingCtaText) {
    bookingCtaText.textContent = isLivePriceEnabled() ? "Book via WhatsApp" : "Get Quote on WhatsApp";
  }
}

// 2. Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu) menu.classList.toggle("hidden");
}

// 3. Inline Guests & Rooms Counter (+ / -)
function updateCount(type, delta) {
  if (type === "adults") {
    adultGuests = Math.max(1, Math.min(30, adultGuests + delta));
    const adultEl = document.getElementById("adultCount");
    if (adultEl) adultEl.textContent = adultGuests;
  } else if (type === "children") {
    childGuests = Math.max(0, Math.min(15, childGuests + delta));
    const childEl = document.getElementById("childCount");
    if (childEl) childEl.textContent = childGuests;
  } else if (type === "rooms") {
    roomCount = Math.max(1, Math.min(15, roomCount + delta));
    const roomEl = document.getElementById("roomCount");
    if (roomEl) roomEl.textContent = roomCount;
  }

  let parts = [`${adultGuests} Adult${adultGuests > 1 ? "s" : ""}`];
  if (childGuests > 0) parts.push(`${childGuests} Kid${childGuests > 1 ? "s" : ""}`);
  parts.push(`${roomCount} Room${roomCount > 1 ? "s" : ""}`);

  if (guestsInput) guestsInput.value = parts.join(", ");
  calculateTotal();
}

// 4. Initialize Flatpickr Dates (18/Nov/2026 format)
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

        if (checkoutPicker.selectedDates[0] <= selectedDates[0]) {
          checkoutPicker.setDate(nextDay);
        }
        calculateTotal();
      }
    }
  });

  checkoutPicker = flatpickr(checkoutInput, {
    dateFormat: "d/M/Y",
    minDate: dayAfter,
    defaultDate: dayAfter,
    disableMobile: true,
    onChange: function () {
      calculateTotal();
    }
  });

  calculateTotal();
}

// 5. Flexible Multi-Client Rate Calculator (Booking Dock Only)
function getBookingCalculation() {
  const checkinDate = checkinPicker ? checkinPicker.selectedDates[0] : null;
  const checkoutDate = checkoutPicker ? checkoutPicker.selectedDates[0] : null;
  const baseRate = roomTypeSelect ? parseInt(roomTypeSelect.value, 10) || 4999 : 4999;

  const pricing = (typeof RESORT_CONFIG !== "undefined" && RESORT_CONFIG.pricing) || {
    showLivePrice: true,
    baseAdultsPerRoom: 2,
    extraAdultPrice: 1200,
    extraChildPrice: 800,
    gstPercent: 0
  };

  let nights = 1;
  if (checkinDate && checkoutDate && checkoutDate > checkinDate) {
    nights = Math.max(1, Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)));
  }

  const includedAdults = roomCount * (pricing.baseAdultsPerRoom || 2);
  const extraAdults = Math.max(0, adultGuests - includedAdults);

  const perNightTotal =
    roomCount * baseRate +
    extraAdults * (pricing.extraAdultPrice || 0) +
    childGuests * (pricing.extraChildPrice || 0);

  let grandTotal = nights * perNightTotal;
  if (pricing.gstPercent && pricing.gstPercent > 0) {
    grandTotal = Math.round(grandTotal * (1 + pricing.gstPercent / 100));
  }

  let detailTags = [`${nights} Night${nights > 1 ? "s" : ""}`, `${roomCount} Room${roomCount > 1 ? "s" : ""}`];
  if (extraAdults > 0 && (pricing.extraAdultPrice || 0) > 0) {
    detailTags.push(`+${extraAdults} Extra Adult`);
  }
  if (childGuests > 0 && (pricing.extraChildPrice || 0) > 0) {
    detailTags.push(`+${childGuests} Kid${childGuests > 1 ? "s" : ""}`);
  }

  return {
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
  if (totalPriceEl) {
    totalPriceEl.textContent = calc.showLivePrice ? `₹${calc.grandTotal.toLocaleString("en-IN")}` : "Custom Quote";
  }
}

// 6. One-Tap Room Selection from Cards
function selectRoomAndScroll(rateValue) {
  if (!roomTypeSelect) return;
  roomTypeSelect.value = rateValue;
  calculateTotal();
  const bookingDock = document.getElementById("booking-dock");
  if (bookingDock) {
    bookingDock.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// 7. Home Page Booking Dock -> WhatsApp
function bookViaWhatsApp() {
  if (!roomTypeSelect) {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi ${RESORT_NAME}! I'd like to check room availability.`)}`,
      "_blank"
    );
    return;
  }

  const selectedOption = roomTypeSelect.options[roomTypeSelect.selectedIndex];
  const roomName = selectedOption.getAttribute("data-name");
  const rate = parseInt(roomTypeSelect.value, 10).toLocaleString("en-IN");
  const checkin = checkinInput.value || "Flexible";
  const checkout = checkoutInput.value || "Flexible";
  const guestsText = guestsInput ? guestsInput.value : `${adultGuests} Adults, ${roomCount} Room`;
  const calc = getBookingCalculation();

  let message = "";
  if (calc.showLivePrice) {
    message = `Hi ${RESORT_NAME}! I'd like to check availability & book:\n\n• *Stay:* ${roomName} × ${calc.roomCount} Room${calc.roomCount > 1 ? "s" : ""} (₹${rate}/nt)\n• *Check-in:* ${checkin}\n• *Check-out:* ${checkout}\n• *Guests:* ${guestsText}\n• *Breakdown:* ${calc.summaryLabel}\n• *Estimated Total:* ₹${calc.grandTotal.toLocaleString("en-IN")}`;
  } else {
    message = `Hi ${RESORT_NAME}! Please share best rates & availability for:\n\n• *Stay:* ${roomName} × ${calc.roomCount} Room${calc.roomCount > 1 ? "s" : ""} (₹${rate}/nt)\n• *Check-in:* ${checkin}\n• *Check-out:* ${checkout}\n• *Guests:* ${guestsText} (${calc.nights} Night${calc.nights > 1 ? "s" : ""})`;
  }

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// General WhatsApp Enquiry (No room/price details — used in Footer)
function openGeneralWhatsApp() {
  const message = `Hi ${RESORT_NAME}! I have a booking enquiry.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// 8. Quick Room Book from rooms.html (Always includes rate)
function quickBookRoom(roomName, rate) {
  const message = `Hi ${RESORT_NAME}! I'm interested in booking the *${roomName}* (₹${rate.toLocaleString("en-IN")}/night). Please share availability & best offer for my dates.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// 9. Quick Package Book from contact.html (Always includes package price)
function quickBookPackage(packageName, price) {
  const message = `Hi ${RESORT_NAME}! I'd like to enquire about the *${packageName}* (${price}). Please share package availability.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// 10. Custom Enquiry Form on contact.html
function submitCustomEnquiry(event) {
  event.preventDefault();
  const name = document.getElementById("enqName").value;
  const dates = document.getElementById("enqDates").value;
  const guests = document.getElementById("enqGuests").value;
  const notes = document.getElementById("enqNotes").value || "None";

  const message = `Hi ${RESORT_NAME}! Custom Stay Enquiry:\n\n• *Name:* ${name}\n• *Dates:* ${dates}\n• *Guests:* ${guests}\n• *Notes:* ${notes}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// 11. Gallery Filter & Lightbox
const filterButtons = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => {
      b.classList.remove("active", "bg-gold");
      b.classList.add("bg-white/10");
    });
    btn.classList.add("active", "bg-gold");
    btn.classList.remove("bg-white/10");

    const filter = btn.getAttribute("data-filter");
    galleryItems.forEach((item) => {
      item.style.display = filter === "all" || item.getAttribute("data-category") === filter ? "block" : "none";
    });
  });
});

function openLightbox(element) {
  const modal = document.getElementById("lightboxModal");
  const img = element.querySelector("img");
  const caption = element.querySelector("p");
  if (!modal || !img) return;

  document.getElementById("lightboxImg").src = img.src;
  document.getElementById("lightboxCaption").textContent = caption ? caption.textContent : "";
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeLightbox() {
  const modal = document.getElementById("lightboxModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// 12. Sticky Navbar on Scroll
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("navbar-scrolled", window.scrollY > 50);
  });
}

// 13. Scroll Reveal Observer
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  },
  { threshold: 0.1 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Event Listeners & Boot
if (roomTypeSelect) roomTypeSelect.addEventListener("change", calculateTotal);

applyResortConfig();
initDefaultDates();