import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "../../../_lib/supabase";

const SESSION_COOKIE = "ql_session";
const SESSION_EXP_COOKIE = "ql_session_exp";
const SESSION_DURATION = 30 * 60 * 1000;

export async function POST(req: NextRequest) {
  const { studentId } = await req.json();

  if (!studentId || !/^\d{10}$/.test(studentId)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 400 });
  }

  // DB에 존재하는 학번만 허용
  const { data: existing } = await supabase
    .from("users")
    .select("id, role")
    .eq("student_id", studentId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const userId = existing.id;
  const role = existing.role;

  const expiresAt = Date.now() + SESSION_DURATION;
  const sessionValue = btoa(JSON.stringify({ userId, expiresAt }));
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
