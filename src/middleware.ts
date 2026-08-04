import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("billora_token")?.value;

  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("billora_token");
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", String(payload.userId));
  requestHeaders.set("x-user-role", payload.username);
  requestHeaders.set("x-company-id", String(payload.companyId));

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
