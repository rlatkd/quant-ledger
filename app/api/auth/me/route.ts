import type { NextRequest } from "next/server";
import { supabase } from "../../../_lib/supabase";
import { getSession } from "../../../_lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("users")
    .select("id, student_id, name, card_number, role")
    .eq("id", session.userId)
    .single();

  if (error || !data) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(data);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, card_number } = body;

  const { error } = await supabase
    .from("users")
    .update({ name, card_number })
    .eq("id", session.userId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
