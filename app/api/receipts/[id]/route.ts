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

  const { error: receiptError } = await supabase
    .from("receipts")
    .update({ store_name, receipt_date, total_amount, raw_text })
    .eq("id", id);

  if (receiptError) return Response.json({ error: receiptError.message }, { status: 500 });

  if (Array.isArray(items)) {
    await supabase.from("receipt_items").delete().eq("receipt_id", id);
    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("receipt_items").insert(
        items.map((item: { menu_name: string; quantity: number; unit_price: number; total_price: number }) => ({
          receipt_id: id,
          menu_name: item.menu_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        }))
      );
      if (itemsError) return Response.json({ error: itemsError.message }, { status: 500 });
    }
  }

  revalidatePath("/");
  revalidatePath("/receipts");
  revalidatePath(`/receipts/${id}`);
  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/receipts/[id]">) {
  const { id } = await ctx.params;

  // 항목 먼저 삭제 (FK 제약)
  await supabase.from("receipt_items").delete().eq("receipt_id", id);

  const { error } = await supabase.from("receipts").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/receipts");
  return new Response(null, { status: 204 });
}
