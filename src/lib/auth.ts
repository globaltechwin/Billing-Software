import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const TOKEN_NAME = "billora_token";
const TOKEN_EXPIRY = "24h";

export interface JwtPayload {
  userId: number;
  username: string;
  companyId: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string, secure: boolean) {
  const store = await cookies();
  store.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

// Only mark the cookie Secure when the request really arrived over HTTPS.
// Over plain HTTP (e.g. a phone hitting http://<lan-ip>:3000, which is not a
// secure context unlike desktop "localhost") a Secure cookie is silently
// rejected by browsers, which breaks the session after login.
export function shouldSecureCookie(request: NextRequest): boolean {
  return (
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

export async function removeAuthCookie() {
  const store = await cookies();
  store.set(TOKEN_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<JwtPayload | null> {
  const store = await cookies();
  const token = store.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
