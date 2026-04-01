import type { NextRequest } from "next/server";
import { supabase } from "../../_lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .order("receipt_date", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { store_name, receipt_date, total_amount, raw_text, image_url, category_id, items } = body;

  // 영수증 저장
  const { data: receipt, error } = await supabase
    .from("receipts")
    .insert({ store_name, receipt_date, total_amount, raw_text, image_url, ...(category_id ? { category_id } : {}) })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // 항목 저장
  if (items?.length > 0) {
    const receiptItems = items.map((item: {
      menu_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }) => ({ ...item, receipt_id: receipt.id }));

    const { error: itemsError } = await supabase
      .from("receipt_items")
      .insert(receiptItems);

    if (itemsError) return Response.json({ error: itemsError.message }, { status: 500 });
  }

  return Response.json(receipt, { status: 201 });
}
