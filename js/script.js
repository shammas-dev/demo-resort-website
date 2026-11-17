const WHATSAPP_NUMBER = typeof RESORT_CONFIG !== "undefined" ? RESORT_CONFIG.whatsappNumber : "918606411892";
const RESORT_NAME = typeof RESORT_CONFIG !== "undefined" ? RESORT_CONFIG.brandName : "Vana Mist Resort";

// DOM Elements
const checkinInput = document.getElementById("checkin");
const checkoutInput = document.getElementById("checkout");
const roomTypeSelect = document.getElementById("roomType");
const guestsSelect = document.getElementById("guests");
const nightsLabel = document.getElementById("nightsLabel");
const totalPriceEl = document.getElementById("totalPrice");
const navbar = document.getElementById("navbar");

let checkinPicker, checkoutPicker;
let adultGuests = 2;
let childGuests = 0;

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
  if (mapBtn && RESORT_CONFIG.mapUrl) {
    mapBtn.href = RESORT_CONFIG.mapUrl;
  }

  const waBtn = document.getElementById("floatingWhatsappBtn");
  if (waBtn && RESORT_CONFIG.whatsappNumber) {
    waBtn.href = `https://wa.me/${RESORT_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hi ${RESORT_CONFIG.brandName}! I have a query.`)}`;
  }

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
}

// 2. Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  if (!menu) return;
  menu.classList.toggle("hidden");
}

// 3. Interactive Guest Counter (+ / - Popover)
function toggleGuestPopover() {
  const popover = document.getElementById("guestPopover");
  if (popover) popover.classList.toggle("hidden");
}

function updateGuestCount(type, delta) {
  if (type === "adults") {
    adultGuests = Math.max(1, Math.min(20, adultGuests + delta));
    const adultEl = document.getElementById("adultCount");
    if (adultEl) adultEl.textContent = adultGuests;
  } else {
    childGuests = Math.max(0, Math.min(10, childGuests + delta));
    const childEl = document.getElementById("childCount");
    if (childEl) childEl.textContent = childGuests;
  }

  let summary = `${adultGuests} Adult${adultGuests > 1 ? "s" : ""}`;
  if (childGuests > 0) {
    summary += `, ${childGuests} Child${childGuests > 1 ? "ren" : ""}`;
  }

  const summaryEl = document.getElementById("guestSummary");
  if (summaryEl) summaryEl.textContent = summary;
  if (guestsSelect) guestsSelect.value = summary;

  calculateTotal();
}

// Close guest popover when clicking outside
document.addEventListener("click", (e) => {
  const popover = document.getElementById("guestPopover");
  const trigger = document.getElementById("guestTrigger");
  if (popover && trigger && !popover.contains(e.target) && !trigger.contains(e.target)) {
    popover.classList.add("hidden");
  }
});

// 4. Initialize Flatpickr Dates in day/month(short)/year format (e.g., 18/Nov/2026)
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

// 5. Dynamic Night, Room & Guest Rate Calculator
function calculateTotal() {
  if (!checkinPicker || !checkoutPicker || !roomTypeSelect) return;

  const checkinDate = checkinPicker.selectedDates[0];
  const checkoutDate = checkoutPicker.selectedDates[0];
  const perNightRate = parseInt(roomTypeSelect.value, 10) || 4999;
  const childRate =
    typeof RESORT_CONFIG !== "undefined" && RESORT_CONFIG.extraChildPrice !== undefined
      ? RESORT_CONFIG.extraChildPrice
      : 1000;

  let nights = 1;
  if (checkinDate && checkoutDate && checkoutDate > checkinDate) {
    const diffTime = checkoutDate - checkinDate;
    nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  // 2 Adults per room automatically scales rooms; children add extraChildPrice per night
  const roomsNeeded = Math.max(1, Math.ceil(adultGuests / 2));
  const roomTotal = nights * perNightRate * roomsNeeded;
  const childTotal = nights * childRate * childGuests;
  const grandTotal = roomTotal + childTotal;

  let labelParts = [`${nights} Night${nights > 1 ? "s" : ""}`];
  if (roomsNeeded > 1) labelParts.push(`${roomsNeeded} Rooms`);
  if (childGuests > 0 && childRate > 0) labelParts.push(`+${childGuests} Kid${childGuests > 1 ? "s" : ""}`);

  if (nightsLabel) nightsLabel.textContent = labelParts.join(" • ");
  if (totalPriceEl) totalPriceEl.textContent = `₹${grandTotal.toLocaleString("en-IN")}`;
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
  const guests = guestsSelect ? guestsSelect.value : `${adultGuests} Adults`;
  const estimate = totalPriceEl.textContent;
  const roomsNeeded = Math.max(1, Math.ceil(adultGuests / 2));
  const summaryMeta = nightsLabel.textContent;

  const message = `Hi ${RESORT_NAME}! I'd like to check availability & book:\n\n• *Stay:* ${roomName} × ${roomsNeeded} Room${roomsNeeded > 1 ? "s" : ""} (₹${rate}/nt)\n• *Check-in:* ${checkin}\n• *Check-out:* ${checkout}\n• *Summary:* ${summaryMeta}\n• *Guests:* ${guests}\n• *Estimated Total:* ${estimate} (Incl. Breakfast)`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// 8. Quick Room Book from rooms.html
function quickBookRoom(roomName, rate) {
  const message = `Hi ${RESORT_NAME}! I'm interested in booking the *${roomName}* (₹${rate.toLocaleString("en-IN")}/night). Please share availability for my dates.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// 9. Quick Package Book from contact.html
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

// 11. Gallery Filter Logic (gallery.html)
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

// 12. Lightbox Modal (gallery.html)
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

// 13. Sticky Navbar on Scroll
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("navbar-scrolled", window.scrollY > 50);
  });
}

// 14. Scroll Reveal Observer
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