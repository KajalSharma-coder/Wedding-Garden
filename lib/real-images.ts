const unsplash = (id: string, width = 1800, height = 1200, quality = 88) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=${quality}`;

const pexels = (id: string, width = 1800, height = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${width}&h=${height}`;

export const luxuryWeddingImages = {
  hero: {
    palaceWedding: unsplash("photo-1519225421980-715cb0215aed", 2400, 1500, 90),
    gardenNight: unsplash("photo-1501854140801-50d01698950b", 2400, 1500, 90),
    premiumDecor: unsplash("photo-1464366400600-7168b8af9bc3", 2400, 1500, 90),
    destinationResort: unsplash("photo-1566073771259-6a8506099945", 2400, 1500, 90),
    grandStage: unsplash("photo-1527529482837-4698179dc6ce", 2400, 1500, 90),
    cateringExperience: unsplash("photo-1555244162-803834f70033", 2400, 1500, 90),
    bridalEntry: unsplash("photo-1519741497674-611481863552", 2400, 1500, 90),
    receptionSetup: unsplash("photo-1511795409834-ef04bbd61622", 2400, 1500, 90)
  },
  venues: {
    royalPalace: pexels("30061509"),
    luxuryGarden: pexels("30298624"),
    modernBanquet: unsplash("photo-1511795409834-ef04bbd61622"),
    destinationResort: unsplash("photo-1566073771259-6a8506099945")
  },
  services: {
    gardens: unsplash("photo-1508057198894-247b23fe5ade"),
    decoration: unsplash("photo-1464366400600-7168b8af9bc3"),
    photography: unsplash("photo-1516035069371-29a1b244cc32"),
    caterers: unsplash("photo-1555244162-803834f70033"),
    makeup: unsplash("photo-1487412947147-5cebf100ffc2"),
    mehendi: unsplash("photo-1590075865003-e48277faa558"),
    "dj-band": unsplash("photo-1470229722913-7c0e2dbbafd3"),
    anchor: unsplash("photo-1505373877841-8d25f7d46678"),
    transport: unsplash("photo-1503376780353-7e6692767b70"),
    pandit: unsplash("photo-1607190074257-dd4b7af0309f")
  },
  events: {
    wedding: unsplash("photo-1519225421980-715cb0215aed"),
    destinationWedding: unsplash("photo-1566073771259-6a8506099945"),
    corporateEvents: unsplash("photo-1505373877841-8d25f7d46678"),
    reception: unsplash("photo-1527529482837-4698179dc6ce"),
    engagement: "/images/events/engagement.jpg",
    haldi: "/images/events/haldi.jpg",
    mehendi: "/images/events/mehendi.jpg",
    birthday: "/images/events/birthday.jpg",
    anniversary: unsplash("photo-1498931299472-f7a63a5a1cfa"),
    resorts: unsplash("photo-1564501049412-61c2a3083791"),
    banquetHalls: "https://www.eternalweddingz.in/storage/venue_images/du8ssontcfIRX8iKMYjSkHiGoR1r5NQfMJhR4aSA.webp",
    babyShower: unsplash("photo-1530103862676-de8c9debad1d")
  },
  galleryPreview: [
    unsplash("photo-1519225421980-715cb0215aed"),
    unsplash("photo-1519741497674-611481863552"),
    unsplash("photo-1524504388940-b1c1722653e1"),
    unsplash("photo-1590075865003-e48277faa558"),
    unsplash("photo-1607190074257-dd4b7af0309f"),
    unsplash("photo-1527529482837-4698179dc6ce"),
    unsplash("photo-1555244162-803834f70033"),
    unsplash("photo-1467810563316-b5476525c0f9"),
    unsplash("photo-1492691527719-9d1e07e534b4"),
    unsplash("photo-1464366400600-7168b8af9bc3")
  ],
  sections: {
    about: unsplash("photo-1508057198894-247b23fe5ade"),
    testimonials: unsplash("photo-1501854140801-50d01698950b", 2200, 1200, 84)
  }
};

export const realImages = {
  home: {
    gardens: luxuryWeddingImages.hero.palaceWedding,
    decorations: luxuryWeddingImages.hero.premiumDecor,
    catering: luxuryWeddingImages.hero.cateringExperience,
    bridal: luxuryWeddingImages.hero.bridalEntry,
    vibes: luxuryWeddingImages.hero.receptionSetup,
    about: luxuryWeddingImages.sections.about,
    testimonials: luxuryWeddingImages.sections.testimonials
  },
  gardens: [
    luxuryWeddingImages.venues.royalPalace,
    luxuryWeddingImages.venues.luxuryGarden,
    luxuryWeddingImages.venues.modernBanquet,
    luxuryWeddingImages.venues.destinationResort,
    unsplash("photo-1503342394128-4802590dca26"),
    unsplash("photo-1505691723518-36a6b2d1f56f"),
    unsplash("photo-1496307042754-b4f6e9a0957d"),
    unsplash("photo-1478146896981-b80fe463b330")
  ],
  services: {
    pandit: [
      luxuryWeddingImages.services.pandit,
      unsplash("photo-1604135307399-8dfc6cf0855f"),
      unsplash("photo-1615558235221-a15d2a93c6df"),
      unsplash("photo-1587271407850-8d438ca9fdf2"),
      unsplash("photo-1511285560929-80b456fea0bc"),
      unsplash("photo-1561525140-c2a4cc68e4bd"),
      unsplash("photo-1621646733642-f8c6e267d30d"),
      unsplash("photo-1605001011156-cbf0b0f67a51")
    ],
    decoration: [
      luxuryWeddingImages.services.decoration,
      luxuryWeddingImages.hero.grandStage,
      unsplash("photo-1549417229-aa67d3263c09"),
      unsplash("photo-1518156677180-95a2893f3e9f"),
      unsplash("photo-1525253086316-d0c936c814f8"),
      luxuryWeddingImages.hero.receptionSetup,
      luxuryWeddingImages.hero.gardenNight,
      luxuryWeddingImages.hero.palaceWedding
    ],
    anchor: [
      luxuryWeddingImages.services.anchor,
      unsplash("photo-1516280440614-37939bbacd81"),
      unsplash("photo-1475721027785-f74eccf877e2"),
      unsplash("photo-1522158634458-2c974e7a8985"),
      unsplash("photo-1531058020387-3be344559be6"),
      unsplash("photo-1515187029135-18ee286d815b"),
      unsplash("photo-1516450360452-9312f5e86fc7"),
      unsplash("photo-1492684223066-81342ee5ff30")
    ],
    "dj-band": [
      luxuryWeddingImages.services["dj-band"],
      unsplash("photo-1540039155733-5bb30b53aa14"),
      unsplash("photo-1501386761578-eac5c94b800a"),
      unsplash("photo-1501612780327-45045538702b"),
      unsplash("photo-1516873240891-4bf014598ab4"),
      unsplash("photo-1484755560693-a4074577af3a"),
      unsplash("photo-1524368535928-5b5e00ddc76b"),
      unsplash("photo-1506157786151-b8491531f063")
    ],
    caterers: [
      luxuryWeddingImages.services.caterers,
      unsplash("photo-1414235077428-338989a2e8c0"),
      unsplash("photo-1551218808-94e220e084d2"),
      unsplash("photo-1504674900247-0877df9cc836"),
      unsplash("photo-1504754524776-8f4f37790ca0"),
      unsplash("photo-1555939594-58d7cb561ad1"),
      unsplash("photo-1565299624946-b28f40a0ae38"),
      unsplash("photo-1490717064594-3be2c438978e")
    ],
    makeup: [
      luxuryWeddingImages.services.makeup,
      unsplash("photo-1522335789203-aabd1fc54bc9"),
      unsplash("photo-1508214751196-bcfd4ca60f91"),
      unsplash("photo-1524504388940-b1c1722653e1"),
      unsplash("photo-1529626455594-4ff0802cfb7e"),
      unsplash("photo-1496747611176-843222e1e57c"),
      unsplash("photo-1524250502761-1ac6f2e30d43"),
      unsplash("photo-1512496015851-a90fb38ba796")
    ],
    mehendi: [
      luxuryWeddingImages.services.mehendi,
      unsplash("photo-1582234372722-50d7ccc30ebd"),
      unsplash("photo-1605389658763-71869e5d4875"),
      unsplash("photo-1610030469668-93535c17b6b3"),
      unsplash("photo-1612450797305-649065961605"),
      unsplash("photo-1562790351-d273a961e0e9"),
      unsplash("photo-1603561591411-07134e71a2a9"),
      unsplash("photo-1542838132-92c53300491e")
    ],
    transport: [
      luxuryWeddingImages.services.transport,
      unsplash("photo-1492144534655-ae79c964c9d7"),
      unsplash("photo-1503736334956-4c8f8e92946d"),
      unsplash("photo-1525609004556-c46c7d6cf023"),
      unsplash("photo-1542362567-b07e54358753"),
      unsplash("photo-1511919884226-fd3cad34687c"),
      unsplash("photo-1533473359331-0135ef1b58bf"),
      unsplash("photo-1541899481282-d53bffe3c35d")
    ],
    photography: [
      luxuryWeddingImages.services.photography,
      unsplash("photo-1492691527719-9d1e07e534b4"),
      unsplash("photo-1485846234645-a62644f84728"),
      unsplash("photo-1493711662062-fa541adb3fc8"),
      unsplash("photo-1542038784456-1ea8e935640e"),
      unsplash("photo-1453060113865-968feeab6763"),
      unsplash("photo-1513829096999-4978602294fc"),
      unsplash("photo-1500530855697-b586d89ba3ee")
    ],
    musicians: [
      unsplash("photo-1511379938547-c1f69419868d"),
      unsplash("photo-1493225457124-a3eb161ffa5f"),
      unsplash("photo-1507838153414-b4b713384a76"),
      unsplash("photo-1508700115892-45ecd05ae2ad"),
      unsplash("photo-1510915361894-db8b60106cb1"),
      unsplash("photo-1471478331149-c72f17e33c73"),
      unsplash("photo-1520523839897-bd0b52f945a0"),
      unsplash("photo-1514525253161-7a46d19cd819")
    ],
    fireworks: [
      luxuryWeddingImages.events.anniversary,
      luxuryWeddingImages.galleryPreview[7],
      unsplash("photo-1533236897111-3e94666b2edf"),
      unsplash("photo-1504196606672-aef5c9cefc92"),
      unsplash("photo-1519671482749-fd09be7ccebf"),
      unsplash("photo-1506744038136-46273834b3fb"),
      unsplash("photo-1535498730771-e735b998cd64"),
      unsplash("photo-1549417229-aa67d3263c09")
    ],
    accommodation: [
      luxuryWeddingImages.venues.destinationResort,
      luxuryWeddingImages.hero.destinationResort,
      unsplash("photo-1551882547-ff40c63fe5fa"),
      unsplash("photo-1578683010236-d716f9a3f461"),
      unsplash("photo-1520250497591-112f2f40a3f4"),
      unsplash("photo-1582719478250-c89cae4dc85b"),
      unsplash("photo-1445019980597-93fa8acb246c"),
      unsplash("photo-1590490360182-c33d57733427")
    ]
  }
};

const categoryFallbacks: Record<string, string> = {
  garden: luxuryWeddingImages.services.gardens,
  gardens: luxuryWeddingImages.services.gardens,
  venue: luxuryWeddingImages.venues.royalPalace,
  palace: luxuryWeddingImages.venues.royalPalace,
  decoration: luxuryWeddingImages.services.decoration,
  decor: luxuryWeddingImages.services.decoration,
  photographer: luxuryWeddingImages.services.photography,
  photography: luxuryWeddingImages.services.photography,
  caterer: luxuryWeddingImages.services.caterers,
  catering: luxuryWeddingImages.services.caterers,
  caterers: luxuryWeddingImages.services.caterers,
  makeup: luxuryWeddingImages.services.makeup,
  bridal: luxuryWeddingImages.services.makeup,
  mehendi: luxuryWeddingImages.services.mehendi,
  mehndi: luxuryWeddingImages.services.mehendi,
  dj: luxuryWeddingImages.services["dj-band"],
  band: luxuryWeddingImages.services["dj-band"],
  anchor: luxuryWeddingImages.services.anchor,
  host: luxuryWeddingImages.services.anchor,
  car: luxuryWeddingImages.services.transport,
  bus: luxuryWeddingImages.services.transport,
  transport: luxuryWeddingImages.services.transport,
  pandit: luxuryWeddingImages.services.pandit,
  ritual: luxuryWeddingImages.services.pandit,
  wedding: luxuryWeddingImages.events.wedding,
  reception: luxuryWeddingImages.events.reception,
  engagement: luxuryWeddingImages.events.engagement,
  haldi: luxuryWeddingImages.events.haldi,
  birthday: luxuryWeddingImages.events.birthday,
  anniversary: luxuryWeddingImages.events.anniversary,
  corporate: luxuryWeddingImages.events.corporateEvents,
  resort: luxuryWeddingImages.events.resorts,
  gallery: luxuryWeddingImages.galleryPreview[0]
};

export function imageFrom(list: string[], index: number) {
  return list[index % list.length];
}

export function serviceImage(folder: keyof typeof realImages.services | string, index: number) {
  const images = realImages.services[folder as keyof typeof realImages.services];
  return images ? imageFrom(images, index) : fallbackImage(folder);
}
export function fallbackImage(label?: string | null) {
  if (!label) {
    return luxuryWeddingImages.hero.palaceWedding;
  }

  const normalized = String(label).toLowerCase();


  const match = Object.entries(categoryFallbacks)
    .find(([keyword]) => normalized.includes(keyword));

  return match?.[1] || luxuryWeddingImages.hero.palaceWedding;
}
