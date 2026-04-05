import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "../../../_lib/supabase";
import { signSession } from "../../../_lib/session";

const SESSION_COOKIE = "ql_session";
const SESSION_EXP_COOKIE = "ql_session_exp";
const SESSION_DURATION = 30 * 60 * 1000;

// Rate limiting: IP당 5회 실패 시 15분 차단
const attempts = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) return { allowed: true };
  if (entry.count >= 5) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    entry.count++;
  }
}

function clearFailures(ip: string): void {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: `시도 횟수 초과. ${retryAfter}초 후 다시 시도해주세요.` },
      { status: 429 },
    );
  }

  const { studentId, name } = await req.json();

  if (!studentId || !/^\d{10}$/.test(studentId)) {
    recordFailure(ip);
    return NextResponse.json({ error: "학번 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const trimmedName = (name ?? "").trim();
  if (!/^[가-힣a-zA-Z\s]{2,}$/.test(trimmedName)) {
    recordFailure(ip);
    return NextResponse.json({ error: "이름 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id, role, name")
    .eq("student_id", studentId)
    .maybeSingle();

  let userId: string;
  let role: string;

  if (existing) {
    // 기존 유저 — 이름 일치 검증
    if (existing.name !== trimmedName) {
      recordFailure(ip);
      return NextResponse.json({ error: "학번 또는 이름이 일치하지 않습니다." }, { status: 403 });
    }
    userId = existing.id;
    role = existing.role ?? "member";
  } else {
    // 신규 유저 — 자동 등록
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ student_id: studentId, name: trimmedName, role: "member" })
      .select("id, role")
      .single();

    if (insertError || !newUser) {
      return NextResponse.json({ error: "등록에 실패했습니다." }, { status: 500 });
    }
    userId = newUser.id;
    role = "member";
  }

  clearFailures(ip);

  const expiresAt = Date.now() + SESSION_DURATION;
  const sessionValue = await signSession({ userId, role, expiresAt });

  const cookieOpts = {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  const res = NextResponse.json({ userId, role });
  res.cookies.set(SESSION_COOKIE, sessionValue, { ...cookieOpts, httpOnly: true });
  res.cookies.set(SESSION_EXP_COOKIE, String(expiresAt), { ...cookieOpts, httpOnly: false });

  return res;
}
