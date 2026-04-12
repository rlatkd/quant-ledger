import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "../../../_lib/supabase";
import { signSession } from "../../../_lib/session";

const SESSION_COOKIE = "ql_session";
const SESSION_EXP_COOKIE = "ql_session_exp";
const SESSION_DURATION = 30 * 60 * 1000;

// Rate limiting: IP당 5회 실패 시 30분 차단
const MAX_ATTEMPTS = 5;
const BAN_DURATION_MS = 30 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) return { allowed: true };
  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function recordFailure(ip: string): number {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + BAN_DURATION_MS });
    return 1;
  }
  entry.count++;
  return entry.count;
}

function clearFailures(ip: string): void {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    const minutes = Math.ceil((retryAfter ?? 0) / 60);
    return NextResponse.json(
      {
        error: `시도 횟수 초과. ${minutes}분 후 다시 시도해주세요.`,
        blocked: true,
        retryAfter,
        maxAttempts: MAX_ATTEMPTS,
      },
      { status: 429 },
    );
  }

  const { studentId, name } = await req.json();

  if (!studentId || !/^\d{10}$/.test(studentId)) {
    const count = recordFailure(ip);
    return NextResponse.json(
      { error: "학번 형식이 올바르지 않습니다.", failCount: count, maxAttempts: MAX_ATTEMPTS },
      { status: 400 },
    );
  }

  const trimmedName = (name ?? "").trim();
  if (!/^[가-힣a-zA-Z\s]{2,}$/.test(trimmedName)) {
    const count = recordFailure(ip);
    return NextResponse.json(
      { error: "이름 형식이 올바르지 않습니다.", failCount: count, maxAttempts: MAX_ATTEMPTS },
      { status: 400 },
    );
  }

  // 학번 또는 이름 중 하나라도 기존에 있으면 두 값이 같은 행에서 일치해야 함
  const { data: matches, error: selectError } = await supabase
    .from("users")
    .select("id, role, name, student_id")
    .or(`student_id.eq.${studentId},name.eq.${trimmedName}`);

  if (selectError) {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }

  let userId: string;
  let role: string;

  if (matches && matches.length > 0) {
    const exact = matches.find(
      (u) => u.student_id === studentId && u.name === trimmedName,
    );
    if (!exact) {
      const count = recordFailure(ip);
      return NextResponse.json(
        {
          error: "학번 또는 이름이 일치하지 않습니다.",
          failCount: count,
          maxAttempts: MAX_ATTEMPTS,
        },
        { status: 403 },
      );
    }
    userId = exact.id;
    role = exact.role ?? "member";
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
