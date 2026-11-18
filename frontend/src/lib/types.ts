// Prices come from the API as strings like "100.00" (Laravel decimal cast)
export type Product = { id: number; name: string; price: string };

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: string; // price snapshot at order time
  quantity: number;
  line_total: string;
  current_price: string | null; // today's catalog price, display only
};

export type Order = {
  id: number;
  customer_name: string;
  status: "confirmed" | "cancelled";
  created_at: string;
  total: string;
  items: OrderItem[];
};

export const baht = (v: string | number) =>
  Number(v).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ฿";
