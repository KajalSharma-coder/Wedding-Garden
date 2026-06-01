import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import multer from "multer";
import { ResultSetHeader } from "mysql2";
import { pool, query, ensureDatabase } from "./db";
import { ensureDatabaseSchema } from "./db-schema";
import { asyncHandler, fail, ok } from "./http";
import { clearAuthCookie, requireAuth, setAuthCookie, signToken } from "./auth";
import { galleryUpload as galleryFileUpload, publicPath, serviceUpload, vendorUpload } from "./uploads";
import { listFromText, slugify, first } from "./utils";

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 4000);
const SERVICE_TABLE = "services";
const INQUIRY_TABLE = "inquiries";
const AVAILABILITY_TABLE = "availability";

app.use(cors({ origin: process.env.WEB_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

const adminEmail = (process.env.ADMIN_EMAIL || "admin@royalvivah.com").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "Royal@2026";
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || null;

app.post("/api/admin/login", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const remember = Boolean(body.remember);

  if (!email || !password) {
    return fail(res, 422, "Email and password are required.");
  }

  const validPassword = adminPasswordHash
    ? await bcrypt.compare(password, adminPasswordHash)
    : password === adminPassword;

  if (email !== adminEmail || !validPassword) {
    return fail(res, 401, "Invalid admin credentials.");
  }

  const token = signToken({ id: 0, role: "admin", email: adminEmail });
  setAuthCookie(res, token, remember);
  return ok(res, { message: "Admin login successful." });
}));

app.post("/api/admin/logout", (_req, res) => {
  clearAuthCookie(res);
  return ok(res, { message: "Logged out." });
});

app.get("/api/admin/verify", requireAuth("admin"), (_req, res) => {
  return ok(res, { admin: true });
});

app.use("/api/admin", (req, res, next) => {
  if (req.path === "/login" || req.path === "/logout" || req.path === "/verify") {
    return next();
  }
  return requireAuth("admin")(req, res, next);
});

const vendorRegisterUpload = vendorUpload.fields([
  { name: "profile_image", maxCount: 1 },
  { name: "profileImage", maxCount: 1 }
]);

const galleryUpload = galleryFileUpload.array("images[]", 40);

function galleryLog(event: string, payload: Record<string, unknown>) {
  console.info(`[gallery:${event}]`, JSON.stringify(payload));
}

function removeLocalUpload(publicUrl: string | null | undefined) {
  const value = String(publicUrl || "");
  if (!value.startsWith("/uploads/")) return;
  const target = path.resolve(process.cwd(), value.replace(/^\/+/, ""));
  const uploadRoot = path.resolve(process.cwd(), "uploads");
  if (!target.startsWith(uploadRoot)) return;
  fs.promises.unlink(target).catch(() => undefined);
}

function uploaded(req: express.Request, key: string) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  return files?.[key]?.[0];
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function requiredText(body: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = text(body[key]);
    if (value) return value;
  }
  return "";
}

function requireServicePayload(body: Record<string, unknown>) {
  const payload = {
    serviceName: requiredText(body, ["service_name", "name"]),
    category: requiredText(body, ["category"]),
    price: Number(requiredText(body, ["price", "pricing"]).replace(/[^\d.]/g, "") || 0),
    description: requiredText(body, ["description"]),
    capacity: requiredText(body, ["capacity"]),
    location: requiredText(body, ["location", "city"]),
    availability: requiredText(body, ["availability"]),
    contactDetails: requiredText(body, ["contact_details", "phone"]),
    whatsappNumber: requiredText(body, ["whatsapp_number", "phone"]),
    videoUrl: requiredText(body, ["video_url"])
  };

  const missing = [
    ["serviceName", "Service name"],
    ["category", "Category"],
    ["description", "Description"],
    ["location", "Location"],
    ["availability", "Availability"],
    ["contactDetails", "Contact details"],
    ["whatsappNumber", "WhatsApp number"]
  ].filter(([key]) => !payload[key as keyof typeof payload]);

  return { payload, missing: missing.map(([, label]) => label) };
}

async function uniqueSlug(base: string) {
  const clean = slugify(base) || `service-${Date.now()}`;
  let candidate = clean;
  let suffix = 1;

  while (true) {
    const rows = await query(`SELECT id FROM ${SERVICE_TABLE} WHERE slug = ? LIMIT 1`, [candidate]);
    if (!rows.length) return candidate;
    suffix += 1;
    candidate = `${clean}-${suffix}`;
  }
}

async function syncLegacyServiceName(serviceId: number | string, serviceName: string) {
  try {
    await pool.execute("UPDATE services SET name = ? WHERE id = ?", [serviceName, serviceId]);
  } catch (error: any) {
    if (error?.code !== "ER_BAD_FIELD_ERROR") throw error;
  }
}

function serviceSelect(where = "1=1") {
  return `
    SELECT
      vs.*,
      v.business_name,
      v.full_name AS vendor_name,
      (
        SELECT si.file_path
        FROM service_images si
        WHERE si.service_id = vs.id AND NULLIF(si.file_path, '') IS NOT NULL
        ORDER BY si.is_featured DESC, si.sort_order ASC, si.id ASC
        LIMIT 1
      ) AS uploaded_cover_image,
      COALESCE((
        SELECT si.file_path
        FROM service_images si
        WHERE si.service_id = vs.id AND NULLIF(si.file_path, '') IS NOT NULL
        ORDER BY si.is_featured DESC, si.sort_order ASC, si.id ASC
        LIMIT 1
      ), ${categoryFallbackSql("vs")}) AS cover_image,
      COALESCE((
        SELECT si.file_path
        FROM service_images si
        WHERE si.service_id = vs.id AND NULLIF(si.file_path, '') IS NOT NULL
        ORDER BY si.is_featured DESC, si.sort_order ASC, si.id ASC
        LIMIT 1
      ), ${categoryFallbackSql("vs")}) AS image,
      (
        SELECT GROUP_CONCAT(si.file_path ORDER BY si.is_featured DESC, si.sort_order ASC, si.id ASC)
        FROM service_images si
        WHERE si.service_id = vs.id AND NULLIF(si.file_path, '') IS NOT NULL
      ) AS gallery
    FROM services vs
    LEFT JOIN vendors v ON v.id = vs.vendor_id
    WHERE ${where}
  `;
}

function categoryFallbackSql(alias = "vs") {
  return `
    CASE
      WHEN ${alias}.category = 'Gardens' THEN 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&h=820&q=82'
      WHEN ${alias}.category = 'Decoration' THEN 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&h=820&q=82'
      WHEN ${alias}.category = 'Photography' THEN 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&h=820&q=82'
      WHEN ${alias}.category = 'Caterers' THEN 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&h=820&q=82'
      WHEN ${alias}.category = 'Makeup Artists' THEN 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&h=820&q=82'
      WHEN ${alias}.category = 'Mehendi Artists' THEN 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&h=820&q=82'
      WHEN ${alias}.category = 'DJ Band' THEN 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&h=820&q=82'
      WHEN ${alias}.category = 'Car & Bus' THEN 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&h=820&q=82'
      ELSE 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&h=820&q=82'
    END
  `;
}

type PlannerInput = {
  eventType: string;
  city: string;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  requiredServices: string[];
  eventDate: string;
};

function normalizeValue(value: unknown) {
  return text(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
}

function parseMoney(value: unknown) {
  const raw = text(value).toLowerCase();
  const number = Number(raw.replace(/[^\d.]/g, ""));
  if (!number) return 0;
  if (raw.includes("crore") || raw.includes("cr")) return number * 10000000;
  if (raw.includes("lakh") || raw.includes("lac") || raw.includes(" l")) return number * 100000;
  if (raw.includes("k")) return number * 1000;
  return number;
}

function parseCapacityRange(value: unknown) {
  const numbers = text(value).match(/\d+/g)?.map(Number) || [];
  if (!numbers.length) return { min: 0, max: 0 };
  if (numbers.length === 1) return { min: 0, max: numbers[0] };
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

function cityFromLocation(value: unknown) {
  const parts = text(value).split(",").map((part) => part.trim()).filter(Boolean);
  return parts[parts.length - 1] || text(value);
}

function serviceRating(service: any) {
  return Number(service.rating || 4.7);
}

function budgetLabel(min: number, max: number) {
  const format = (value: number) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;
  return `${format(min)} - ${format(max)}`;
}

function parsePlannerInput(body: any): PlannerInput {
  const budgetMin = Number(body.budgetMin ?? body.budget_min ?? 0) || 0;
  const budgetMax = Number(body.budgetMax ?? body.budget_max ?? body.budget ?? 0) || 0;
  const requiredServices = Array.isArray(body.requiredServices)
    ? body.requiredServices.map(text).filter(Boolean)
    : String(body.required_services || body.services || "").split(",").map(text).filter(Boolean);
  return {
    eventType: text(body.eventType || body.event_type),
    city: text(body.city),
    guestCount: Number(body.guestCount || body.guest_count || 0),
    budgetMin,
    budgetMax,
    requiredServices,
    eventDate: text(body.eventDate || body.event_date)
  };
}

async function approvedPlannerServices(eventDate?: string) {
  const rows = await query<any>(
    `
    SELECT
      vs.*,
      v.business_name,
      v.full_name AS vendor_name,
      v.city AS vendor_city,
      COALESCE(AVG(sr.rating), AVG(r.rating), 4.7) AS rating,
      MAX(CASE WHEN a.available_date = ? THEN a.status ELSE NULL END) AS date_status
    FROM services vs
    LEFT JOIN vendors v ON v.id = vs.vendor_id
    LEFT JOIN service_reviews sr ON sr.service_id = vs.id AND sr.status = 'approved'
    LEFT JOIN reviews r ON r.service_id = vs.id AND r.status = 'approved'
    LEFT JOIN availability a ON a.service_id = vs.id
    WHERE vs.status = 'approved'
    GROUP BY vs.id
    ORDER BY vs.approved_at DESC, vs.created_at DESC
    `,
    [eventDate || null]
  );
  return rows;
}

function scorePlannerService(service: any, input: PlannerInput) {
  const serviceCategory = normalizeValue(service.category);
  const required = input.requiredServices.map(normalizeValue);
  const requestedCategory = required.includes(serviceCategory);
  const serviceCity = normalizeValue(service.location || service.vendor_city);
  const inputCity = normalizeValue(input.city);
  const cityMatch = !inputCity || serviceCity.includes(inputCity) || inputCity.includes(serviceCity);
  const price = parseMoney(service.price);
  const budgetMatch = !input.budgetMax || !price || price <= input.budgetMax;
  const capacity = parseCapacityRange(service.capacity);
  const capacityMatch = !input.guestCount || !capacity.max || input.guestCount <= capacity.max;
  const textAvailability = normalizeValue(service.availability);
  const dateStatus = normalizeValue(service.date_status);
  const availabilityMatch = dateStatus
    ? dateStatus === "available"
    : !/(blocked|booked|unavailable|sold out)/i.test(textAvailability);
  const rating = serviceRating(service);

  let score = 0;
  if (requestedCategory) score += 35;
  if (cityMatch) score += 20;
  if (budgetMatch) score += 18;
  if (capacityMatch) score += 15;
  if (availabilityMatch) score += 8;
  score += Math.min(4, Math.max(0, rating - 3.5) * 3);

  const reasons = [];
  if (!requestedCategory) reasons.push("Service category is not selected.");
  if (!cityMatch) reasons.push("Selected city has no approved vendor for this service.");
  if (!budgetMatch) reasons.push("Budget is lower than available packages.");
  if (!capacityMatch) reasons.push("Guest count exceeds venue capacity.");
  if (!availabilityMatch) reasons.push("Service is unavailable for the selected date.");

  return {
    id: service.id,
    serviceId: service.id,
    vendorId: service.vendor_id,
    serviceName: service.service_name,
    vendorName: service.business_name || service.vendor_name || "Royal Vivah Vendor",
    category: service.category,
    price,
    priceText: price ? `INR ${price.toLocaleString("en-IN")}` : text(service.price) || "On request",
    capacity: service.capacity || "On request",
    city: cityFromLocation(service.location || service.vendor_city),
    rating: Number(rating.toFixed(1)),
    availability: service.date_status || service.availability || "Available on request",
    matchPercentage: Math.max(0, Math.min(100, Math.round(score))),
    reasons,
    perfect: requestedCategory && cityMatch && budgetMatch && capacityMatch && availabilityMatch
  };
}

async function buildPlannerMatch(input: PlannerInput) {
  const services = await approvedPlannerServices(input.eventDate);
  const scored = services.map((service) => scorePlannerService(service, input));
  const requested = input.requiredServices.map(normalizeValue);
  const matches = scored
    .filter((service) => requested.includes(normalizeValue(service.category)) && service.matchPercentage >= 60)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
  const unavailableReasons = new Set<string>();

  if (!matches.length) {
    scored.forEach((service) => service.reasons.forEach((reason: string) => unavailableReasons.add(reason)));
  }

  const availableCities = Array.from(new Set(services.map((service) => cityFromLocation(service.location || service.vendor_city)).filter(Boolean)));
  const availablePrices = services.map((service) => parseMoney(service.price)).filter((price) => price > 0);
  const capacities = services.map((service) => parseCapacityRange(service.capacity).max).filter((value) => value > 0);
  const maxCapacity = capacities.length ? Math.max(...capacities) : 0;
  const maxPrice = availablePrices.length ? Math.max(...availablePrices) : 0;
  const minPrice = availablePrices.length ? Math.min(...availablePrices) : 0;
  const suggestions = [];

  if (input.budgetMax && maxPrice && input.budgetMax < minPrice) {
    suggestions.push({ label: "Suggested Budget", current: budgetLabel(input.budgetMin, input.budgetMax), suggested: budgetLabel(minPrice, maxPrice) });
  }
  if (input.guestCount && maxCapacity && input.guestCount > maxCapacity) {
    suggestions.push({ label: "Suggested Guests", current: String(input.guestCount), suggested: `${Math.max(1, maxCapacity - 100)}-${maxCapacity}` });
  }
  if (input.city && availableCities.length && !availableCities.some((city) => normalizeValue(city).includes(normalizeValue(input.city)))) {
    suggestions.push({ label: "Suggested City", current: input.city, suggested: availableCities[0] });
  }
  const missingCategories = input.requiredServices.filter((category) => !services.some((service) => normalizeValue(service.category) === normalizeValue(category)));
  if (missingCategories.length) {
    unavailableReasons.add("Required services unavailable.");
  }

  const overallScore = matches.length
    ? Math.round(matches.reduce((sum, service) => sum + service.matchPercentage, 0) / matches.length)
    : 0;
  const recommendedPackage = matches.length
    ? `${matches[0].city || "Royal Vivah"} ${input.eventType || "Event"} Plan`
    : "";

  return {
    matches,
    reasons: Array.from(unavailableReasons),
    suggestions,
    overallScore,
    recommendedPackage
  };
}

app.get("/health", (_req, res) => ok(res, { message: "Node API is running" }));

app.get("/api/health", (_req, res) => ok(res, { message: "Node API is running" }));

app.get("/api/planner/options", asyncHandler(async (_req, res) => {
  const [events, categories, cityRows, priceRows] = await Promise.all([
    query<any>("SELECT title FROM event_types WHERE status = 'active' ORDER BY sort_order ASC, title ASC"),
    query<any>("SELECT DISTINCT category FROM services WHERE status = 'approved' AND NULLIF(category, '') IS NOT NULL ORDER BY category ASC"),
    query<any>(`
      SELECT DISTINCT COALESCE(NULLIF(v.city, ''), NULLIF(s.location, '')) AS city
      FROM services s
      LEFT JOIN vendors v ON v.id = s.vendor_id
      WHERE s.status = 'approved'
      ORDER BY city ASC
    `),
    query<any>("SELECT price FROM services WHERE status = 'approved' AND NULLIF(price, '') IS NOT NULL")
  ]);

  const prices = priceRows.map((row) => parseMoney(row.price)).filter((price) => price > 0).sort((a, b) => a - b);
  const min = prices[0] || 0;
  const max = prices[prices.length - 1] || 0;
  const mid = prices.length ? prices[Math.floor(prices.length / 2)] : 0;
  const budgetRanges = prices.length
    ? [
      { label: `Up to INR ${mid.toLocaleString("en-IN")}`, min: 0, max: mid },
      { label: budgetLabel(Math.max(0, min), Math.max(mid, max)), min: Math.max(0, min), max: Math.max(mid, max) },
      { label: `INR ${max.toLocaleString("en-IN")}+`, min: max, max: max * 2 }
    ].filter((range, index, list) => list.findIndex((item) => item.label === range.label) === index)
    : [];

  return ok(res, {
    eventTypes: Array.from(new Set(events.map((event) => event.title).filter(Boolean))),
    cities: Array.from(new Set(cityRows.map((row) => cityFromLocation(row.city)).filter(Boolean))),
    serviceCategories: Array.from(new Set(categories.map((row) => row.category).filter(Boolean))),
    budgetRanges
  });
}));

app.post("/api/planner/match", asyncHandler(async (req, res) => {
  const input = parsePlannerInput(req.body || {});
  if (!input.eventType || !input.city || !input.guestCount || !input.budgetMax || !input.requiredServices.length) {
    return fail(res, 422, "Event type, city, guest count, budget and required services are required.");
  }
  const match = await buildPlannerMatch(input);
  return ok(res, match);
}));

app.post("/api/planner/book", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const input = parsePlannerInput(body);
  const selectedServiceIds = Array.isArray(body.selectedServiceIds)
    ? body.selectedServiceIds.map(Number).filter(Boolean)
    : [];
  if (!body.name || !body.mobile || !input.eventType || !input.eventDate || !input.city || !input.guestCount || !input.budgetMax) {
    return fail(res, 422, "Name, mobile, event details, budget and guest count are required.");
  }
  if (!selectedServiceIds.length) {
    return fail(res, 422, "Select at least one matched service before booking.");
  }

  const match = await buildPlannerMatch(input);
  const selectedMatches = match.matches.filter((service) => selectedServiceIds.includes(Number(service.serviceId)));
  if (!selectedMatches.length) {
    return fail(res, 422, "We could not validate the selected services. Please run matching again.");
  }

  const selectedServices = selectedMatches.map((service) => ({
    id: service.serviceId,
    vendorId: service.vendorId,
    serviceName: service.serviceName,
    vendorName: service.vendorName,
    category: service.category,
    matchPercentage: service.matchPercentage
  }));
  const bestService = selectedMatches[0];
  const notes = text(body.notes);
  const message = [
    `Selected services: ${selectedServices.map((service) => `${service.serviceName} (${service.matchPercentage}%)`).join(", ")}`,
    `Required services: ${input.requiredServices.join(", ")}`,
    `Match score: ${match.overallScore}%`,
    `Recommended package: ${match.recommendedPackage}`,
    notes ? `Notes: ${notes}` : ""
  ].filter(Boolean).join("\n");

  const [bookingResult] = await pool.execute<ResultSetHeader>(
    `
    INSERT INTO bookings
      (vendor_id, service_id, customer_name, customer_email, customer_phone, name, mobile, event_date, event_type, city, guest_count, selected_services, match_score, recommended_package, message, amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    [
      bestService.vendorId || null,
      bestService.serviceId || null,
      text(body.name),
      text(body.email) || null,
      text(body.mobile),
      text(body.name),
      text(body.mobile),
      input.eventDate,
      input.eventType,
      input.city,
      input.guestCount,
      JSON.stringify(selectedServices),
      match.overallScore,
      match.recommendedPackage,
      message,
      input.budgetMax
    ]
  );

  const [plannerResult] = await pool.execute<ResultSetHeader>(
    `
    INSERT INTO quick_planner_requests
      (name, mobile, email, event_type, event_date, guest_count, budget, city, required_services, recommended_services, notes, match_score, recommended_package, booking_id, lead_status, booking_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'pending')
    `,
    [
      text(body.name),
      text(body.mobile),
      text(body.email) || null,
      input.eventType,
      input.eventDate,
      input.guestCount,
      budgetLabel(input.budgetMin, input.budgetMax),
      input.city,
      JSON.stringify(input.requiredServices),
      JSON.stringify(selectedServices),
      notes,
      match.overallScore,
      match.recommendedPackage,
      bookingResult.insertId
    ]
  );

  await Promise.all(selectedMatches
    .filter((service) => service.vendorId)
    .map((service) => Promise.all([
      pool.execute(
        "INSERT INTO inquiries (vendor_id, service_id, name, email, mobile, event_date, event_type, guest_count, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')",
        [service.vendorId, service.serviceId, text(body.name), text(body.email) || null, text(body.mobile), input.eventDate, input.eventType, input.guestCount, message]
      ),
      pool.execute(
        "INSERT INTO notifications (recipient_type, recipient_id, title, message, link) VALUES ('vendor', ?, 'New Planner Inquiry', ?, ?)",
        [service.vendorId, `${text(body.name)} requested ${service.serviceName} for ${input.eventType} on ${input.eventDate}.`, "/vendor-dashboard/leads"]
      )
    ])));

  await pool.execute(
    "INSERT INTO notifications (recipient_type, recipient_id, title, message, link) VALUES ('admin', NULL, 'New Smart Planner Booking', ?, ?)",
    [`${text(body.name)} booked ${selectedServices.length} matched service(s).`, "/admin-planner-leads.html"]
  );

  return ok(res, {
    message: "Planner booking saved.",
    bookingId: `BKG-${bookingResult.insertId}`,
    id: bookingResult.insertId,
    plannerLeadId: plannerResult.insertId,
    matchScore: match.overallScore,
    recommendedPackage: match.recommendedPackage
  });
}));

app.post("/api/quick-planner", asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.mobile || !body.event_type || !body.city) {
    return fail(res, 422, "Name, mobile, event type and city are required.");
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `
    INSERT INTO quick_planner_requests (name, mobile, event_type, guest_count, budget, city)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      String(body.name).trim(),
      String(body.mobile).trim(),
      String(body.event_type).trim(),
      Number(body.guest_count || 0) || null,
      String(body.budget || "").trim(),
      String(body.city || "").trim()
    ]
  );

  return ok(res, { message: "Planner request saved.", id: result.insertId });
}));

app.post("/api/contact-inquiries", asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.mobile || !body.message) {
    return fail(res, 422, "Name, mobile and message are required.");
  }

  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO contact_inquiries (name, mobile, email, message) VALUES (?, ?, ?, ?)",
    [String(body.name).trim(), String(body.mobile).trim(), body.email || null, String(body.message).trim()]
  );
  await pool.execute(
    "INSERT INTO contacts (name, email, phone, subject, message, source, status) VALUES (?, ?, ?, ?, ?, 'website', 'new')",
    [
      String(body.name).trim(),
      body.email || null,
      String(body.mobile).trim(),
      body.subject || "Website inquiry",
      String(body.message).trim()
    ]
  );

  return ok(res, { message: "Inquiry sent successfully.", id: result.insertId });
}));

app.get("/api/gallery", asyncHandler(async (_req, res) => {
  galleryLog("fetch:public:start", {});
  const categories = await query(
    "SELECT * FROM gallery_categories WHERE status = 'active' ORDER BY sort_order ASC, name ASC"
  );
  const images = await query(
    `
    SELECT gi.*, gc.name AS category_name, gc.slug AS category_slug, s.service_name
    FROM gallery_images gi
    INNER JOIN gallery_categories gc ON gc.id = gi.category_id
    LEFT JOIN services s ON s.id = gi.service_id
    WHERE gi.status = 'active' AND gc.status = 'active'
    ORDER BY gc.sort_order ASC, gi.sort_order ASC, gi.created_at DESC
    `
  );
  galleryLog("fetch:public:done", { categories: categories.length, images: images.length });
  return ok(res, { categories, images });
}));

app.get("/api/services/:slug/reviews", asyncHandler(async (req, res) => {
  const service = first<any>(await query("SELECT id FROM services WHERE slug = ? OR id = ? LIMIT 1", [req.params.slug, req.params.slug]));
  if (!service) return ok(res, { reviews: [] });
  const reviews = await query(
    "SELECT id, service_id, booking_id, customer_name, rating, review, created_at FROM service_reviews WHERE service_id = ? AND status = 'approved' ORDER BY created_at DESC",
    [service.id]
  );
  return ok(res, { reviews });
}));

app.post("/api/service-reviews", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const booking = first<any>(
    await query(
      "SELECT id, service_id, customer_name, status FROM bookings WHERE id = ? AND service_id = ? LIMIT 1",
      [body.booking_id, body.service_id]
    )
  );
  if (!booking || String(booking.status).toLowerCase() !== "completed") {
    return fail(res, 422, "Feedback is available only after this booking is completed.");
  }

  const rating = Math.min(5, Math.max(1, Number(body.rating || 5)));
  await pool.execute(
    `
    INSERT INTO service_reviews (service_id, booking_id, customer_name, rating, review)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE customer_name = VALUES(customer_name), rating = VALUES(rating), review = VALUES(review), status = 'pending'
    `,
    [body.service_id, body.booking_id, body.customer_name || booking.customer_name || "Customer", rating, body.review || ""]
  );
  return ok(res, { message: "Thank you. Your review was submitted for approval." });
}));

app.post("/api/vendors/register", vendorRegisterUpload, asyncHandler(async (req, res) => {
  const body = req.body;
  const password = String(body.password || "");
  const confirmPassword = String(body.confirm_password || body.confirmPassword || "");
  const required = ["full_name", "business_name", "email", "phone", "city"]
    .filter((key) => !requiredText(body, [key, key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())]));

  if (password.length < 8 || password !== confirmPassword) {
    return fail(res, 422, "Passwords must match and be at least 8 characters.");
  }
  if (required.length) {
    return fail(res, 422, "Full name, business name, email, phone and city are required.");
  }

  const profile = uploaded(req, "profile_image") || uploaded(req, "profileImage");
  const passwordHash = await bcrypt.hash(password, 12);

  const [vendorResult] = await pool.execute<ResultSetHeader>(
    `
    INSERT INTO vendors
      (full_name, business_name, email, phone, password_hash, city, profile_image, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    [
      requiredText(body, ["full_name", "fullName"]),
      requiredText(body, ["business_name", "businessName"]),
      requiredText(body, ["email"]).toLowerCase(),
      requiredText(body, ["phone"]),
      passwordHash,
      requiredText(body, ["city"]),
      publicPath(profile)
    ]
  );

  const vendorId = vendorResult.insertId;
  await pool.execute(
    "INSERT INTO vendor_profiles (vendor_id, profile_image, city) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE profile_image = VALUES(profile_image), city = VALUES(city)",
    [vendorId, publicPath(profile), requiredText(body, ["city"])]
  );

  return ok(res, { message: "Vendor registration submitted for admin approval.", vendorId, status: "pending" });
}));

app.post("/api/vendors/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const vendor = first<any>(await query("SELECT * FROM vendors WHERE email = ? LIMIT 1", [email]));
  if (!vendor || !(await bcrypt.compare(String(password || ""), vendor.password_hash || ""))) {
    return fail(res, 401, "Invalid vendor login.");
  }
  if (!["approved", "active"].includes(String(vendor.status || "").toLowerCase())) {
    return fail(res, 403, "Vendor account is pending admin approval.");
  }

  await pool.execute("UPDATE vendors SET last_login_at = NOW() WHERE id = ?", [vendor.id]);
  const token = signToken({ id: Number(vendor.id), role: "vendor", email: vendor.email });
  setAuthCookie(res, token);
  return ok(res, { message: "Vendor login successful.", token, vendor: { id: vendor.id, business_name: vendor.business_name, status: vendor.status } });
}));

app.post("/api/vendors/logout", (_req, res) => {
  clearAuthCookie(res);
  return ok(res, { message: "Logged out." });
});

app.post("/api/vendors/forgot-password", asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const vendor = first<any>(await query("SELECT id FROM vendors WHERE email = ? LIMIT 1", [email]));

  if (vendor) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    await pool.execute(
      "UPDATE vendors SET password_reset_token = ?, password_reset_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?",
      [resetHash, vendor.id]
    );
    return ok(res, { message: "Password reset link generated.", resetToken });
  }

  return ok(res, { message: "If the email exists, a reset link will be sent." });
}));

app.post("/api/vendors/reset-password", asyncHandler(async (req, res) => {
  const token = String(req.body?.token || "");
  const password = String(req.body?.password || "");
  const confirmPassword = String(req.body?.confirm_password || req.body?.confirmPassword || "");

  if (password.length < 8 || password !== confirmPassword) {
    return fail(res, 422, "Passwords must match and be at least 8 characters.");
  }

  const resetHash = crypto.createHash("sha256").update(token).digest("hex");
  const vendor = first<any>(
    await query(
      "SELECT id FROM vendors WHERE password_reset_token = ? AND password_reset_expires_at > NOW() LIMIT 1",
      [resetHash]
    )
  );

  if (!vendor) return fail(res, 422, "Reset link is invalid or expired.");

  await pool.execute(
    "UPDATE vendors SET password_hash = ?, password_reset_token = NULL, password_reset_expires_at = NULL WHERE id = ?",
    [await bcrypt.hash(password, 12), vendor.id]
  );

  return ok(res, { message: "Password updated. Please login." });
}));

app.get("/api/vendors/dashboard", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const vendorId = req.user!.id;
  const vendor = first(await query("SELECT id, full_name, business_name, email, phone, category, city, experience, description, profile_image, social_links, status FROM vendors WHERE id = ?", [vendorId]));
  const serviceCountsRows = await query<any>("SELECT status, COUNT(*) AS total FROM services WHERE vendor_id = ? GROUP BY status", [vendorId]);
  const serviceCounts = Object.fromEntries(serviceCountsRows.map((row) => [row.status, Number(row.total)]));
  const bookings = first<any>(await query("SELECT COUNT(*) AS total, COALESCE(SUM(amount), 0) AS revenue FROM bookings WHERE vendor_id = ?", [vendorId]));
  const leads = first<any>(await query("SELECT COUNT(*) AS total FROM inquiries WHERE vendor_id = ?", [vendorId]));
  return ok(res, { vendor, serviceCounts, bookings, leads });
}));

app.get("/api/vendors/services", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const services = await query(`${serviceSelect("vs.vendor_id = ?")} ORDER BY vs.created_at DESC`, [req.user!.id]);
  return ok(res, { services });
}));

app.post("/api/vendors/services", requireAuth("vendor"), serviceUpload.array("images[]", 30), asyncHandler(async (req, res) => {
  const body = req.body;
  const { payload, missing } = requireServicePayload(body);
  if (missing.length) return fail(res, 422, `${missing.join(", ")} required.`);
  const slug = await uniqueSlug(`${payload.serviceName}-${req.user!.id}`);
  const [result] = await pool.execute<ResultSetHeader>(
    `
    INSERT INTO services
      (vendor_id, service_name, slug, category, price, description, features, capacity, location, availability, contact_details, whatsapp_number, video_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    [
      req.user!.id,
      payload.serviceName,
      slug,
      payload.category,
      payload.price,
      payload.description,
      JSON.stringify(listFromText(body.features)),
      payload.capacity,
      payload.location,
      payload.availability,
      payload.contactDetails,
      payload.whatsappNumber,
      payload.videoUrl || null
    ]
  );
  await syncLegacyServiceName(result.insertId, payload.serviceName);

  await Promise.all(
    ((req.files as Express.Multer.File[]) || []).map((file, index) =>
      pool.execute(
        "INSERT IGNORE INTO service_images (service_id, file_path, alt_text, sort_order, is_featured) VALUES (?, ?, ?, ?, ?)",
        [result.insertId, publicPath(file), payload.serviceName, index, index === 0]
      )
    )
  );

  return ok(res, { message: "Service submitted for approval.", serviceId: result.insertId });
}));

app.put("/api/vendors/services/:id", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const body = req.body;
  const { payload, missing } = requireServicePayload(body);
  if (missing.length) return fail(res, 422, `${missing.join(", ")} required.`);
  await pool.execute(
    `
    UPDATE services
    SET service_name = ?, category = ?, price = ?, description = ?, features = ?, capacity = ?, location = ?, availability = ?, contact_details = ?, whatsapp_number = ?, video_url = ?
    WHERE id = ? AND vendor_id = ?
    `,
    [
      payload.serviceName,
      payload.category,
      payload.price,
      payload.description,
      JSON.stringify(listFromText(body.features)),
      payload.capacity,
      payload.location,
      payload.availability,
      payload.contactDetails,
      payload.whatsappNumber,
      payload.videoUrl || null,
      req.params.id,
      req.user!.id
    ]
  );
  await syncLegacyServiceName(req.params.id, payload.serviceName);
  return ok(res, { message: "Service updated." });
}));

app.delete("/api/vendors/services/:id", requireAuth("vendor"), asyncHandler(async (req, res) => {
  await pool.execute("DELETE FROM services WHERE id = ? AND vendor_id = ?", [req.params.id, req.user!.id]);
  return ok(res, { message: "Service deleted." });
}));

app.get("/api/vendors/bookings", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const bookings = await query(
    `
    SELECT b.*, vs.service_name
    FROM bookings b
    LEFT JOIN services vs ON vs.id = b.service_id
    WHERE b.vendor_id = ?
    ORDER BY b.created_at DESC
    `,
    [req.user!.id]
  );
  return ok(res, { bookings });
}));

app.patch("/api/vendors/bookings/:id", requireAuth("vendor"), asyncHandler(async (req, res) => {
  await pool.execute("UPDATE bookings SET status = ? WHERE id = ? AND vendor_id = ?", [req.body.status, req.params.id, req.user!.id]);
  return ok(res, { message: "Booking status updated." });
}));

app.get("/api/vendors/leads", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const inquiries = await query(
    `
    SELECT vi.*, vs.service_name
    FROM inquiries vi
    LEFT JOIN services vs ON vs.id = vi.service_id
    WHERE vi.vendor_id = ?
    ORDER BY vi.created_at DESC
    `,
    [req.user!.id]
  );
  return ok(res, { inquiries });
}));

app.get("/api/vendors/reviews", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const reviews = await query(
    `
    SELECT sr.*, s.service_name
    FROM service_reviews sr
    INNER JOIN services s ON s.id = sr.service_id
    WHERE s.vendor_id = ?
    ORDER BY sr.created_at DESC
    `,
    [req.user!.id]
  );
  return ok(res, { reviews });
}));

app.get("/api/vendors/availability", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const serviceId = req.query.service_id;
  if (!serviceId) return ok(res, { availability: [] });
  const rows = await query(
    `
    SELECT sa.*
    FROM availability sa
    INNER JOIN services vs ON vs.id = sa.service_id
    WHERE sa.service_id = ? AND vs.vendor_id = ?
    ORDER BY sa.available_date ASC
    `,
    [serviceId, req.user!.id]
  );
  return ok(res, { availability: rows });
}));

// Public endpoint: availability by venue slug (aggregates availability from services with same slug)
app.get("/api/venues/:slug/availability", asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  if (!slug) return ok(res, { availability: [] });
  const rows = await query(
    `
    SELECT a.available_date, a.status
    FROM availability a
    INNER JOIN services s ON s.id = a.service_id
    WHERE s.slug = ?
    ORDER BY a.available_date ASC
    `,
    [slug]
  );
  return ok(res, { availability: rows });
}));

app.post("/api/vendors/availability", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const { service_id, available_date, status } = req.body;
  await pool.execute(
    `
    INSERT INTO availability (service_id, available_date, status)
    SELECT ?, ?, ? FROM services WHERE id = ? AND vendor_id = ?
    ON DUPLICATE KEY UPDATE status = VALUES(status)
    `,
    [service_id, available_date, status || "available", service_id, req.user!.id]
  );
  return ok(res, { message: "Availability saved." });
}));

app.put("/api/vendors/profile", requireAuth("vendor"), vendorUpload.single("profile_image"), asyncHandler(async (req, res) => {
  const body = req.body;
  const image = publicPath(req.file);
  const social = JSON.stringify({ instagram: body.instagram || "", facebook: body.facebook || "", website: body.website || "" });
  await pool.execute(
    `
    UPDATE vendors
    SET business_name = ?, email = ?, phone = ?, city = ?, social_links = ?, profile_image = COALESCE(NULLIF(?, ''), profile_image)
    WHERE id = ?
    `,
    [body.business_name, body.email, body.phone, body.city, social, image, req.user!.id]
  );
  await pool.execute(
    `
    INSERT INTO vendor_profiles (vendor_id, profile_image, city, website, instagram, facebook)
    VALUES (?, NULLIF(?, ''), ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      profile_image = COALESCE(VALUES(profile_image), profile_image),
      city = VALUES(city),
      website = VALUES(website),
      instagram = VALUES(instagram),
      facebook = VALUES(facebook)
    `,
    [req.user!.id, image, body.city, body.website || "", body.instagram || "", body.facebook || ""]
  );
  return ok(res, { message: "Profile updated." });
}));

app.get("/api/vendors/services/:id/images", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const images = await query(
    `
    SELECT si.*
    FROM service_images si
    INNER JOIN services vs ON vs.id = si.service_id
    WHERE si.service_id = ? AND vs.vendor_id = ?
    ORDER BY si.is_featured DESC, si.sort_order ASC, si.id ASC
    `,
    [req.params.id, req.user!.id]
  );
  return ok(res, { images });
}));

app.post("/api/vendors/services/:id/images", requireAuth("vendor"), serviceUpload.array("images[]", 30), asyncHandler(async (req, res) => {
  const ownership = await query("SELECT id FROM services WHERE id = ? AND vendor_id = ? LIMIT 1", [req.params.id, req.user!.id]);
  if (!ownership.length) return fail(res, 404, "Service not found.");
  await Promise.all(
    ((req.files as Express.Multer.File[]) || []).map((file, index) =>
      pool.execute(
        "INSERT IGNORE INTO service_images (service_id, file_path, alt_text, sort_order, is_featured) VALUES (?, ?, '', ?, false)",
        [req.params.id, publicPath(file), index]
      )
    )
  );
  return ok(res, { message: "Images uploaded." });
}));

app.patch("/api/vendors/images/:id/featured", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const rows = await query<any>(
    "SELECT si.service_id FROM service_images si INNER JOIN services vs ON vs.id = si.service_id WHERE si.id = ? AND vs.vendor_id = ? LIMIT 1",
    [req.params.id, req.user!.id]
  );
  if (!rows.length) return fail(res, 404, "Image not found.");
  await pool.execute("UPDATE service_images SET is_featured = false WHERE service_id = ?", [rows[0].service_id]);
  await pool.execute("UPDATE service_images SET is_featured = true WHERE id = ?", [req.params.id]);
  return ok(res, { message: "Featured image updated." });
}));

app.delete("/api/vendors/images/:id", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const image = first<any>(await query(
    "SELECT si.file_path FROM service_images si INNER JOIN services vs ON vs.id = si.service_id WHERE si.id = ? AND vs.vendor_id = ? LIMIT 1",
    [req.params.id, req.user!.id]
  ));
  await pool.execute(
    "DELETE si FROM service_images si INNER JOIN services vs ON vs.id = si.service_id WHERE si.id = ? AND vs.vendor_id = ?",
    [req.params.id, req.user!.id]
  );
  removeLocalUpload(image?.file_path);
  return ok(res, { message: "Image deleted." });
}));

app.patch("/api/vendors/services/:id/images/order", requireAuth("vendor"), asyncHandler(async (req, res) => {
  const order = Array.isArray(req.body.order) ? req.body.order : JSON.parse(String(req.body.order || "[]"));
  await Promise.all(
    order.map((imageId: string, index: number) =>
      pool.execute(
        "UPDATE service_images si INNER JOIN services vs ON vs.id = si.service_id SET si.sort_order = ? WHERE si.id = ? AND vs.vendor_id = ?",
        [index, imageId, req.user!.id]
      )
    )
  );
  return ok(res, { message: "Image order updated." });
}));

app.get("/api/services", asyncHandler(async (req, res) => {
  const conditions = ["vs.status = 'approved'"];
  const params: unknown[] = [];
  if (req.query.category) {
    conditions.push("vs.category = ?");
    params.push(req.query.category);
  }
  const limit = Math.min(Number(req.query.limit || 100), 100);
  const services = await query(`${serviceSelect(conditions.join(" AND "))} ORDER BY vs.created_at DESC LIMIT ${limit}`, params);
  return ok(res, { services });
}));

app.get("/api/services/:slug", asyncHandler(async (req, res) => {
  const service = first(await query(`${serviceSelect("(vs.slug = ? OR vs.id = ?) AND vs.status = 'approved'")} LIMIT 1`, [req.params.slug, req.params.slug]));
  if (!service) return fail(res, 404, "Service not found.");
  return ok(res, { service });
}));

async function insertAdminService(body: any, categoryOverride?: string) {
  const serviceName = String(body.name || body.service_name || categoryOverride || "Royal Vivah Service").trim();
  const category = String(categoryOverride || body.category || serviceName || "Wedding Services").trim();
  const slug = await uniqueSlug(`${serviceName}-${Date.now()}`);
  const [result] = await pool.execute<ResultSetHeader>(
    `
    INSERT INTO services
      (slug, service_name, category, price, description, features, capacity, location, availability, contact_details, whatsapp_number, video_url, status, approved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', NOW())
    `,
    [
      slug,
      serviceName,
      category,
      String(body.price || body.pricing || "0").replace(/[^\d.]/g, "") || "0",
      body.description || "",
      JSON.stringify(Array.isArray(body.features) ? body.features : listFromText(body.features)),
      body.capacity || "",
      body.location || body.city || "Jaipur",
      body.availability || (body.available === false ? "Blocked" : "Available on request"),
      body.contact_details || body.phone || "",
      body.whatsapp_number || body.phone || "",
      body.video_url || null
    ]
  );
  await syncLegacyServiceName(result.insertId, serviceName);

  const images = Array.isArray(body.images) ? body.images : [body.image].filter(Boolean);
  await Promise.all(
    images
      .filter((image: string) => image && !String(image).startsWith("data:"))
      .map((image: string, index: number) =>
        pool.execute(
          "INSERT IGNORE INTO service_images (service_id, file_path, alt_text, sort_order, is_featured) VALUES (?, ?, ?, ?, ?)",
          [result.insertId, image, serviceName, index, index === 0]
        )
      )
  );

  return { id: result.insertId, slug };
}

app.post("/admin-data/services", asyncHandler(async (req, res) => {
  const service = await insertAdminService(req.body || {});
  return ok(res, { message: "Admin service saved.", service });
}));

app.post("/admin-data/gardens", asyncHandler(async (req, res) => {
  const service = await insertAdminService(req.body || {}, "Gardens");
  return ok(res, { message: "Garden saved as approved service.", service });
}));

app.post("/admin-data/gallery", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const image = String(body.image || body.url || "");
  if (!image || image.startsWith("data:")) {
    return fail(res, 422, "Use the gallery upload form for local files.");
  }
  const categoryName = String(body.category || "Wedding Gallery");
  const category = first<any>(await query("SELECT id FROM gallery_categories WHERE name = ? OR slug = ? LIMIT 1", [categoryName, slugify(categoryName)]));
  const categoryId = category?.id || 1;
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO gallery_images (category_id, title, image_url, alt_text) VALUES (?, ?, ?, ?)",
    [categoryId, body.title || categoryName, image, body.alt_text || body.title || categoryName]
  );
  return ok(res, { message: "Gallery image saved.", id: result.insertId });
}));

app.post("/api/bookings", asyncHandler(async (req, res) => {
  const body = req.body;
  if (body.action === "contact") {
    await pool.execute(
      `
      INSERT INTO users (name, email, phone, status)
      VALUES (?, ?, ?, 'active')
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        phone = VALUES(phone),
        updated_at = CURRENT_TIMESTAMP
      `,
      [body.name || "Website Visitor", body.email || null, body.phone || body.mobile || ""]
    );
    await pool.execute(
      "INSERT INTO contacts (name, email, phone, subject, message, source, status) VALUES (?, ?, ?, ?, ?, ?, 'new')",
      [
        body.name || "Website Visitor",
        body.email || null,
        body.phone || body.mobile || "",
        body.subject || "Website inquiry",
        body.message || "",
        body.source || "website"
      ]
    );
    return ok(res, { message: "Inquiry saved." });
  }

  const serviceId = body.serviceId || body.service_id || null;
  let vendorId = body.vendorId || body.vendor_id || null;
  if (serviceId && !vendorId) {
    const service = first<any>(await query("SELECT vendor_id FROM services WHERE id = ? LIMIT 1", [serviceId]));
    vendorId = service?.vendor_id || null;
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `
    INSERT INTO bookings
      (vendor_id, service_id, customer_name, customer_email, customer_phone, event_date, event_type, city, guest_count, selected_services, match_score, recommended_package, message, amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    [
      vendorId,
      serviceId,
      body.customer_name || body.name,
      body.customer_email || body.email || null,
      body.customer_phone || body.phone || body.mobile,
      body.event_date || body.eventDate || body.bookingDate || new Date().toISOString().slice(0, 10),
      body.event_type || body.eventType || "Wedding",
      body.city || body.location || body.gardenAddress || null,
      Number(body.guest_count || body.guestCount || 0) || null,
      body.selectedServices ? JSON.stringify(body.selectedServices) : body.selected_services || null,
      Number(body.matchScore || body.match_score || 0) || null,
      body.recommendedPackage || body.recommended_package || null,
      body.message || body.specialRequirements || body.additionalRequirements || "",
      Number(body.amount || body.budget || 0) || null
    ]
  );

  if (vendorId) {
    await pool.execute(
      "INSERT INTO inquiries (vendor_id, service_id, name, email, mobile, event_date, event_type, guest_count, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')",
      [
        vendorId,
        serviceId,
        body.customer_name || body.name,
        body.customer_email || body.email || null,
        body.customer_phone || body.phone || body.mobile,
        body.event_date || body.eventDate || body.bookingDate || null,
        body.event_type || body.eventType || "Wedding",
        Number(body.guest_count || body.guestCount || 0) || null,
        body.message || body.specialRequirements || body.additionalRequirements || ""
      ]
    );
  }

  return ok(res, { message: "Booking request submitted.", bookingId: `BKG-${result.insertId}`, id: result.insertId });
}));

app.get("/api/admin/vendors", asyncHandler(async (req, res) => {
  const params: unknown[] = [];
  const conditions: string[] = [];
  if (req.query.status) {
    conditions.push("status = ?");
    params.push(req.query.status);
  }
  const vendors = await query(`SELECT id, full_name, business_name, email, phone, category, city, experience, description, profile_image, status, created_at FROM vendors ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""} ORDER BY created_at DESC`, params);
  return ok(res, { vendors });
}));

app.patch("/api/admin/vendors/:id", asyncHandler(async (req, res) => {
  const status = text(req.body.status || "approved").toLowerCase();
  if (!["pending", "approved", "rejected", "suspended", "active"].includes(status)) {
    return fail(res, 422, "Invalid vendor status.");
  }
  await pool.execute("UPDATE vendors SET status = ? WHERE id = ?", [status, req.params.id]);
  const vendor = first<any>(await query("SELECT id, full_name, business_name, email, phone, category, city, experience, description, profile_image, status, created_at FROM vendors WHERE id = ? LIMIT 1", [req.params.id]));
  return ok(res, { message: "Vendor status updated.", vendor });
}));

app.get("/api/admin/services", asyncHandler(async (req, res) => {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (req.query.status) {
    conditions.push("vs.status = ?");
    params.push(req.query.status);
  }
  const services = await query(`${serviceSelect(conditions.length ? conditions.join(" AND ") : "1=1")} ORDER BY vs.created_at DESC`, params);
  return ok(res, { services });
}));

app.patch("/api/admin/services/:id", asyncHandler(async (req, res) => {
  const status = text(req.body.status || "approved").toLowerCase();
  if (!["pending", "approved", "rejected", "suspended"].includes(status)) {
    return fail(res, 422, "Invalid service status.");
  }
  await pool.execute(
    "UPDATE services SET status = ?, rejection_reason = ?, approved_at = IF(? = 'approved', NOW(), approved_at) WHERE id = ?",
    [status, req.body.reason || null, status, req.params.id]
  );
  const service = first<any>(await query(`${serviceSelect("vs.id = ?")} LIMIT 1`, [req.params.id]));
  return ok(res, { message: "Service status updated.", service });
}));

app.delete("/api/admin/services/:id", asyncHandler(async (req, res) => {
  const service = first<any>(await query("SELECT id FROM services WHERE id = ? LIMIT 1", [req.params.id]));
  if (!service) return fail(res, 404, "Service not found.");
  await pool.execute("DELETE FROM services WHERE id = ?", [req.params.id]);
  return ok(res, { message: "Service deleted." });
}));

app.get("/api/admin/bookings", asyncHandler(async (_req, res) => {
  const bookings = await query(
    `
    SELECT b.*, vs.service_name, v.business_name
    FROM bookings b
    LEFT JOIN services vs ON vs.id = b.service_id
    LEFT JOIN vendors v ON v.id = b.vendor_id
    ORDER BY b.created_at DESC
    `
  );
  return ok(res, { bookings });
}));

app.get("/api/admin/users", asyncHandler(async (_req, res) => {
  const users = await query("SELECT id, name, email, phone, status, created_at FROM users ORDER BY created_at DESC");
  return ok(res, { users, contacts: users });
}));

app.get("/api/admin/analytics", asyncHandler(async (_req, res) => {
  const [vendors, services, bookings, users] = await Promise.all([
    query<any>("SELECT COUNT(*) total FROM vendors"),
    query<any>("SELECT COUNT(*) total FROM services"),
    query<any>("SELECT COUNT(*) total, COALESCE(SUM(amount), 0) revenue FROM bookings"),
    query<any>("SELECT COUNT(*) total FROM users")
  ]);
  return ok(res, { analytics: { vendors: vendors[0], services: services[0], bookings: bookings[0], users: users[0] } });
}));

app.get("/api/admin/dashboard", asyncHandler(async (_req, res) => {
  const [vendorCount, serviceCount, bookings, users, planner, contacts, reviewCount, vendors, services, gallery, reviews] = await Promise.all([
    query<any>("SELECT COUNT(*) total FROM vendors"),
    query<any>("SELECT COUNT(*) total FROM services"),
    query<any>("SELECT COUNT(*) total, COALESCE(SUM(amount), 0) revenue FROM bookings"),
    query<any>("SELECT COUNT(*) total FROM users"),
    query<any>("SELECT COUNT(*) total FROM quick_planner_requests"),
    query<any>("SELECT (SELECT COUNT(*) FROM contact_inquiries) + (SELECT COUNT(*) FROM contacts) total"),
    query<any>("SELECT (SELECT COUNT(*) FROM service_reviews) + (SELECT COUNT(*) FROM reviews) total"),
    query("SELECT id, full_name, business_name, email, phone, category, city, experience, description, profile_image, status, created_at FROM vendors ORDER BY created_at DESC LIMIT 100"),
    query(`${serviceSelect("1=1")} ORDER BY FIELD(vs.status, 'pending', 'approved', 'rejected', 'suspended'), vs.created_at DESC LIMIT 100`),
    query(
      `
      SELECT gi.id, gi.title, gi.image_url AS url, gi.image_url AS image, gc.name AS category, s.service_name
      FROM gallery_images gi
      LEFT JOIN gallery_categories gc ON gc.id = gi.category_id
      LEFT JOIN services s ON s.id = gi.service_id
      ORDER BY gi.created_at DESC
      LIMIT 100
      `
    ),
    query(
      `
      SELECT sr.*, sr.customer_name AS name, sr.review AS feedback, s.service_name, v.business_name
      FROM service_reviews sr
      LEFT JOIN services s ON s.id = sr.service_id
      LEFT JOIN vendors v ON v.id = s.vendor_id
      ORDER BY sr.created_at DESC
      LIMIT 100
      `
    )
  ]);
  return ok(res, {
    metrics: {
      vendors: Number(vendorCount[0]?.total || 0),
      services: Number(serviceCount[0]?.total || 0),
      bookings: Number(bookings[0]?.total || 0),
      users: Number(users[0]?.total || 0),
      planner: Number(planner[0]?.total || 0),
      contacts: Number(contacts[0]?.total || 0),
      reviews: Number(reviewCount[0]?.total || 0),
      revenue: Number(bookings[0]?.revenue || 0)
    },
    vendors,
    pendingVendors: (vendors as any[]).filter((vendor) => vendor.status === "pending"),
    approvedVendors: (vendors as any[]).filter((vendor) => ["approved", "active"].includes(vendor.status)),
    gardens: (services as any[]).filter((service) => service.category === "Gardens"),
    services,
    pendingServices: (services as any[]).filter((service) => service.status === "pending"),
    approvedServices: (services as any[]).filter((service) => service.status === "approved"),
    rejectedServices: (services as any[]).filter((service) => service.status === "rejected"),
    gallery,
    reviews
  });
}));

app.get("/api/admin/payments", asyncHandler(async (_req, res) => {
  const payments = await query(`
    SELECT p.*, b.customer_name, b.customer_email
    FROM payments p
    LEFT JOIN bookings b ON b.id = p.booking_id
    ORDER BY p.created_at DESC
  `);
  return ok(res, { payments });
}));

app.get("/api/admin/inquiries", asyncHandler(async (_req, res) => {
  const inquiries = await query(
    `
    SELECT i.*, s.service_name, v.business_name
    FROM inquiries i
    LEFT JOIN services s ON s.id = i.service_id
    LEFT JOIN vendors v ON v.id = i.vendor_id
    ORDER BY i.created_at DESC
    `
  );
  return ok(res, { inquiries });
}));

app.get("/api/admin/quick-planner", asyncHandler(async (_req, res) => {
  const leads = await query("SELECT * FROM quick_planner_requests ORDER BY created_at DESC");
  return ok(res, { leads });
}));

app.get("/api/admin/contact-inquiries", asyncHandler(async (_req, res) => {
  const inquiries = await query(`
    SELECT id, name, email, mobile, NULL AS phone, message, status, created_at, 'contact_inquiries' AS source_table
    FROM contact_inquiries
    UNION ALL
    SELECT id, name, email, NULL AS mobile, phone, message, status, created_at, 'contacts' AS source_table
    FROM contacts
    ORDER BY created_at DESC
  `);
  return ok(res, { inquiries });
}));

app.patch("/api/admin/contact-inquiries/:source/:id", asyncHandler(async (req, res) => {
  const source = String(req.params.source || "");
  const status = text(req.body.status || "closed").toLowerCase();
  if (!["new", "contacted", "closed", "resolved"].includes(status)) {
    return fail(res, 422, "Invalid contact status.");
  }
  if (source === "contacts") {
    await pool.execute("UPDATE contacts SET status = ?, is_read = TRUE WHERE id = ?", [status === "resolved" ? "closed" : status, req.params.id]);
  } else if (source === "contact_inquiries") {
    await pool.execute("UPDATE contact_inquiries SET status = ? WHERE id = ?", [status === "resolved" ? "closed" : status, req.params.id]);
  } else {
    return fail(res, 422, "Invalid contact source.");
  }
  return ok(res, { message: "Contact updated." });
}));

app.get("/api/admin/reviews", asyncHandler(async (_req, res) => {
  const reviews = await query(`
    SELECT
      id,
      'service_reviews' AS source_table,
      service_id,
      booking_id,
      customer_name,
      rating,
      review AS feedback,
      status,
      created_at
    FROM service_reviews
    UNION ALL
    SELECT
      id,
      'reviews' AS source_table,
      service_id,
      NULL AS booking_id,
      customer_name,
      rating,
      feedback,
      status,
      created_at
    FROM reviews
    ORDER BY created_at DESC
  `);
  return ok(res, { reviews });
}));

app.patch("/api/admin/reviews/:source/:id", asyncHandler(async (req, res) => {
  const source = String(req.params.source || "");
  const status = text(req.body.status || "approved").toLowerCase();
  if (!["pending", "approved", "rejected"].includes(status)) {
    return fail(res, 422, "Invalid review status.");
  }
  if (source === "service_reviews") {
    await pool.execute("UPDATE service_reviews SET status = ? WHERE id = ?", [status, req.params.id]);
  } else if (source === "reviews") {
    await pool.execute("UPDATE reviews SET status = ? WHERE id = ?", [status, req.params.id]);
  } else {
    return fail(res, 422, "Invalid review source.");
  }
  return ok(res, { message: "Review updated." });
}));

app.get("/api/admin/service-reviews", asyncHandler(async (_req, res) => {
  const reviews = await query(
    `
    SELECT sr.*, s.service_name, v.business_name
    FROM service_reviews sr
    LEFT JOIN services s ON s.id = sr.service_id
    LEFT JOIN vendors v ON v.id = s.vendor_id
    ORDER BY sr.created_at DESC
    `
  );
  return ok(res, { reviews });
}));

app.patch("/api/admin/service-reviews/:id", asyncHandler(async (req, res) => {
  await pool.execute("UPDATE service_reviews SET status = ? WHERE id = ?", [req.body.status || "approved", req.params.id]);
  return ok(res, { message: "Review status updated." });
}));

app.get("/api/admin/gallery", asyncHandler(async (_req, res) => {
  galleryLog("fetch:admin:start", {});
  const [categories, images, services] = await Promise.all([
    query("SELECT * FROM gallery_categories ORDER BY sort_order ASC, name ASC"),
    query(
      `
      SELECT gi.*, gc.name AS category_name, gc.slug AS category_slug, s.service_name
      FROM gallery_images gi
      LEFT JOIN gallery_categories gc ON gc.id = gi.category_id
      LEFT JOIN services s ON s.id = gi.service_id
      ORDER BY gi.created_at DESC
      `
    ),
    query("SELECT id, service_name, category FROM services WHERE status = 'approved' ORDER BY category ASC, service_name ASC")
  ]);
  galleryLog("fetch:admin:done", { categories: categories.length, images: images.length, services: services.length });
  return ok(res, { categories, images, services });
}));

app.post("/api/admin/gallery/categories", asyncHandler(async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return fail(res, 422, "Category name is required.");
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO gallery_categories (name, slug, sort_order) VALUES (?, ?, ?)",
    [name, slugify(name), Number(req.body?.sort_order || 0)]
  );
  return ok(res, { message: "Gallery category added.", id: result.insertId });
}));

app.post("/api/admin/gallery/images", galleryUpload, asyncHandler(async (req, res) => {
  const categoryId = Number(req.body?.category_id || 0);
  const serviceId = Number(req.body?.service_id || 0) || null;
  const files = (req.files as Express.Multer.File[]) || [];
  const videoUrl = String(req.body?.video_url || "").trim() || null;

  galleryLog("upload:request", {
    categoryId,
    serviceId,
    title: req.body?.title || "",
    videoUrl,
    fileCount: files.length,
    files: files.map((file) => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      savedPath: file.path,
      publicPath: publicPath(file),
      exists: fs.existsSync(file.path)
    }))
  });

  if (!categoryId) return fail(res, 422, "Gallery category is required.");
  if (!files.length && !videoUrl) return fail(res, 422, "Upload at least one image or provide a video URL.");

  const inserts: Array<Record<string, unknown>> = [];

  if (videoUrl) {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO gallery_images (category_id, service_id, title, image_url, alt_text, video_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [categoryId, serviceId, req.body?.title || "", "", req.body?.alt_text || req.body?.title || "", videoUrl, 0]
    );
    galleryLog("insert:gallery_images", { id: result.insertId, categoryId, serviceId, videoUrl });
    inserts.push({ id: result.insertId, videoUrl });
  }

  if (files.length) {
    const photoInserts = await Promise.all(
      files.map(async (file, index) => {
        const imageUrl = publicPath(file);
        const [result] = await pool.execute<ResultSetHeader>(
          "INSERT INTO gallery_images (category_id, service_id, title, image_url, alt_text, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
          [categoryId, serviceId, req.body?.title || "", imageUrl, req.body?.alt_text || req.body?.title || "", index + (videoUrl ? 1 : 0)]
        );
        galleryLog("insert:gallery_images", { id: result.insertId, categoryId, serviceId, imageUrl, exists: fs.existsSync(file.path) });
        return { id: result.insertId, imageUrl };
      })
    );
    inserts.push(...photoInserts);
  }

  return ok(res, { message: "Gallery content uploaded.", items: inserts });
}));

app.delete("/api/admin/gallery/images/:id", asyncHandler(async (req, res) => {
  const image = first<any>(await query("SELECT image_url FROM gallery_images WHERE id = ? LIMIT 1", [req.params.id]));
  await pool.execute("DELETE FROM gallery_images WHERE id = ?", [req.params.id]);
  removeLocalUpload(image?.image_url);
  return ok(res, { message: "Gallery image deleted." });
}));

app.patch("/api/admin/gallery/images/:id", asyncHandler(async (req, res) => {
  const categoryId = Number(req.body?.category_id || 0) || null;
  const serviceId = Number(req.body?.service_id || 0) || null;
  const title = text(req.body?.title);
  const altText = text(req.body?.alt_text);
  const videoUrl = text(req.body?.video_url) || null;
  const status = text(req.body?.status || "active").toLowerCase();
  const sortOrder = Number(req.body?.sort_order || 0);
  if (!["active", "hidden", "inactive"].includes(status)) {
    return fail(res, 422, "Invalid gallery image status.");
  }
  if (categoryId) {
    await pool.execute(
      "UPDATE gallery_images SET category_id = ?, service_id = ?, title = ?, alt_text = ?, video_url = ?, sort_order = ?, status = ? WHERE id = ?",
      [categoryId, serviceId, title || null, altText || null, videoUrl, sortOrder, status, req.params.id]
    );
  } else {
    await pool.execute(
      "UPDATE gallery_images SET service_id = ?, title = ?, alt_text = ?, video_url = ?, sort_order = ?, status = ? WHERE id = ?",
      [serviceId, title || null, altText || null, videoUrl, sortOrder, status, req.params.id]
    );
  }
  return ok(res, { message: "Gallery item updated." });
}));

app.get("/api/vendors", asyncHandler(async (_req, res) => {
  const vendors = await query(
    `
    SELECT
      v.id,
      LOWER(REPLACE(REPLACE(v.business_name, '&', 'and'), ' ', '-')) AS slug,
      v.full_name,
      v.business_name,
      v.email,
      v.phone,
      v.city,
      v.profile_image,
      COUNT(s.id) AS service_count,
      MIN(s.category) AS primary_category,
      GROUP_CONCAT(DISTINCT s.category ORDER BY s.category SEPARATOR ', ') AS categories
    FROM vendors v
    INNER JOIN services s ON s.vendor_id = v.id AND s.status = 'approved'
    WHERE v.status IN ('active', 'approved')
    GROUP BY v.id
    ORDER BY v.business_name ASC
    `
  );
  return ok(res, { vendors });
}));

app.get("/api/vendors/:slug", asyncHandler(async (req, res) => {
  const vendor = first<any>(
    await query(
      `
      SELECT
        v.id,
        LOWER(REPLACE(REPLACE(v.business_name, '&', 'and'), ' ', '-')) AS slug,
        v.full_name,
        v.business_name,
        v.email,
        v.phone,
        v.city,
        v.profile_image,
        v.social_links,
        vp.bio,
        vp.address
      FROM vendors v
      LEFT JOIN vendor_profiles vp ON vp.vendor_id = v.id
      WHERE (v.id = ? OR LOWER(REPLACE(REPLACE(v.business_name, '&', 'and'), ' ', '-')) = ?)
        AND v.status IN ('active', 'approved')
      LIMIT 1
      `,
      [req.params.slug, req.params.slug]
    )
  );
  if (!vendor) return fail(res, 404, "Vendor not found.");

  const services = await query(`${serviceSelect("vs.vendor_id = ? AND vs.status = 'approved'")} ORDER BY vs.created_at DESC`, [vendor.id]);
  const gallery = await query(
    `
    SELECT si.*
    FROM service_images si
    INNER JOIN services s ON s.id = si.service_id
    WHERE s.vendor_id = ? AND s.status = 'approved'
    ORDER BY si.is_featured DESC, si.sort_order ASC, si.id ASC
    LIMIT 24
    `,
    [vendor.id]
  );
  const reviews = await query("SELECT * FROM reviews WHERE vendor_id = ? AND status = 'approved' ORDER BY created_at DESC", [vendor.id]);
  return ok(res, { vendor, services, gallery, reviews });
}));

app.get("/api/home", asyncHandler(async (_req, res) => {
  galleryLog("fetch:home:start", {});
  const [featuredVenues, gallery, testimonials, services, vendors, blog, events, stats, faqs] = await Promise.all([
    query(`${serviceSelect("vs.category = 'Gardens' AND vs.status = 'approved'")} ORDER BY vs.approved_at DESC, vs.created_at DESC LIMIT 6`),
    query(
      `
      SELECT gi.id, gi.title, gi.image_url AS url, gi.image_url AS image, gc.name AS category, s.service_name
      FROM gallery_images gi
      LEFT JOIN gallery_categories gc ON gc.id = gi.category_id
      LEFT JOIN services s ON s.id = gi.service_id
      WHERE gi.status = 'active'
      ORDER BY gi.created_at DESC
      LIMIT 12
      `
    ),
    query(
      `
      SELECT id, customer_name, review AS feedback, rating, created_at
      FROM service_reviews
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT 6
      `
    ),
    query(`${serviceSelect("vs.status = 'approved'")} ORDER BY vs.approved_at DESC, vs.created_at DESC LIMIT 8`),
    query("SELECT v.id, v.business_name, v.full_name, v.city, v.profile_image, COUNT(s.id) AS service_count FROM vendors v INNER JOIN services s ON s.vendor_id = v.id AND s.status = 'approved' GROUP BY v.id ORDER BY service_count DESC LIMIT 8"),
    query("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC, created_at DESC LIMIT 4"),
    query("SELECT * FROM event_types WHERE status = 'active' ORDER BY sort_order ASC, title ASC LIMIT 12"),
    query<any>("SELECT COUNT(*) AS services, COUNT(DISTINCT vendor_id) AS vendors, SUM(category = 'Gardens') AS venues FROM services WHERE status = 'approved'"),
    query("SELECT * FROM faqs WHERE status = 'active' ORDER BY sort_order ASC, id ASC LIMIT 12")
  ]);
  galleryLog("fetch:home:done", { gallery: gallery.length, featuredVenues: featuredVenues.length, services: services.length });
  return ok(res, {
    featuredVenues,
    gallery,
    testimonials,
    services,
    vendors,
    blog,
    events,
    statistics: stats[0] || { services: 0, vendors: 0, venues: 0 },
    faqs
  });
}));

app.get("/api/gardens", asyncHandler(async (req, res) => {
  const location = String(req.query.location || req.body?.location || "Jaipur");
  const services = await query<any>(
    `${serviceSelect("vs.category = 'Gardens' AND vs.status = 'approved'")} ORDER BY vs.created_at DESC LIMIT 12`
  );
  const gardens = services.map((service, index) => ({
    placeId: String(service.slug || service.id),
    name: service.service_name,
    address: service.location || location,
    rating: 4.7,
    userRatingsTotal: 80 + index * 12,
    distanceKm: index + 1,
    image: service.cover_image || "/og.svg",
    lat: 26.9124,
    lng: 75.7873,
    capacity: service.capacity || "200-800 guests",
    price: `INR ${Number(service.price || 0).toLocaleString("en-IN")}`,
    decorationIncluded: true,
    catering: "Optional",
    parking: "Available",
    indoorOutdoor: "Indoor + Outdoor",
    recommendedScore: 90 - index
  }));
  return ok(res, { origin: { lat: 26.9124, lng: 75.7873 }, gardens });
}));

app.post("/api/gardens", asyncHandler(async (req, res) => {
  req.query.location = req.body.location || "Jaipur";
  const services = await query<any>(
    `${serviceSelect("vs.category = 'Gardens' AND vs.status = 'approved'")} ORDER BY vs.created_at DESC LIMIT 12`
  );
  const gardens = services.map((service, index) => ({
    placeId: String(service.slug || service.id),
    name: service.service_name,
    address: service.location || req.body.location || "Jaipur",
    rating: 4.7,
    userRatingsTotal: 80 + index * 12,
    distanceKm: index + 1,
    image: service.cover_image || "/og.svg",
    lat: 26.9124,
    lng: 75.7873,
    capacity: service.capacity || "200-800 guests",
    price: `INR ${Number(service.price || 0).toLocaleString("en-IN")}`,
    decorationIncluded: true,
    catering: "Optional",
    parking: "Available",
    indoorOutdoor: "Indoor + Outdoor",
    recommendedScore: 90 - index
  }));
  return ok(res, { origin: { lat: 26.9124, lng: 75.7873 }, gardens });
}));

app.get("/api/gardens/:placeId", asyncHandler(async (req, res) => {
  const service = first<any>(
    await query(`${serviceSelect("vs.category = 'Gardens' AND vs.status = 'approved' AND (vs.slug = ? OR vs.id = ?)")} LIMIT 1`, [req.params.placeId, req.params.placeId])
  );
  if (!service) return fail(res, 404, "Garden not found.");
  const gallery = String(service.gallery || "")
    .split(",")
    .filter(Boolean);
  const image = service.cover_image || gallery[0] || "/og.svg";
  return ok(res, {
    garden: {
      placeId: String(service.slug || service.id),
      name: service.service_name,
      address: service.location,
      rating: 4.8,
      userRatingsTotal: 120,
      distanceKm: 2,
      image,
      lat: 26.9124,
      lng: 75.7873,
      capacity: service.capacity || "200-800 guests",
      price: `INR ${Number(service.price || 0).toLocaleString("en-IN")}`,
      decorationIncluded: true,
      catering: "Optional",
      parking: "Available",
      indoorOutdoor: "Indoor + Outdoor",
      recommendedScore: 92,
      mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(service.location || "Jaipur Rajasthan")}&output=embed`,
      gallery: gallery.length ? gallery : [image],
      ac: "AC banquet plus open lawn",
      nearbyHotels: ["Royal Orchid Stay - 1.4 km", "Vivah Residency - 2.8 km"],
      availableDates: [],
      reviews: [],
      vendors: []
    }
  });
}));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE"
      ? "Uploaded file is too large. Please upload files up to 12MB each."
      : err.message;
    return fail(res, 413, message);
  }
  return fail(res, 500, err?.message || "Server error");
});

async function start() {
  await ensureDatabase();
  await ensureDatabaseSchema();

  app.listen(port, () => {
    console.log(`Royal Vivah Node API running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start Node API", error);
  process.exit(1);
});
