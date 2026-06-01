import {
  BadgeIndianRupee,
  BellRing,
  CalendarCheck,
  Camera,
  Car,
  ChefHat,
  Drum,
  Gem,
  Headphones,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Paintbrush,
  Sparkles,
  Users,
  WandSparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { imageFrom, luxuryWeddingImages, realImages } from "@/lib/real-images";

export const heroMedia = {
  video: "/images/home/royal-vivah-hero.mp4",
  fallback: realImages.home.gardens
};

export const venues = [
  {
    slug: "rajwada-lawn",
    name: "Rajwada Palace Lawn",
    image: imageFrom(realImages.gardens, 0),
    location: "Ajmer Road, Jaipur",
    capacity: "250-1200 guests",
    price: "From INR 2.75L",
    amenities: ["Royal entry", "Valet parking", "Power backup", "Bridal suite"],
    parking: "350 cars",
    rooms: "18 premium rooms",
    ac: "AC banquet plus open lawn",
    lawn: "52,000 sq ft",
    catering: "In-house and approved partners",
    blockedDates: ["2026-06-12", "2026-07-02", "2026-11-21"]
  },
  {
    slug: "amrit-mahal",
    name: "Amrit Mahal Garden",
    image: imageFrom(realImages.gardens, 2),
    location: "Vaishali Nagar, Jaipur",
    capacity: "150-700 guests",
    price: "From INR 1.85L",
    amenities: ["Mandap deck", "Live counters", "Decor studio", "Green rooms"],
    parking: "180 cars",
    rooms: "8 family suites",
    ac: "Non AC lawn with mist cooling",
    lawn: "28,000 sq ft",
    catering: "Flexible catering policy",
    blockedDates: ["2026-05-28", "2026-08-14", "2026-12-09"]
  },
  {
    slug: "maharani-courtyard",
    name: "Maharani Courtyard",
    image: luxuryWeddingImages.venues.modernBanquet,
    location: "Jagatpura, Jaipur",
    capacity: "80-450 guests",
    price: "From INR 1.25L",
    amenities: ["Poolside mehendi", "LED stage", "Drone permitted", "Guest check-in"],
    parking: "120 cars",
    rooms: "6 boutique rooms",
    ac: "AC hall plus courtyard",
    lawn: "16,000 sq ft",
    catering: "In-house vegetarian kitchen",
    blockedDates: ["2026-06-01", "2026-10-31", "2027-01-18"]
  },
  {
    slug: "udaipur-resort-greens",
    name: "Udaipur Resort Greens",
    image: luxuryWeddingImages.venues.destinationResort,
    location: "Destination Resort Zone, Jaipur",
    capacity: "120-600 guests",
    price: "From INR 3.25L",
    amenities: ["Resort lawns", "Poolside events", "Premium suites", "Hospitality desk"],
    parking: "220 cars",
    rooms: "28 resort rooms",
    ac: "AC banquet plus resort lawn",
    lawn: "34,000 sq ft",
    catering: "Curated resort menus",
    blockedDates: ["2026-09-18", "2026-11-29", "2027-02-14"]
  }
];

export type ServicePackage = {
  name: string;
  price: string;
  tagline: string;
  features: string[];
};

export type WeddingService = {
  slug: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  detail: string;
  description: string;
  heroImage: string;
  gallery: string[];
  features: string[];
  benefits: string[];
  packages: ServicePackage[];
  whyChooseUs: string[];
  testimonials: { name: string; text: string; rating: string }[];
  faqs: { question: string; answer: string }[];
};

const serviceGallery = [
  ...realImages.services.decoration.slice(0, 2),
  ...realImages.services.caterers.slice(0, 1),
  ...realImages.services.makeup.slice(0, 1),
  ...realImages.services["dj-band"].slice(0, 1),
  ...realImages.services.photography.slice(0, 1)
];

const makePackages = (starter: string, signature: string, luxury: string): ServicePackage[] => [
  {
    name: "Essential",
    price: starter,
    tagline: "Elegant essentials",
    features: ["Consultation and planning call", "Verified vendor team", "Event-day coordination", "Digital booking record"]
  },
  {
    name: "Signature",
    price: signature,
    tagline: "Most requested",
    features: ["Premium team and setup", "Timeline and logistics support", "Custom style preferences", "Priority WhatsApp support"]
  },
  {
    name: "Royal",
    price: luxury,
    tagline: "Luxury experience",
    features: ["Bespoke planning", "Senior specialists", "Full event coverage", "Dedicated concierge manager"]
  }
];

export const services: WeddingService[] = [
  {
    slug: "musicians",
    title: "Musicians",
    tagline: "Live melodies for ceremonies, cocktails and royal entries.",
    icon: Drum,
    detail: "Classical, folk, sufi, acoustic and live band performances curated for every wedding moment.",
    description:
      "Our musician lineups bring warmth and grandeur to your celebration, from soulful shehnai at the welcome gate to sufi evenings, folk ensembles, acoustic cocktail sets and high-energy live bands. We match the artist style to your venue, guest profile, rituals and sound restrictions so every performance feels intentional and polished.",
    heroImage: imageFrom(realImages.services.musicians, 0),
    gallery: realImages.services.musicians,
    features: ["Classical and folk artists", "Sufi and acoustic sets", "Live band options", "Sound check support", "Ceremony cue planning", "Artist hospitality coordination"],
    benefits: ["Creates an emotional atmosphere", "Smooth transitions between rituals", "Verified performers", "Flexible sets for indoor and outdoor venues"],
    packages: makePackages("From INR 35,000", "From INR 85,000", "Custom"),
    whyChooseUs: ["Curated Jaipur and Rajasthan artist network", "Backup artist planning for critical events", "One point of coordination with venue and sound team"],
    testimonials: [
      { name: "Ritika S.", rating: "5.0", text: "The sufi night felt intimate and premium. Every cue was handled beautifully." },
      { name: "Karan M.", rating: "4.9", text: "Their folk musicians made the welcome dinner feel truly Rajasthani." }
    ],
    faqs: [
      { question: "Can we request specific songs?", answer: "Yes, share your playlist and ceremony cues before the event." },
      { question: "Do packages include sound?", answer: "Basic artist sound can be included, while larger setups are quoted after venue review." }
    ]
  },
  {
    slug: "pandit-ji",
    title: "Pandit Ji",
    tagline: "Verified priests for meaningful, well-guided wedding rituals.",
    icon: Gem,
    detail: "Muhurat guidance, ceremony planning, samagri lists and ritual support for families.",
    description:
      "Book experienced Pandit Ji services for engagement, haldi, wedding pheras, griha pravesh and post-wedding rituals. We help with muhurat guidance, samagri planning, family coordination and ceremony flow so elders and guests can stay present during the rituals.",
    heroImage: imageFrom(realImages.services.pandit, 0),
    gallery: realImages.services.pandit,
    features: ["Muhurat consultation", "Ritual flow planning", "Samagri checklist", "Hindi and Sanskrit guidance", "Family coordination", "Destination wedding support"],
    benefits: ["Clear ceremony timeline", "Respectful ritual explanation", "Reduced last-minute stress", "Trusted local priests"],
    packages: makePackages("From INR 11,000", "From INR 21,000", "Custom"),
    whyChooseUs: ["Verified priest network", "Transparent ritual requirements", "Support for multi-day ceremonies"],
    testimonials: [
      { name: "Neha J.", rating: "5.0", text: "Pandit Ji explained every ritual with patience and warmth." },
      { name: "Amit B.", rating: "4.8", text: "Samagri planning was clear and saved us from last-minute running around." }
    ],
    faqs: [
      { question: "Can Pandit Ji travel to our venue?", answer: "Yes, travel can be included based on venue location and ceremony timing." },
      { question: "Do you provide samagri?", answer: "We can share a checklist or arrange samagri as an add-on." }
    ]
  },
  {
    slug: "photography",
    title: "Photography",
    tagline: "Cinematic memories with candid photography, films, reels and albums.",
    icon: Camera,
    detail: "Cinematic films, drone shoots, reels, candid photography and premium wedding albums.",
    description:
      "Our photography partners cover the full wedding story with candid photographers, traditional coverage, cinematic wedding films, drone shots, teaser reels and premium albums. Every package is planned around the venue layout, rituals, lighting and family shot priorities.",
    heroImage: imageFrom(realImages.services.photography, 0),
    gallery: realImages.services.photography,
    features: ["Candid and traditional teams", "Cinematic films", "Drone coverage", "Instagram reels", "Premium albums", "Same-week teaser options"],
    benefits: ["Reliable ritual coverage", "Editorial couple portraits", "Clear delivery timelines", "Professional backup workflow"],
    packages: makePackages("From INR 75,000", "From INR 1.75L", "From INR 3.5L"),
    whyChooseUs: ["Vetted photo and video teams", "Venue-aware shot planning", "Album and edit delivery tracking"],
    testimonials: [
      { name: "Mansi and Varun", rating: "5.0", text: "The teaser film was stunning and delivered faster than expected." },
      { name: "Priya K.", rating: "4.9", text: "They captured rituals and candid family moments without feeling intrusive." }
    ],
    faqs: [
      { question: "Can we add drone coverage?", answer: "Yes, drone coverage is available where venue rules and local permissions allow it." },
      { question: "When will we receive edited photos?", answer: "Delivery timelines depend on package scope and are confirmed in your booking plan." }
    ]
  },
  {
    slug: "luxury-cars",
    title: "Luxury Cars",
    tagline: "Statement arrivals with vintage, luxury and convertible cars.",
    icon: Car,
    detail: "Vintage, convertible and luxury entry vehicles for couples, family and VIP guests.",
    description:
      "Create a refined arrival experience with luxury sedans, vintage cars, convertibles and premium SUVs. We coordinate timings, decor, chauffeur reporting, photo stops and venue entry routes so your arrival feels effortless and cinematic.",
    heroImage: imageFrom(realImages.services.transport, 0),
    gallery: realImages.services.transport,
    features: ["Vintage and luxury cars", "Decorated couple entry", "Professional chauffeurs", "Airport and hotel transfers", "VIP guest movement", "Route coordination"],
    benefits: ["Memorable entry visuals", "Reliable reporting times", "Comfortable VIP transfers", "Photo-ready vehicles"],
    packages: makePackages("From INR 18,000", "From INR 45,000", "Custom"),
    whyChooseUs: ["Inspected vehicle partners", "Backup planning for key arrivals", "Coordination with venue gate and photography team"],
    testimonials: [
      { name: "Rohan D.", rating: "5.0", text: "The vintage car entry looked incredible in photos." },
      { name: "Sakshi P.", rating: "4.8", text: "Chauffeur timing and coordination were perfectly managed." }
    ],
    faqs: [
      { question: "Can the car be decorated?", answer: "Yes, floral or ribbon decor can be added based on your theme." },
      { question: "Are outstation transfers available?", answer: "Yes, we can quote outstation movement after reviewing route and timing." }
    ]
  },
  {
    slug: "guest-accommodation",
    title: "Guest Accommodation",
    tagline: "Comfortable stays and hospitality support for wedding guests.",
    icon: Users,
    detail: "Hotel blocks, guest check-in, rooming lists, transport and hospitality desk support.",
    description:
      "We manage guest accommodation across hotels, venue rooms and partner stays with rooming lists, check-in support, welcome hampers, transport coordination and hospitality desks. It keeps families free from constant phone calls during the wedding week.",
    heroImage: imageFrom(realImages.services.accommodation, 0),
    gallery: realImages.services.accommodation,
    features: ["Hotel block coordination", "Rooming list management", "Guest check-in desks", "Welcome hampers", "Transport mapping", "Family VIP assistance"],
    benefits: ["Better guest experience", "Centralized stay updates", "Reduced family workload", "Smooth arrivals and departures"],
    packages: makePackages("Planning fee from INR 25,000", "From INR 65,000", "Custom"),
    whyChooseUs: ["Local hotel partner network", "Hospitality desk templates", "Guest movement planning with venue team"],
    testimonials: [
      { name: "Ananya R.", rating: "5.0", text: "Our outstation guests were looked after from arrival to checkout." },
      { name: "Dev S.", rating: "4.9", text: "Rooming lists and transport coordination were handled with real care." }
    ],
    faqs: [
      { question: "Can you manage bulk hotel bookings?", answer: "Yes, we can coordinate room blocks and negotiated rates with partner hotels." },
      { question: "Do you provide guest transport?", answer: "Transport can be added for airport, station, hotel and venue movement." }
    ]
  },
  {
    slug: "catering",
    title: "Catering",
    tagline: "Luxury menus, live counters and hospitality-led food service.",
    icon: ChefHat,
    detail: "Veg and non-veg menus, live counters, tasting sessions and professional service teams.",
    description:
      "From traditional Rajasthani menus to global live counters, our catering partners design menus around your guest count, rituals, dietary preferences and service style. Tastings, menu engineering, stall planning and service staffing are coordinated before the event.",
    heroImage: imageFrom(realImages.services.caterers, 0),
    gallery: realImages.services.caterers,
    features: ["Multi-cuisine menus", "Live counters", "Tasting sessions", "Service staff planning", "Jain and dietary menus", "Beverage counters"],
    benefits: ["Guest-friendly menu flow", "Transparent per-plate planning", "Premium presentation", "Reliable service staffing"],
    packages: makePackages("From INR 850/plate", "From INR 1,650/plate", "Custom"),
    whyChooseUs: ["Verified caterers", "Menu planning by event type", "Live counter and layout coordination"],
    testimonials: [
      { name: "Aman Sharma", rating: "4.9", text: "Food quality and counter management were excellent through the reception." },
      { name: "Isha G.", rating: "5.0", text: "The tasting helped us finalize a menu everyone loved." }
    ],
    faqs: [
      { question: "Do you offer Jain food?", answer: "Yes, Jain, vegan and allergy-aware options can be planned." },
      { question: "Can we customize live counters?", answer: "Yes, counters are customized by cuisine, guest count and venue layout." }
    ]
  },
  {
    slug: "djs",
    title: "DJs",
    tagline: "Premium DJ, sound, lights and after-party energy.",
    icon: Headphones,
    detail: "Premium audio, SFX, LED walls, dance floors and after-party setups.",
    description:
      "Book professional DJs with tuned sound systems, intelligent lights, LED walls, SFX and dance-floor support for sangeet, cocktail and after-parties. We align playlists, venue sound rules, power needs and show cues in advance.",
    heroImage: imageFrom(realImages.services["dj-band"], 0),
    gallery: realImages.services["dj-band"],
    features: ["Professional DJs", "Premium speakers", "Dance floor lighting", "LED wall add-ons", "SFX and cold pyro", "Playlist planning"],
    benefits: ["High-energy celebrations", "Clean sound setup", "Venue-compliant planning", "Coordinated show cues"],
    packages: makePackages("From INR 45,000", "From INR 1.1L", "Custom"),
    whyChooseUs: ["Verified event DJs", "Technical planning with venue power team", "Backup equipment options"],
    testimonials: [
      { name: "Kabir A.", rating: "5.0", text: "The sangeet energy was exactly what we wanted." },
      { name: "Megha L.", rating: "4.8", text: "Sound was clear and the lighting made the dance floor look premium." }
    ],
    faqs: [
      { question: "Can we share a playlist?", answer: "Yes, the DJ can build around your must-play and do-not-play lists." },
      { question: "Do you handle permissions?", answer: "We guide sound and timing requirements, while venue-specific permissions are confirmed during planning." }
    ]
  },
  {
    slug: "decoration",
    title: "Decoration",
    tagline: "Royal mandaps, floral entries and immersive wedding themes.",
    icon: Paintbrush,
    detail: "Royal, floral, Rajasthani, LED and mandap setups tailored to your celebration.",
    description:
      "Our decor service covers mandaps, stages, floral entries, seating lounges, pathway styling, lighting concepts and theme production. Whether you prefer royal maroon and gold, pastel florals or a contemporary LED look, we plan the details around your venue and budget.",
    heroImage: imageFrom(realImages.services.decoration, 0),
    gallery: realImages.services.decoration,
    features: ["Mandap and stage design", "Floral entries", "Theme moodboards", "Lighting concepts", "Guest lounge styling", "Production supervision"],
    benefits: ["Cohesive event look", "Photo-friendly focal points", "Budget-aware design", "Vendor and venue coordination"],
    packages: makePackages("From INR 75,000", "From INR 2.25L", "Custom"),
    whyChooseUs: ["Theme-first planning", "Experienced production partners", "Clear inclusions and upgrade options"],
    testimonials: [
      { name: "Ritika and Mohit", rating: "5.0", text: "The mandap and entry looked richer than our reference photos." },
      { name: "Nidhi S.", rating: "4.9", text: "They translated our pastel theme into a beautiful garden setup." }
    ],
    faqs: [
      { question: "Can decor be customized?", answer: "Yes, every package can be customized by theme, flowers, lighting and scale." },
      { question: "Do you provide a moodboard?", answer: "Signature and Royal packages include theme references or moodboards." }
    ]
  },
  {
    slug: "bridal-makeup",
    title: "Bridal Makeup",
    tagline: "Polished bridal looks with trials, styling and on-time artists.",
    icon: Sparkles,
    detail: "Bridal artists, salon suites, family makeup and trial bookings.",
    description:
      "Book bridal makeup artists for engagement, haldi, mehendi, wedding and reception looks. Packages can include trials, hairstyling, draping, HD or airbrush makeup, family makeup and on-location support for early morning or late-night ceremonies.",
    heroImage: imageFrom(realImages.services.makeup, 0),
    gallery: realImages.services.makeup,
    features: ["HD and airbrush makeup", "Hair styling", "Draping support", "Trial sessions", "Family makeup", "On-location artists"],
    benefits: ["Camera-ready finish", "Reliable timing", "Look planning by outfit", "Comfortable bridal experience"],
    packages: makePackages("From INR 18,000", "From INR 45,000", "Custom"),
    whyChooseUs: ["Verified bridal artists", "Trial and look planning support", "Family artist add-ons"],
    testimonials: [
      { name: "Simran K.", rating: "5.0", text: "My wedding and reception looks both felt elegant and stayed fresh." },
      { name: "Aarushi M.", rating: "4.9", text: "Artist timing was perfect, even with an early morning ceremony." }
    ],
    faqs: [
      { question: "Is a makeup trial available?", answer: "Yes, trial sessions can be added before final booking." },
      { question: "Can family makeup be included?", answer: "Yes, family and bridesmaid makeup can be added by count and timing." }
    ]
  },
  {
    slug: "fireworks",
    title: "Fireworks",
    tagline: "Sparkling entries, cold pyro and celebration effects.",
    icon: WandSparkles,
    detail: "Cold pyro, fireworks, spark fountains and safe special effects for grand moments.",
    description:
      "Add drama to entries, varmala, first dance or finale moments with cold pyro, spark fountains and venue-approved fireworks. Safety, timing, permissions and placement are reviewed before confirmation so effects enhance the event without disrupting the flow.",
    heroImage: imageFrom(realImages.services.fireworks, 0),
    gallery: realImages.services.fireworks,
    features: ["Cold pyro entries", "Spark fountains", "Outdoor fireworks", "Varmala effects", "First dance effects", "Safety supervision"],
    benefits: ["Grand visual moments", "Photo and video impact", "Planned cue timing", "Safety-first execution"],
    packages: makePackages("From INR 25,000", "From INR 75,000", "Custom"),
    whyChooseUs: ["Venue-aware effect planning", "Experienced operators", "Permission and safety guidance"],
    testimonials: [
      { name: "Harsh V.", rating: "5.0", text: "The varmala spark moment looked magical on video." },
      { name: "Tanya R.", rating: "4.8", text: "They kept the effects tasteful, safe and perfectly timed." }
    ],
    faqs: [
      { question: "Are fireworks allowed at every venue?", answer: "No, availability depends on venue rules, timing and local permissions." },
      { question: "Is cold pyro safe indoors?", answer: "Cold pyro may be possible in approved setups after safety and height checks." }
    ]
  }
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getRelatedServices(slug: string, count = 3) {
  return services.filter((service) => service.slug !== slug).slice(0, count);
}

export const packages = [
  {
    name: "Silver",
    price: "Basic",
    tagline: "Elegant essentials",
    features: ["Venue slot", "Standard decoration", "Basic sound", "Guest helpdesk", "Digital invoice"]
  },
  {
    name: "Gold",
    price: "Premium",
    tagline: "Most booked",
    features: ["Premium decor", "Catering support", "Photography partner", "WhatsApp reminders", "Visit manager"]
  },
  {
    name: "Platinum",
    price: "Luxury",
    tagline: "VIP experience",
    features: ["Designer theme", "Hospitality team", "Drone shoot", "QR check-in", "Live streaming"]
  }
];

export const gallery = [
  ...luxuryWeddingImages.galleryPreview
];

export const vendors = [
  { name: "Anaya Films", category: "Photographer", rating: 4.9, leads: 126, featured: true },
  { name: "Meera Bridal Art", category: "Makeup Artist", rating: 4.8, leads: 98, featured: true },
  { name: "Sur Taal Events", category: "DJ", rating: 4.7, leads: 72, featured: false },
  { name: "Rangrez Mehendi", category: "Mehendi Artist", rating: 4.9, leads: 88, featured: false },
  { name: "Rajputana Cars", category: "Car Rental", rating: 4.6, leads: 55, featured: true },
  { name: "Shubh Pandit Seva", category: "Pandit Ji", rating: 4.8, leads: 64, featured: false }
];

export const eventTypes = [
  { slug: "wedding", title: "Wedding", image: luxuryWeddingImages.events.wedding },
  { slug: "destination-wedding", title: "Destination Wedding", image: luxuryWeddingImages.events.destinationWedding },
  { slug: "reception", title: "Reception", image: luxuryWeddingImages.events.reception },
  { slug: "engagement", title: "Engagement", image: luxuryWeddingImages.events.engagement },
  { slug: "haldi", title: "Haldi", image: luxuryWeddingImages.events.haldi },
  { slug: "mehendi", title: "Mehendi", image: luxuryWeddingImages.events.mehendi },
  { slug: "birthday", title: "Birthday", image: luxuryWeddingImages.events.birthday },
  { slug: "corporate-events", title: "Corporate Events", image: luxuryWeddingImages.events.corporateEvents },
  { slug: "resorts", title: "Resorts", image: luxuryWeddingImages.events.resorts },
  { slug: "banquet-halls", title: "Banquet Halls", image: luxuryWeddingImages.events.banquetHalls },
  { slug: "anniversary", title: "Anniversary", image: luxuryWeddingImages.events.anniversary },
  { slug: "baby-shower", title: "Baby Shower", image: luxuryWeddingImages.events.babyShower }
];

export const crmStages = [
  { label: "New Leads", count: 42, value: "24%", icon: BellRing },
  { label: "Venue Visits", count: 18, value: "11 today", icon: MapPin },
  { label: "Bookings", count: 11, value: "INR 38.4L", icon: CalendarCheck },
  { label: "Payments", count: 8, value: "INR 9.6L", icon: BadgeIndianRupee }
];

export const aiFeatures = [
  { title: "AI quotation generator", icon: WandSparkles, text: "Calculates venue, guest, catering, decoration and add-on pricing instantly." },
  { title: "Smart package recommendation", icon: Gem, text: "Suggests Silver, Gold, Platinum or Custom plans based on budget and intent." },
  { title: "AI wedding planner assistant", icon: MessageCircle, text: "Answers venue, ritual, vendor, schedule and payment questions 24x7." },
  { title: "Guest management", icon: Users, text: "QR guest check-in, RSVP tracking, digital invitations and event countdowns." }
];

export const whatsappTemplates = [
  "Thank you for your inquiry. Our wedding consultant will share your instant quote shortly.",
  "Your booking is confirmed. Please keep your payment receipt for venue entry support.",
  "Venue visit reminder: your slot is scheduled. Tap for route navigation.",
  "Payment reminder: your advance payment link is active for the selected event date."
];

export const aboutHighlights = [
  "Premium wedding gardens with parking, rooms, backup power and visit support",
  "Single concierge for venue, decor, catering, media, makeup, music and planning",
  "CRM-backed follow-ups, instant quote generation and WhatsApp-first communication"
];

export const testimonials = [
  { name: "Ritika and Mohit", rating: "5.0", text: "The garden, decor and guest support were handled beautifully from visit to vidaai." },
  { name: "Aman Sharma", rating: "4.9", text: "Clear pricing, fast WhatsApp replies and a very smooth booking process for our reception." },
  { name: "Neha Jain", rating: "5.0", text: "Vendor coordination saved us weeks. Photography, makeup and catering were all on time." }
];

export const faqs = [
  { question: "Can I book a free venue visit?", answer: "Yes, submit the inquiry form or use WhatsApp to schedule a guided venue visit." },
  { question: "Do you support UPI and online advance payments?", answer: "Yes, the system supports UPI, Razorpay, PhonePe and Paytm-ready payment workflows." },
  { question: "Can I customize packages?", answer: "Yes, Silver, Gold and Platinum packages can be customized with decor, catering, media and planning add-ons." },
  { question: "Do you provide vendor marketplace support?", answer: "Yes, verified vendors can receive direct inquiries, reviews and lead notifications." }
];

export const blogPosts = [
  {
    slug: "wedding-decoration-ideas",
    title: "Wedding Decoration Ideas for a Royal Garden Celebration",
    category: "Decoration Ideas",
    excerpt: "Mandap themes, floral entries, stage concepts and lighting ideas for premium wedding gardens."
  },
  {
    slug: "wedding-budget-planning",
    title: "Wedding Budget Planning for Venue, Catering and Decor",
    category: "Budget Planning",
    excerpt: "Plan guest count, per-plate pricing, advance payment and package add-ons without surprises."
  },
  {
    slug: "bridal-trends",
    title: "Bridal Trends for Modern Weddings",
    category: "Bridal Trends",
    excerpt: "Makeup, reels, photography moments and entry ideas that feel elegant on the wedding day."
  },
  {
    slug: "wedding-tips",
    title: "Wedding Tips Before You Finalize a Marriage Garden",
    category: "Wedding Tips",
    excerpt: "Check capacity, parking, rooms, power backup, permissions and cancellation rules before booking."
  },
  {
    slug: "best-wedding-themes",
    title: "Best Wedding Themes for Luxury Garden Events",
    category: "Wedding Themes",
    excerpt: "Royal, floral, Rajasthani, pastel, LED and destination-style themes for premium wedding gardens."
  }
];

export const premiumFeatures = [
  "QR invitation and guest check-in",
  "Live streaming and wedding films",
  "Guest management and RSVP tracking",
  "AI wedding planner assistant",
  "Exit popup offer foundation",
  "Free venue visit booking"
];

export const paymentMethods = ["UPI", "Razorpay", "PhonePe", "Paytm"];

export const securityFeatures = ["OTP login", "SSL security", "Backup system", "Spam protection"];

export const futureScaleFeatures = ["Multi-venue branches", "Franchise model", "Vendor subscriptions", "Customer and vendor mobile app"];
