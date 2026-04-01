export interface ReceiptItem {
  id?: string;
  receipt_id?: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface User {
  id: string;
  student_id: string;
  name: string | null;
  card_number: string | null;
  role: "member" | "admin";
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  image_url: string;
  store_name: string;
  receipt_date: string; // ISO date string "YYYY-MM-DD"
  total_amount: number;
  raw_text: string;
  category_id?: string | null;
  created_by?: string | null;
  created_at: string;
  receipt_items?: ReceiptItem[];
  categories?: Category | null;
}

export interface ParsedReceipt {
  store_name: string;
  receipt_date: string;
  total_amount: number;
  items: ReceiptItem[];
}
