import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "ql_session";
const SESSION_EXP_COOKIE = "ql_session_exp"; // JS readable (non-httpOnly)
const SESSION_DURATION = 30 * 60 * 1000;

export function proxy(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;

  if (!cookieValue) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const session = JSON.parse(atob(cookieValue)) as { userId: string; expiresAt: number };

    if (!session.userId || session.expiresAt <= Date.now()) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete(SESSION_COOKIE);
      res.cookies.delete(SESSION_EXP_COOKIE);
      return res;
    }

    const newExpiresAt = Date.now() + SESSION_DURATION;
    const refreshed = btoa(JSON.stringify({ userId: session.userId, expiresAt: newExpiresAt }));

    const res = NextResponse.next();
    res.cookies.set(SESSION_COOKIE, refreshed, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    // JS에서 읽을 수 있는 만료시간 쿠키 (SessionGuard용)
    res.cookies.set(SESSION_EXP_COOKIE, String(newExpiresAt), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return res;
  } catch {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete(SESSION_COOKIE);
    res.cookies.delete(SESSION_EXP_COOKIE);
    return res;
  }
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
