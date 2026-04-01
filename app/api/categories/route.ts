import type { NextRequest } from "next/server";
import { supabase } from "../../_lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) return Response.json({ error: "이름을 입력해주세요." }, { status: 400 });

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: name.trim() })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
