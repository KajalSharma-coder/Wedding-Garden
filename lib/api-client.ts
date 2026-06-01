export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

export const SERVICE_API = `${API_BASE}/services`;
export const BOOKING_API = `${API_BASE}/bookings`;
export const VENDOR_REGISTER_API = `${API_BASE}/vendors/register`;
export const VENDOR_LOGIN_API = `${API_BASE}/vendors/login`;
export const VENDOR_FORGOT_PASSWORD_API = `${API_BASE}/vendors/forgot-password`;
export const VENDOR_RESET_PASSWORD_API = `${API_BASE}/vendors/reset-password`;

export function serviceApiUrl(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  return `${SERVICE_API}?${query.toString()}`;
}

export async function readJson(response: Response) {
  const text = await response.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const preview = text.replace(/\s+/g, " ").trim().slice(0, 180);
    throw new Error(
      preview
        ? `Backend returned a non-JSON response: ${preview}`
        : "Backend returned an empty non-JSON response."
    );
  }

  if (!response.ok || data?.ok === false) {
    throw new Error(
      data?.message || `Backend request failed with status ${response.status}.`
    );
  }

  return data;
}

export async function fetchJson(url: string, init: RequestInit = {}) {
  const opts: RequestInit = { credentials: "include", ...init };
  const res = await fetch(url, opts);
  return readJson(res);
}
