import {
  Car,
  Camera,
  ChefHat,
  Gem,
  Headphones,
  Leaf,
  Mic2,
  Paintbrush,
  Sparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { imageFrom, luxuryWeddingImages, realImages, serviceImage } from "@/lib/real-images";

export type ServiceSlug =
  | "gardens"
  | "pandit-ji"
  | "decoration"
  | "anchor"
  | "dj-band"
  | "caterers"
  | "makeup-artists"
  | "photography"
  | "mehendi-artists"
  | "transport";

export type ListingItem = {
  slug: string;
  title: string;
  area: string;
  shortDescription: string;
  priceRange: string;
  rating: number;
  image: string;
  gallery: string[];
  fullDescription: string;
  servicesIncluded: string[];
  amenities: string[];
  timings: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  exactAddress: string;
  mapQuery: string;
  capacity?: string;
  indoorOutdoor?: string;
  parking?: string;
  availability: string;
  packages: { name: string; price: string; includes: string }[];
  reviews: { name: string; rating: number; text: string }[];
  faqs: { question: string; answer: string }[];
};

export type ServiceCategory = {
  slug: ServiceSlug;
  title: string;
  navLabel: string;
  pageTitle: string;
  intro: string;
  cta: string;
  icon: LucideIcon;
  heroImage: string;
  items: ListingItem[];
};

const gardenGallery = (folder: string) =>
  Array.from({ length: 20 }, (_, index) => imageFrom(realImages.gardens, index + (folder === "garden2" ? 2 : folder === "garden3" ? 4 : 0)));

const serviceGallery = (folder: string) =>
  Array.from({ length: 8 }, (_, index) => serviceImage(folder, index));

export const carouselSlides = [
  {
    title: "Royal Palace Wedding Setup",
    text: "Palatial architecture, glowing mandaps and ceremonial grandeur for a regal wedding night.",
    image: luxuryWeddingImages.hero.palaceWedding
  },
  {
    title: "Luxury Wedding Garden Night View",
    text: "Open lawns, warm ambient lighting and premium guest hospitality under the evening sky.",
    image: luxuryWeddingImages.venues.luxuryGarden
  },
  {
    title: "Premium Wedding Decoration",
    text: "Layered florals, refined seating, designer lighting and detailed decor execution.",
    image: luxuryWeddingImages.hero.premiumDecor
  },
  {
    title: "Destination Wedding Resort",
    text: "Resort lawns, private suites and destination-style planning for multi-day celebrations.",
    image: luxuryWeddingImages.hero.destinationResort
  },
  {
    title: "Grand Wedding Stage Setup",
    text: "Statement stages, reception lighting and cinematic production for the main celebration.",
    image: luxuryWeddingImages.hero.grandStage
  },
  {
    title: "Luxury Catering Experience",
    text: "Curated menus, live counters and polished service teams shaped around your guest list.",
    image: luxuryWeddingImages.hero.cateringExperience
  },
  {
    title: "Bridal Entry Setup",
    text: "Photo-ready entries, elegant aisle moments and graceful ceremony styling for the couple.",
    image: luxuryWeddingImages.venues.royalPalace
  },
  {
    title: "Premium Reception Setup",
    text: "Warm reception ambience, refined tablescapes and hospitality-led evening celebrations.",
    image: luxuryWeddingImages.hero.receptionSetup
  }
];

const gardens: ListingItem[] = [
  {
    slug: "rajwada-royal-lawn",
    title: "Rajwada Royal Lawn",
    area: "Tonk Road Area",
    shortDescription: "A grand outdoor lawn with palace-style entry, large stage zone and premium lighting support.",
    priceRange: "INR 2.75L - 5.5L",
    rating: 4.9,
    image: imageFrom(realImages.gardens, 0),
    gallery: gardenGallery("garden1"),
    fullDescription:
      "Rajwada Royal Lawn is designed for large wedding nights, reception dinners and sangeet celebrations that need a spacious outdoor setup with a premium arrival experience. The garden supports custom mandap placement, stage production, food counters and dedicated family zones.",
    servicesIncluded: ["Venue coordination", "Basic lighting support", "Stage setup support", "Approved decor vendors", "Power backup", "Guest entry management"],
    amenities: ["800-1500 guest capacity", "Outdoor lawn", "Parking support", "Bridal room", "Decor support", "Catering support", "Lighting towers", "Security desk"],
    timings: "10:00 AM - 11:30 PM",
    contactName: "Royal Vivah Booking Desk",
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    exactAddress: "Tonk Road Extension, Jaipur, Rajasthan",
    mapQuery: "Tonk Road Jaipur Rajasthan",
    capacity: "800-1500 guests",
    indoorOutdoor: "Outdoor lawn with covered service zones",
    parking: "Valet and open parking support",
    availability: "Prime winter dates filling fast",
    packages: [
      { name: "Classic Lawn", price: "INR 2.75L", includes: "Venue access, basic lighting and support staff" },
      { name: "Royal Wedding", price: "INR 4.25L", includes: "Premium time slot, bridal room, power backup and entry support" },
      { name: "Signature Night", price: "Custom", includes: "Full concierge, decor planning and vendor coordination" }
    ],
    reviews: [
      { name: "Ritika S.", rating: 5, text: "The lawn looked beautiful after sunset and the entry area felt grand." },
      { name: "Mohit K.", rating: 4.9, text: "Parking and stage coordination were handled smoothly for our reception." }
    ],
    faqs: [
      { question: "Can we bring our own decorator?", answer: "Yes, decorators can be approved after sharing setup requirements." },
      { question: "Is catering compulsory in-house?", answer: "Catering can be arranged through approved partners or discussed during booking." }
    ]
  },
  {
    slug: "amrit-mahal-garden",
    title: "Amrit Mahal Garden",
    area: "Vaishali Nagar",
    shortDescription: "A refined wedding garden for family celebrations, pheras and elegant reception dinners.",
    priceRange: "INR 1.85L - 3.8L",
    rating: 4.8,
    image: imageFrom(realImages.gardens, 2),
    gallery: gardenGallery("garden2"),
    fullDescription:
      "Amrit Mahal Garden is suited for mid-sized weddings that need a premium look without overwhelming scale. The layout supports a mandap, live counters, photo corners and smooth guest movement.",
    servicesIncluded: ["Mandap zone support", "Guest seating plan", "Food counter planning", "Decor coordination", "Basic housekeeping", "Family room support"],
    amenities: ["350-800 guest capacity", "Outdoor lawn", "Bridal room", "Food counter space", "Parking assistance", "Entry gate decor support", "Power backup"],
    timings: "9:00 AM - 11:00 PM",
    contactName: "Royal Vivah Venue Desk",
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    exactAddress: "Near Vaishali Nagar, Jaipur, Rajasthan",
    mapQuery: "Vaishali Nagar Jaipur Rajasthan",
    capacity: "350-800 guests",
    indoorOutdoor: "Outdoor lawn with semi-covered utility areas",
    parking: "Dedicated parking assistance",
    availability: "Available for selected weekday weddings",
    packages: [
      { name: "Elegant", price: "INR 1.85L", includes: "Venue slot and essential support" },
      { name: "Premium", price: "INR 2.9L", includes: "Venue, bridal room, lighting and support desk" },
      { name: "Custom", price: "Flexible", includes: "Personalized decor and catering coordination" }
    ],
    reviews: [
      { name: "Neha J.", rating: 5, text: "Perfect size for our family wedding and the lawn felt very premium." },
      { name: "Aman B.", rating: 4.7, text: "The team helped plan the mandap and dinner counters very well." }
    ],
    faqs: [
      { question: "Is the garden suitable for day functions?", answer: "Yes, haldi, mehendi and lunch events can be planned here." },
      { question: "Is a bridal room available?", answer: "Yes, bridal room support is available with the venue package." }
    ]
  },
  {
    slug: "maharani-courtyard",
    title: "Maharani Courtyard",
    area: "Malviya Nagar",
    shortDescription: "A boutique courtyard-style venue for intimate weddings, mehendi and cocktail evenings.",
    priceRange: "INR 1.25L - 2.9L",
    rating: 4.7,
    image: imageFrom(realImages.gardens, 4),
    gallery: gardenGallery("garden3"),
    fullDescription:
      "Maharani Courtyard gives smaller celebrations a polished and intimate setting. It works well for engagement, mehendi, haldi, cocktail and compact wedding ceremonies.",
    servicesIncluded: ["Courtyard setup planning", "Lighting guidance", "Compact stage support", "Guest hospitality area", "Vendor coordination"],
    amenities: ["120-450 guest capacity", "Indoor and outdoor flow", "Bridal room", "Parking guidance", "Photo corner support", "Ambient lighting"],
    timings: "10:00 AM - 10:30 PM",
    contactName: "Royal Vivah Venue Desk",
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    exactAddress: "Malviya Nagar Sector Area, Jaipur, Rajasthan",
    mapQuery: "Malviya Nagar Jaipur Rajasthan",
    capacity: "120-450 guests",
    indoorOutdoor: "Courtyard with indoor support",
    parking: "Nearby managed parking",
    availability: "Good availability for pre-wedding events",
    packages: [
      { name: "Courtyard", price: "INR 1.25L", includes: "Venue and basic event support" },
      { name: "Celebration", price: "INR 2.1L", includes: "Lighting, bridal room and layout assistance" },
      { name: "Boutique", price: "Custom", includes: "Theme support and full-service planning" }
    ],
    reviews: [
      { name: "Priya M.", rating: 4.8, text: "Our mehendi looked warm, personal and very well organized." },
      { name: "Karan S.", rating: 4.7, text: "Great choice for a compact but premium celebration." }
    ],
    faqs: [
      { question: "Can it host a cocktail?", answer: "Yes, cocktail evenings can be planned within venue timing rules." },
      { question: "Can we add live counters?", answer: "Yes, compact live counters can be mapped into the layout." }
    ]
  }
];

const gardenAreas = [
  "Vaishali Nagar",
  "Mansarovar Area",
  "Malviya Nagar",
  "Tonk Road Area",
  "C-Scheme",
  "Jagatpura",
  "Ajmer Road",
  "Bani Park",
  "Sodala",
  "Raja Park"
];

const extraGardenNames = [
  "Kesar Bagh Wedding Lawn", "Sheesh Mahal Garden", "Amber Palace Greens", "Rajputana Celebration Lawn", "Gulab Vatika",
  "Chandra Mahal Courtyard", "Mewar Royal Greens", "Utsav Palace Lawn", "Padma Heritage Garden", "Jaipur Grand Vatika",
  "Sapphire Wedding Greens", "Moti Mahal Banquet Lawn", "Lotus Courtyard Garden", "Royal Orchid Lawn", "Swarn Mahal Gardens",
  "Peacock Palace Lawn", "Heritage Haveli Greens"
];

gardens.push(
  ...extraGardenNames.map((name, index) => {
    const base = gardens[index % 3];
    const area = gardenAreas[index % gardenAreas.length];
    return {
      ...base,
      slug: name.toLowerCase().replaceAll(" ", "-"),
      title: name,
      area,
      shortDescription: `${name} offers a polished Jaipur wedding setting with flexible lawn layouts, guest flow support and photo-friendly decor zones.`,
      image: imageFrom(realImages.gardens, index + 3),
      gallery: Array.from({ length: 20 }, (_, galleryIndex) => imageFrom(realImages.gardens, index + galleryIndex)),
      exactAddress: `${area}, Jaipur, Rajasthan`,
      mapQuery: `${area} Jaipur Rajasthan`,
      rating: Number((4.6 + ((index + 1) % 5) * 0.1).toFixed(1)),
      priceRange: index % 2 ? "INR 1.5L - 3.8L" : "INR 2.25L - 5.5L",
      price: index % 2 ? "From INR 1.5L" : "From INR 2.25L",
      availability: index % 2 ? "Available for selected weekday weddings" : "Prime winter dates filling fast"
    };
  })
);

function item(slug: string, title: string, area: string, priceRange: string, rating: number, folder: string, description: string): ListingItem {
  return {
    slug,
    title,
    area,
    shortDescription: description,
    priceRange,
    rating,
    image: serviceImage(folder, 0),
    gallery: serviceGallery(folder),
    fullDescription: `${title} brings a premium, dependable wedding experience with clear planning, punctual coordination and service quality matched to luxury events.`,
    servicesIncluded: ["Planning consultation", "Event-day coordination", "Custom preferences", "Backup support", "WhatsApp coordination"],
    amenities: ["Verified team", "Flexible packages", "Premium presentation", "Jaipur service coverage", "Dedicated booking support"],
    timings: "As per event schedule",
    contactName: `${title} Desk`,
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    exactAddress: `${area}, Jaipur, Rajasthan`,
    mapQuery: `${area} Jaipur Rajasthan`,
    availability: "Available on request",
    packages: [
      { name: "Essential", price: priceRange.split("-")[0].trim(), includes: "Core service and coordination" },
      { name: "Signature", price: priceRange, includes: "Premium service with customization" },
      { name: "Royal", price: "Custom", includes: "Full luxury experience for multi-day events" }
    ],
    reviews: [
      { name: "Recent Client", rating, text: "Professional service, clear coordination and a polished event experience." },
      { name: "Royal Vivah Couple", rating: Math.min(5, rating + 0.1), text: "The team was responsive and helped us plan every detail smoothly." }
    ],
    faqs: [
      { question: "Can the package be customized?", answer: "Yes, packages can be customized by date, guest count, timing and preferences." },
      { question: "How do I confirm availability?", answer: "Use Book Now or WhatsApp Inquiry and the team will verify the date." }
    ]
  };
}

const areas = [
  "Vaishali Nagar",
  "Mansarovar Area",
  "Malviya Nagar",
  "Tonk Road Area",
  "C-Scheme",
  "Jagatpura",
  "Ajmer Road",
  "Bani Park",
  "Sodala",
  "Raja Park"
];

function makeServiceItems(folder: keyof typeof realImages.services, names: string[], basePrice: string, description: string): ListingItem[] {
  return names.map((name, index) => {
    const rating = Math.min(5, 4.6 + ((index % 5) * 0.1));
    const listing = item(
      name.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-"),
      name,
      areas[index % areas.length],
      basePrice,
      Number(rating.toFixed(1)),
      folder,
      description
    );

    return {
      ...listing,
      image: serviceImage(folder, index),
      gallery: Array.from({ length: 8 }, (_, galleryIndex) => serviceImage(folder, index + galleryIndex)),
      contactName: `${name} Desk`,
      exactAddress: `${areas[index % areas.length]}, Jaipur, Rajasthan`,
      mapQuery: `${areas[index % areas.length]} Jaipur Rajasthan`
    };
  });
}

const serviceItemNames = {
  pandit: [
    "Vedic Ceremony Specialist", "Shubh Muhurat Pandit Ji", "Sanskrit Hindi Ritual Guide", "Royal Phera Pandit", "Grah Shanti Expert",
    "Destination Wedding Pandit", "Marwari Ritual Acharya", "Engagement Puja Pandit", "Jain Vivah Vidhi Guide", "South Indian Ritual Pandit",
    "Satyanarayan Katha Pandit", "Haldi Mehendi Puja Expert", "Ganesh Sthapana Pandit", "Family Sanskar Acharya", "Bilingual Wedding Pandit",
    "Premium Samagri Pandit", "Mandap Vidhi Specialist", "Muhurat Consultation Desk", "Traditional Havankund Pandit", "Royal Vivah Acharya"
  ],
  decoration: [
    "Royal Floral Studio", "Rangmahal Decor", "Golden Stage Concepts", "Pastel Mandap House", "Marigold Entry Designers",
    "Luxury Varmala Decor", "Heritage Rajasthani Themes", "Crystal Reception Studio", "Garden Glow Decor", "Lotus Mandap Designers",
    "Palace Gate Decor", "Boho Mehendi Styling", "LED Stage Concepts", "Floral Canopy Studio", "Royal Seating Lounges",
    "Theme Wedding Works", "Pearl Aisle Decor", "Premium Haldi Styling", "Sangeet Stage Factory", "Signature Wedding Decor"
  ],
  anchor: [
    "Sangeet Show Anchor", "Reception Emcee", "Bilingual Wedding Host", "Family Games Anchor", "Luxury Event Presenter",
    "Haldi Mehendi Host", "Corporate Style Emcee", "Royal Entry Announcer", "Couple Story Anchor", "Interactive Sangeet Host",
    "Hindi Wedding Anchor", "English Wedding Host", "Stage Flow Specialist", "Celebrity Style Anchor", "Engagement Ceremony Host",
    "Reception Toast Emcee", "Dance Battle Anchor", "Premium Crowd Host", "Traditional Ceremony Announcer", "After Party Host"
  ],
  "dj-band": [
    "Sur Taal DJ Band", "Royal Live Band", "Club Night DJ", "Dhol Beats Crew", "Sufi Fusion Band",
    "Premium Sound Setup", "Bollywood Night DJ", "Cocktail Jazz Band", "Wedding Percussion Team", "LED Dance Floor DJ",
    "Punjabi Dhol Squad", "Sangeet Mix Masters", "Acoustic Couple Band", "Royal Brass Band", "After Party DJ",
    "Folk Fusion Ensemble", "Singer DJ Combo", "Luxury Light Sound Team", "Varmala Music Crew", "High Energy Baraat Band"
  ],
  caterers: [
    "Rajbhog Caterers", "Mehfil Food Studio", "Rasoi Heritage Catering", "Royal Buffet House", "Live Counter Experts",
    "Jain Wedding Kitchen", "Global Cuisine Caterers", "Dessert Bar Studio", "Rajasthani Thali Team", "Premium Veg Caterers",
    "Signature Platter Co", "Outdoor Banquet Caterers", "Luxury Mocktail Bar", "Chaat Counter Masters", "Continental Wedding Kitchen",
    "South Indian Counter Team", "Tandoor Live Caterers", "Halwai Sweets Studio", "Reception Dinner Works", "Royal Feast Caterers"
  ],
  makeup: [
    "Meera Bridal Art", "Aaina Makeup Studio", "Noor Bridal Luxe", "HD Bridal Studio", "Airbrush Beauty Artist",
    "Soft Glam Bridal Team", "Family Makeup Squad", "Luxury Hair Draping", "Reception Look Expert", "Engagement Glam Studio",
    "Minimal Bride Artist", "Royal Bride Makeovers", "Party Makeup Team", "Bridal Trial Studio", "Celebrity Style Artist",
    "Waterproof Makeup Expert", "Traditional Bridal Looks", "Modern Bride Studio", "Haldi Mehendi Makeup", "Signature Bridal Art"
  ],
  photography: [
    "Anaya Films", "Candid Wedding Stories", "Royal Wedding Frames", "Jaipur Cinematic Films", "Drone Wedding Studio",
    "Couple Portrait House", "Wedding Reel Makers", "Traditional Photo Team", "Editorial Bridal Frames", "Same Day Edit Studio",
    "Luxury Album Works", "Destination Wedding Films", "Reception Photo Crew", "Haldi Mehendi Coverage", "Royal Vivah Films",
    "Cinematic Baraat Crew", "Pre Wedding Lens", "Family Portrait Studio", "Wedding Highlight Team", "Signature Photo Films"
  ],
  mehendi: [
    "Rangrez Mehendi", "Henna Palace Studio", "Royal Bridal Mehendi", "Fine Line Henna Art", "Traditional Mehendi House",
    "Arabic Mehendi Artist", "Jaipuri Henna Works", "Luxury Mehendi Team", "Bride Story Mehendi", "Family Mehendi Squad",
    "Minimal Henna Studio", "Rajasthani Mehendi Art", "Portrait Mehendi Artist", "Engagement Henna Desk", "Haldi Mehendi Crew",
    "Premium Bridal Henna", "Floral Henna Studio", "Mandala Mehendi Expert", "Mehendi Night Artists", "Signature Henna Art"
  ],
  transport: [
    "Rajputana Cars", "Vivah Bus Service", "Royal Arrival Fleet", "Vintage Couple Car", "Luxury Sedan Desk",
    "Premium SUV Transfers", "Airport Pickup Fleet", "AC Guest Bus Service", "Tempo Traveller Team", "Convertible Entry Car",
    "VIP Chauffeur Service", "Baraat Car Decor", "Family Transfer Fleet", "Outstation Wedding Travel", "Hotel Shuttle Service",
    "Bride Groom Entry Car", "Guest Movement Desk", "Mini Coach Rentals", "Royal Limousine Style", "Wedding Transport Hub"
  ]
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "gardens",
    title: "Gardens",
    navLabel: "Gardens",
    pageTitle: "Luxury Wedding Gardens",
    intro: "Browse premium garden venues by general area first. Exact address and phone are revealed only on details or booking.",
    cta: "Explore garden venues",
    icon: Leaf,
    heroImage: luxuryWeddingImages.services.gardens,
    items: gardens
  },
  {
    slug: "pandit-ji",
    title: "Pandit Ji",
    navLabel: "Pandit Ji",
    pageTitle: "Verified Pandit Ji Profiles",
    intro: "Muhurat guidance, samagri planning and respectful ceremony support.",
    cta: "Find Pandit Ji",
    icon: Gem,
    heroImage: imageFrom(realImages.services.pandit, 0),
    items: makeServiceItems("pandit", serviceItemNames.pandit, "INR 9,000 - 35,000", "Traditional wedding rituals with clear family guidance, muhurat support and samagri planning.")
  },
  {
    slug: "decoration",
    title: "Decoration",
    navLabel: "Decoration",
    pageTitle: "Luxury Wedding Decoration",
    intro: "Mandaps, floral entries, stage concepts, lighting and theme production.",
    cta: "Explore decor teams",
    icon: Paintbrush,
    heroImage: imageFrom(realImages.services.decoration, 0),
    items: makeServiceItems("decoration", serviceItemNames.decoration, "INR 55,000 - 5L", "Mandaps, floral entries, stages, lighting and theme production for premium wedding settings.")
  },
  {
    slug: "anchor",
    title: "Anchor",
    navLabel: "Anchor",
    pageTitle: "Wedding Anchors",
    intro: "Professional anchors for sangeet, reception, games and ceremony flow.",
    cta: "Explore anchors",
    icon: Mic2,
    heroImage: imageFrom(realImages.services.anchor, 0),
    items: makeServiceItems("anchor", serviceItemNames.anchor, "INR 15,000 - 80,000", "Professional hosting for sangeet, reception, couple games, announcements and family flow.")
  },
  {
    slug: "dj-band",
    title: "DJ Band",
    navLabel: "DJ Band",
    pageTitle: "DJ, Band and Sound",
    intro: "DJ nights, live bands, dhol, sound, lights and after-party setups.",
    cta: "Explore music teams",
    icon: Headphones,
    heroImage: imageFrom(realImages.services["dj-band"], 0),
    items: makeServiceItems("dj-band", serviceItemNames["dj-band"], "INR 35,000 - 3L", "DJ, live band, dhol, sound, lights and stage energy for sangeet and receptions.")
  },
  {
    slug: "caterers",
    title: "Caterers",
    navLabel: "Caterers",
    pageTitle: "Premium Wedding Caterers",
    intro: "Multi-cuisine menus, live counters, tasting sessions and professional service.",
    cta: "Explore caterers",
    icon: ChefHat,
    heroImage: imageFrom(realImages.services.caterers, 0),
    items: makeServiceItems("caterers", serviceItemNames.caterers, "INR 700 - 2,800/plate", "Multi-cuisine menus, live counters, tasting sessions and professional wedding service.")
  },
  {
    slug: "photography",
    title: "Photography",
    navLabel: "Photography",
    pageTitle: "Wedding Photography and Films",
    intro: "Candid photography, cinematic films, reels, drone coverage and premium albums.",
    cta: "Explore photo teams",
    icon: Camera,
    heroImage: imageFrom(realImages.services.photography, 0),
    items: makeServiceItems("photography", serviceItemNames.photography, "INR 75,000 - 3.5L", "Candid photography, cinematic films, drone coverage, reels and premium wedding albums.")
  },
  {
    slug: "makeup-artists",
    title: "Makeup Artists",
    navLabel: "Makeup Artists",
    pageTitle: "Bridal Makeup Artists",
    intro: "HD makeup, airbrush looks, hairstyling, draping and family makeup.",
    cta: "Explore artists",
    icon: Sparkles,
    heroImage: imageFrom(realImages.services.makeup, 0),
    items: makeServiceItems("makeup", serviceItemNames.makeup, "INR 15,000 - 95,000", "HD makeup, airbrush looks, hairstyling, draping, trials and family artist teams.")
  },
  {
    slug: "mehendi-artists",
    title: "Mehendi Artists",
    navLabel: "Mehendi Artists",
    pageTitle: "Bridal Mehendi Artists",
    intro: "Bridal henna, family mehendi, Arabic designs and premium mehendi night teams.",
    cta: "Explore mehendi artists",
    icon: Paintbrush,
    heroImage: imageFrom(realImages.services.mehendi, 0),
    items: makeServiceItems("mehendi", serviceItemNames.mehendi, "INR 8,000 - 75,000", "Bridal henna, family mehendi, Arabic designs and premium mehendi night teams.")
  },
  {
    slug: "transport",
    title: "Car & Bus Services",
    navLabel: "Car & Bus",
    pageTitle: "Car and Bus Services",
    intro: "Luxury cars, guest buses, tempo travellers, airport pickup and VIP movement.",
    cta: "Explore transport",
    icon: Car,
    heroImage: imageFrom(realImages.services.transport, 0),
    items: makeServiceItems("transport", serviceItemNames.transport, "INR 4,500 - 85,000/day", "Luxury cars, guest buses, tempo travellers, airport pickup and VIP movement.")
  }
];

export const serviceNavLinks = serviceCategories.map((service) => ({
  label: service.navLabel,
  href: service.slug === "gardens" ? "/gardens" : `/services/${service.slug}`
}));

export function getServiceCategory(slug: string) {
  return serviceCategories.find((service) => service.slug === slug);
}

export function getGarden(slug: string) {
  return gardens.find((garden) => garden.slug === slug);
}

export function getListingItem(serviceSlug: string, itemSlug: string) {
  return getServiceCategory(serviceSlug)?.items.find((item) => item.slug === itemSlug);
}

export function getSimilarItems(serviceSlug: string, itemSlug: string) {
  return (getServiceCategory(serviceSlug)?.items || []).filter((item) => item.slug !== itemSlug).slice(0, 3);
}
