import { cookies } from "next/headers";
import { verifySession, type SessionPayload } from "./session";

const SESSION_COOKIE = "ql_session";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

export async function requireAdmin(): Promise<Response | null> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (session.role !== "admin") {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  return null;
}
