export const dynamic = "force-dynamic";

export function GET() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
  const body = `window.RVG_API_BASE=${JSON.stringify(apiBase)};`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
