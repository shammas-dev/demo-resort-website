const RESORT_CONFIG = {
  brandName: "Vana Mist Resort",
  shortName: "Vana Mist",
  logoInitial: "V",
  tagline: "Where the Mist Meets the Forest Canopy",
  locationShort: "Wayanad, Kerala",
  address: "Meppadi - Chooralmala Road, Vythiri Taluk, Wayanad, Kerala 673577",
  whatsappNumber: "918606411892", // Country code + number (no +)
  phoneDisplay: "+91 86064 11892",
  email: "stay@vanamistwayanad.com",
  mapUrl: "https://maps.google.com/?q=Wayanad,Kerala",
  checkInTime: "2:00 PM",
  checkOutTime: "11:00 AM",

  // CLIENT PRICING ENGINE (Customize per client!)
  pricing: {
    showLivePrice: true,   // true = Live total kaanikkum | false = "Custom Quote" mode
    baseAdultsPerRoom: 2,  // 1 room-il base tariff-il included aaya adults
    extraAdultPrice: 1200, // Extra adult/mattress charge per night (0 aakkiyaal free)
    extraChildPrice: 800,  // Extra child charge per night (0 aakkiyaal kids free)
    gstPercent: 0          // GST venamenkil 12 or 18 kodukkaam
  },

  // Theme Palette
  theme: {
    forest: "#163024",
    forestLight: "#234736",
    gold: "#C88A55",
    goldHover: "#B57743",
    alabaster: "#FAF8F5",
    sand: "#F1EDE6"
  },

  // Rooms & Rates
  rooms: [
    {
      id: "cottage",
      name: "Mist Valley Cottage",
      price: 4999,
      area: "420 sq.ft",
      guests: "Max 2 Adults + 1 Child",
      badge: "Best Value",
      shortDesc: "Cozy teak-wood cottage with a private valley-facing balcony, rain shower, and morning mist views.",
      tags: ["420 sq.ft", "King Bed", "Valley Balcony"],
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "villa",
      name: "Forest Canopy Villa",
      price: 7499,
      area: "650 sq.ft",
      guests: "Max 2 Adults + 2 Children",
      badge: "Most Popular • 2 Left",
      shortDesc: "Elevated glass-walled villa surrounded by 100-year-old trees, outdoor deck, and freestanding soaking tub.",
      tags: ["650 sq.ft", "Forest Deck", "Soaking Tub"],
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "pool-suite",
      name: "Plunge Pool Suite",
      price: 10999,
      area: "920 sq.ft",
      guests: "Max 2 Adults (Honeymoon)",
      badge: "Honeymoon Pick",
      shortDesc: "Ultra-private luxury sanctuary featuring a heated private infinity plunge pool, gazebo, and butler service.",
      tags: ["920 sq.ft", "Private Pool", "Candlelight Setup"],
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80"
    }
  ]
};