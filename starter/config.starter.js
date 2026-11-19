/* =====================================================================
   STARTER CONFIG for a new client. Created by `npm run new-client`.
   Everything is placeholder text and a placeholder image. Replace it
   with the client's real details, section by section (see README).
   While isDemo is true the build only warns. Before go-live set
   isDemo: false and siteUrl: the build then refuses to ship any
   placeholder text or stock photo that is still left.
   ===================================================================== */
const RESORT_CONFIG = {
  // ---------- Build / SEO ----------
  isDemo: true,
  siteUrl: "", // the live address, no trailing slash, e.g. "https://www.example-resort.in"
  seo: { ogImage: "", cleanUrls: true, social: [], geo: null },

  // ---------- Identity ----------
  brandName: "Your Resort Name",
  shortName: "Your Resort",
  logoInitial: "Y",
  tagline: "A short line about your resort",
  address: "Street, Place, District, State PIN",
  whatsappNumber: "910000000000", // country code + number, digits only. The number the owner really monitors
  phoneDisplay: "+91 00000 00000",
  email: "stay@yourresort.example",
  checkInTime: "2:00 PM",
  checkOutTime: "11:00 AM",
  mapUrl: "https://maps.google.com/?q=Your+Resort+Name",
  mapEmbedUrl: "", // Google Maps > Share > Embed a map > copy only the src="..." value. Empty = a link card is shown
  contact: { hours: "9:00 AM – 9:00 PM", nearestAirport: "Nearest airport or station and distance" },

  // ---------- Pricing (ask the owner; these are only starting values) ----------
  pricing: {
    showLivePrice: true,
    baseAdultsPerRoom: 2,
    extraAdultPrice: 1000,
    extraChildPrice: 600,
    gstPercent: 0,
    taxNote: "Taxes extra.",
    weekendPercent: 0,
    weekendDays: [5, 6],
    seasons: [], // e.g. { name: "Christmas & New Year", from: "12-20", to: "01-03", percent: 30 }
    roundTo: 10
  },

  // ---------- Theme ----------
  theme: {
    forest: "#163024",
    forestLight: "#234736",
    gold: "#C88A55",
    alabaster: "#FAF8F5",
    sand: "#F1EDE6",
    charcoal: "#1C1C1C"
  },

  // ---------- Navigation ----------
  nav: [
    { label: "Home", href: "index.html", page: "home" },
    { label: "Rooms & Tariffs", href: "rooms.html", page: "rooms" },
    { label: "Gallery", href: "gallery.html", page: "gallery" },
    { label: "Contact", href: "contact.html", page: "contact" }
  ],
  headerBadge: "",

  // ---------- Page text ----------
  pages: {
    home: { title: "Your Resort Name | Stay in Your Place", description: "Book direct at Your Resort Name. See tariffs and enquire on WhatsApp." },
    rooms: { title: "Stays & Tariffs | Your Resort Name", description: "Room types, direct tariffs and amenities at Your Resort Name.", eyebrow: "Direct Resort Rates", heading: "Our Stays", intro: "Replace this with one line about what every tariff includes." },
    gallery: { title: "Gallery | Your Resort Name", description: "Photos of Your Resort Name.", eyebrow: "Visual Tour", heading: "Gallery" },
    contact: { title: "Contact | Your Resort Name", description: "How to reach Your Resort Name and enquire directly.", eyebrow: "Get in Touch", heading: "Reservations & Directions", packagesHeading: "Packages & Offers" },
    policies: { title: "Policies & Privacy | Your Resort Name", description: "Booking, cancellation, house rules and privacy at Your Resort Name.", eyebrow: "Good to Know", heading: "Policies & Privacy" }
  },

  // ---------- Home ----------
  hero: {
    image: "images/placeholder.svg",
    imageAlt: "Your Resort Name",
    headline: "Replace this headline",
    subtext: "Replace this with one or two sentences that describe the stay and invite guests to enquire directly.",
    priceNote: ""
  },
  rating: { show: false, score: "" }, // only show a rating that is real, with the owner's permission
  trustBar: [
    { title: "Direct WhatsApp", text: "Talk to the resort team directly" },
    { title: "Clear Tariffs", text: "See the rates before you ask" }
  ],
  // story and experiences are optional: leave them out and the sections do not appear.
  // story: { eyebrow: "", title: "", text: "", image: "", imageAlt: "", stats: [{ value: "", label: "" }] },
  // experiences: { eyebrow: "", title: "", items: [{ title: "", text: "", image: "" }] },
  moreStaysNote: "",

  // ---------- Rooms ----------
  rooms: [
    {
      id: "standard-room",
      name: "Standard Room",
      price: 3999,
      area: "300 sq.ft",
      maxAdults: 2,
      maxChildren: 1,
      badge: "",
      shortDesc: "Replace this room description.",
      description: "Replace this with a longer description of the room.",
      tags: ["300 sq.ft", "Double Bed"],
      amenities: ["Wi-Fi", "Air conditioning", "Attached bathroom", "Breakfast"],
      compare: { "Breakfast Included": "Yes" },
      image: "images/placeholder.svg"
    },
    {
      id: "deluxe-room",
      name: "Deluxe Room",
      price: 5999,
      area: "420 sq.ft",
      maxAdults: 2,
      maxChildren: 2,
      badge: "",
      shortDesc: "Replace this room description.",
      description: "Replace this with a longer description of the room.",
      tags: ["420 sq.ft", "King Bed"],
      amenities: ["Wi-Fi", "Air conditioning", "Private balcony", "Breakfast"],
      compare: { "Breakfast Included": "Yes" },
      image: "images/placeholder.svg"
    }
  ],

  // ---------- Packages (optional: leave empty and the section does not appear) ----------
  packages: [],

  // ---------- Gallery ----------
  gallery: {
    categories: [
      { id: "all", label: "All Photos" },
      { id: "property", label: "The Property" }
    ],
    items: [
      { category: "property", caption: "Replace this caption", alt: "Replace this description of the photo", src: "images/placeholder.svg" },
      { category: "property", caption: "Replace this caption", alt: "Replace this description of the photo", src: "images/placeholder.svg" },
      { category: "property", caption: "Replace this caption", alt: "Replace this description of the photo", src: "images/placeholder.svg" }
    ]
  },

  // ---------- Policies page (review every line with the owner) ----------
  policies: {
    enabled: true,
    sections: [
      { title: "Booking & Payment", items: [
        "Enquiries and bookings are handled by the resort team on WhatsApp. A stay is confirmed only when the resort confirms it.",
        "This website does not take payments. Payment terms are shared by the resort when you book."
      ] },
      { title: "Cancellation & Refunds", items: [
        "Cancellation and refund terms are shared by the resort at the time of booking. Please ask on WhatsApp before you pay."
      ] },
      { title: "Privacy", items: [
        "This website does not collect or store your personal details.",
        "When you tap a WhatsApp button, the details you chose (dates, room, guests, any name you typed) are placed in a WhatsApp message to the resort. They are used only to reply to your enquiry."
      ] }
    ]
  },

  // ---------- Footer ----------
  footerLinks: [
    { label: "Rooms & Direct Tariffs", href: "rooms.html" },
    { label: "Photo Gallery", href: "gallery.html" },
    { label: "Contact & Directions", href: "contact.html" }
  ],
  footerNote: "Direct Booking"
};
