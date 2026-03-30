export interface ReceiptItem {
  id?: string;
  receipt_id?: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Receipt {
  id: string;
  image_url: string;
  store_name: string;
  receipt_date: string; // ISO date string "YYYY-MM-DD"
  total_amount: number;
  raw_text: string;
  created_at: string;
  receipt_items?: ReceiptItem[];
}

export interface ParsedReceipt {
  store_name: string;
  receipt_date: string;
  total_amount: number;
  items: ReceiptItem[];
}
