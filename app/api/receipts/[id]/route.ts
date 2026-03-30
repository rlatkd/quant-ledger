import type { NextRequest } from "next/server";
import { supabase } from "../../../_lib/supabase";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/receipts/[id]">) {
  const { id } = await ctx.params;

  const { data, error } = await supabase
    .from("receipts")
    .select("*, receipt_items(*)")
    .eq("id", id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json(data);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/receipts/[id]">) {
  const { id } = await ctx.params;

  // 항목 먼저 삭제 (FK 제약)
  await supabase.from("receipt_items").delete().eq("receipt_id", id);

  const { error } = await supabase.from("receipts").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return new Response(null, { status: 204 });
}
