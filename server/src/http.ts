import type { Response } from "express";

export function ok(res: Response, body: Record<string, unknown> = {}) {
  return res.json({ ok: true, message: "Success", ...body });
}

export function fail(res: Response, status: number, message: string, body: Record<string, unknown> = {}) {
  return res.status(status).json({ ok: false, message, ...body });
}

export function asyncHandler<T extends (...args: any[]) => Promise<any>>(handler: T) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

