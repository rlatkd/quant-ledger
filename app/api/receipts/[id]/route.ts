import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
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

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/receipts/[id]">) {
  const { id } = await ctx.params;
  const body = await req.json();
  const { store_name, receipt_date, total_amount, raw_text, items } = body;

  const { error } = await supabase.rpc("update_receipt", {
    p_id: id,
    p_store_name: store_name,
    p_receipt_date: receipt_date,
    p_total_amount: total_amount,
    p_raw_text: raw_text ?? "",
    p_items: items ?? [],
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/receipts");
  revalidatePath(`/receipts/${id}`);
  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/receipts/[id]">) {
  const { id } = await ctx.params;

  // receipt_items는 ON DELETE CASCADE로 자동 삭제
  const { error } = await supabase.from("receipts").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/receipts");
  return new Response(null, { status: 204 });
}
