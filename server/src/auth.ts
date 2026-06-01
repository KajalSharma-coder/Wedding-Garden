import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { fail } from "./http";

const secret = process.env.JWT_SECRET || "royal_booking_secret";
const isProduction = process.env.NODE_ENV === "production";

export type AuthUser = {
  id: number;
  role: "vendor" | "admin";
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function cookieValue(header: string | undefined, name: string) {
  if (!header) return "";
  const item = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : "";
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, secret, { expiresIn: "7d" });
}

export function setAuthCookie(res: Response, token: string, remember = true) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  } as Record<string, unknown>;

  if (remember) {
    cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
  }

  res.cookie("rvg_token", token, cookieOptions);
}

export function clearAuthCookie(res: Response) {
  res.clearCookie("rvg_token", { sameSite: "lax", secure: isProduction, path: "/" });
}

export function requireAuth(role?: AuthUser["role"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.header("authorization")?.replace(/^Bearer\s+/i, "");
    const token = bearer || cookieValue(req.header("cookie"), "rvg_token");

    if (!token) {
      return fail(res, 401, role === "admin" ? "Admin login required" : "Vendor login required");
    }

    try {
      const user = jwt.verify(token, secret) as AuthUser;
      if (role && user.role !== role) {
        return fail(res, 403, "Access denied");
      }
      req.user = user;
      next();
    } catch {
      return fail(res, 401, role === "admin" ? "Admin login required" : "Vendor login required");
    }
  };
}

