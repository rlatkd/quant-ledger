import type { NextRequest } from "next/server";
import { supabase } from "../../../_lib/supabase";

const SESSION_COOKIE = "ql_session";

export async function GET(req: NextRequest) {
  const cookieValue = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { userId } = JSON.parse(atob(cookieValue)) as { userId: string };
    const { data, error } = await supabase
      .from("users")
      .select("id, student_id, name, card_number, role")
      .eq("id", userId)
      .single();

    if (error || !data) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(data);
  } catch {
    return Response.json({ error: "invalid session" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  const cookieValue = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { userId } = JSON.parse(atob(cookieValue)) as { userId: string };
    const body = await req.json();
    const { name, card_number } = body;

    const { error } = await supabase
      .from("users")
      .update({ name, card_number })
      .eq("id", userId);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "invalid session" }, { status: 401 });
  }
}
