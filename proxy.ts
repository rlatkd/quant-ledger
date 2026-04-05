import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signSession, verifySession } from "./app/_lib/session";

const SESSION_COOKIE = "ql_session";
const SESSION_EXP_COOKIE = "ql_session_exp";
const SESSION_DURATION = 30 * 60 * 1000;

function redirectToLogin(request: NextRequest): NextResponse {
  const res = NextResponse.redirect(new URL("/login", request.url));
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(SESSION_EXP_COOKIE);
  return res;
}

export async function proxy(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
  const expCookie = request.cookies.get(SESSION_EXP_COOKIE)?.value;

  if (!cookieValue || !expCookie) return redirectToLogin(request);

  const session = await verifySession(cookieValue);

  if (!session || session.expiresAt <= Date.now()) {
    return redirectToLogin(request);
  }

  // [시연] 권한 제한 해제 — 원복 시 아래 주석 해제
  // const { pathname } = new URL(request.url);
  // if (pathname.endsWith("/edit") && session.role !== "admin") {
  //   return NextResponse.redirect(new URL("/receipts", request.url));
  // }

  const newExpiresAt = Date.now() + SESSION_DURATION;
  const refreshed = await signSession({ userId: session.userId, role: session.role, expiresAt: newExpiresAt });

  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  const res = NextResponse.next();
  res.cookies.set(SESSION_COOKIE, refreshed, cookieOpts);
  res.cookies.set(SESSION_EXP_COOKIE, String(newExpiresAt), {
    ...cookieOpts,
    httpOnly: false,
  });
  return res;
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png|apple-touch-icon\\.png|apple\\.svg|android\\.svg).*)"],
};
