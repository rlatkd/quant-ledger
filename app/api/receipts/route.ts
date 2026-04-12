import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "../../_lib/supabase";
import { getSession, requireAdmin } from "../../_lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .order("receipt_date", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const session = await getSession();
  const body = await req.json();
  const { store_name, receipt_date, total_amount, raw_text, image_url, category_id, items } = body;

  const { data, error } = await supabase.rpc("insert_receipt", {
    p_store_name: store_name,
    p_receipt_date: receipt_date,
    p_total_amount: total_amount,
    p_raw_text: raw_text ?? "",
    p_image_url: image_url ?? null,
    p_category_id: category_id ?? null,
    p_items: items ?? [],
    p_user_id: session?.userId ?? null,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/receipts");
  return Response.json({ id: data }, { status: 201 });
}
