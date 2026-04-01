import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "../../../_lib/supabase";

const SESSION_COOKIE = "ql_session";
const SESSION_EXP_COOKIE = "ql_session_exp";
const SESSION_DURATION = 30 * 60 * 1000;
const STUDENT_ID_REGEX = /^20267121\d{2}$/;

export async function POST(req: NextRequest) {
  const { studentId } = await req.json();

  if (!studentId || !STUDENT_ID_REGEX.test(studentId)) {
    return NextResponse.json(
      { error: "권한이 없습니다." },
      { status: 400 }
    );
  }

  // 기존 사용자 조회
  const { data: existing } = await supabase
    .from("users")
    .select("id, role")
    .eq("student_id", studentId)
    .maybeSingle();

  let userId: string;
  let role: string;

  if (existing) {
    userId = existing.id;
    role = existing.role;
  } else {
    // 최초 로그인 → 사용자 생성
    const { data: created, error } = await supabase
      .from("users")
      .insert({ student_id: studentId, role: "member" })
      .select("id, role")
      .single();

    if (error || !created) {
      return NextResponse.json({ error: "로그인에 실패했습니다." }, { status: 500 });
    }
    userId = created.id;
    role = created.role;
  }

  const expiresAt = Date.now() + SESSION_DURATION;
  const sessionValue = btoa(JSON.stringify({ userId, expiresAt }));
  const maxAge = Math.ceil(SESSION_DURATION / 1000);
  const cookieOpts = {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };

  const res = NextResponse.json({ userId, role });
  res.cookies.set(SESSION_COOKIE, sessionValue, { ...cookieOpts, httpOnly: true });
  res.cookies.set(SESSION_EXP_COOKIE, String(expiresAt), { ...cookieOpts, httpOnly: false });

  return res;
}
