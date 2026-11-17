const WHATSAPP_NUMBER = typeof RESORT_CONFIG !== "undefined" ? RESORT_CONFIG.whatsappNumber : "919876543210";
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

// 1. Apply Config Data Across All Pages
function applyResortConfig() {
  if (typeof RESORT_CONFIG === "undefined") return;

  // Apply CSS Theme Variables
  const root = document.documentElement;
  root.style.setProperty("--color-forest", RESORT_CONFIG.theme.forest);
  root.style.setProperty("--color-forest-light", RESORT_CONFIG.theme.forestLight);
  root.style.setProperty("--color-gold", RESORT_CONFIG.theme.gold);
  root.style.setProperty("--color-gold-hover", RESORT_CONFIG.theme.goldHover);

  // Update Brand Text Elements
  document.querySelectorAll("[data-brand-name]").forEach((el) => (el.textContent = RESORT_CONFIG.brandName));
  document.querySelectorAll("[data-short-name]").forEach((el) => (el.textContent = RESORT_CONFIG.shortName));
  document.querySelectorAll("[data-logo-initial]").forEach((el) => (el.textContent = RESORT_CONFIG.logoInitial));
  document.querySelectorAll("[data-address]").forEach((el) => (el.textContent = RESORT_CONFIG.address));
  document.querySelectorAll("[data-phone]").forEach((el) => (el.textContent = RESORT_CONFIG.phoneDisplay));
  document.querySelectorAll("[data-email]").forEach((el) => (el.textContent = RESORT_CONFIG.email));

  // Update Starting Price & Room Dropdown
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

// 3. Initialize Flatpickr Dates in day/month(short)/year format (e.g., 18/Nov/2026)
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

// 4. Live Night & Rate Calculator
function calculateTotal() {
  if (!checkinPicker || !checkoutPicker || !roomTypeSelect) return;

  const checkinDate = checkinPicker.selectedDates[0];
  const checkoutDate = checkoutPicker.selectedDates[0];
  const perNightRate = parseInt(roomTypeSelect.value, 10) || 4999;

  let nights = 1;
  if (checkinDate && checkoutDate && checkoutDate > checkinDate) {
    const diffTime = checkoutDate - checkinDate;
    nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  const total = nights * perNightRate;
  nightsLabel.textContent = `${nights} Night${nights > 1 ? "s" : ""} Est.`;
  totalPriceEl.textContent = `₹${total.toLocaleString("en-IN")}`;
}

// 5. One-Tap Room Selection from Cards
function selectRoomAndScroll(rateValue) {
  if (!roomTypeSelect) return;
  roomTypeSelect.value = rateValue;
  calculateTotal();
  const bookingDock = document.getElementById("booking-dock");
  if (bookingDock) {
    bookingDock.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// 6. Home Page Booking Dock -> WhatsApp
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
  const guests = guestsSelect.value;
  const estimate = totalPriceEl.textContent;
  const nightsText = nightsLabel.textContent.replace(" Est.", "");

  const message = `Hi ${RESORT_NAME}! I'd like to check availability & book:\n\n• *Stay:* ${roomName} (₹${rate}/night)\n• *Check-in:* ${checkin}\n• *Check-out:* ${checkout} (${nightsText})\n• *Guests:* ${guests}\n• *Estimated Total:* ${estimate} (Incl. Breakfast)`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// 7. Quick Room Book from rooms.html
function quickBookRoom(roomName, rate) {
  const message = `Hi ${RESORT_NAME}! I'm interested in booking the *${roomName}* (₹${rate.toLocaleString("en-IN")}/night). Please share availability for my dates.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// 8. Quick Package Book from contact.html
function quickBookPackage(packageName, price) {
  const message = `Hi ${RESORT_NAME}! I'd like to enquire about the *${packageName}* (${price}). Please share package availability.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// 9. Custom Enquiry Form on contact.html
function submitCustomEnquiry(event) {
  event.preventDefault();
  const name = document.getElementById("enqName").value;
  const dates = document.getElementById("enqDates").value;
  const guests = document.getElementById("enqGuests").value;
  const notes = document.getElementById("enqNotes").value || "None";

  const message = `Hi ${RESORT_NAME}! Custom Stay Enquiry:\n\n• *Name:* ${name}\n• *Dates:* ${dates}\n• *Guests:* ${guests}\n• *Notes:* ${notes}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// 10. Gallery Filter Logic (gallery.html)
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

// 11. Lightbox Modal (gallery.html)
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