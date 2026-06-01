export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function listFromText(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function first<T>(rows: T[]) {
  return rows[0] || null;
}

