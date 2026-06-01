export type QuoteInput = {
  guestCount: number;
  budget?: number;
  eventType: string;
  packageName: "Silver" | "Gold" | "Platinum" | "Custom";
};

const venueBase = {
  Silver: 125000,
  Gold: 225000,
  Platinum: 375000,
  Custom: 175000
};

const cateringPerPlate = {
  Silver: 950,
  Gold: 1450,
  Platinum: 2250,
  Custom: 1200
};

const decorBase = {
  Silver: 80000,
  Gold: 175000,
  Platinum: 350000,
  Custom: 125000
};

export function generateQuote(input: QuoteInput) {
  const guests = Number.isFinite(input.guestCount) ? Math.max(input.guestCount, 50) : 200;
  const venue = venueBase[input.packageName];
  const catering = cateringPerPlate[input.packageName] * guests;
  const decor = decorBase[input.packageName];
  const service = Math.round((venue + catering + decor) * 0.07);
  const total = venue + catering + decor + service;
  const advance = Math.round(total * 0.2);

  return {
    guests,
    venue,
    catering,
    decor,
    service,
    total,
    advance,
    recommendation:
      input.budget && input.budget < total
        ? "Consider a weekday slot or custom menu to fit your target budget."
        : "This package is aligned with your event size and preferred experience."
  };
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}
