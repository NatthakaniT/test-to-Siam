"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { baht, type Order } from "@/lib/types";
import { ErrorText, Loading } from "@/components/Status";
import StatusBadge from "@/components/StatusBadge";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api<Order>(`/orders/${id}`).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  async function cancel() {
    if (!confirm("ยกเลิกคำสั่งซื้อนี้? ยกเลิกแล้วย้อนกลับไม่ได้")) return;
    setCancelling(true);
    try {
      setOrder(await api<Order>(`/orders/${id}/cancel`, { method: "POST" }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCancelling(false);
    }
  }

  if (error) return <ErrorText message={error} />;
  if (!order) return <Loading />;

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold">คำสั่งซื้อ #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-gray-600">
        {order.customer_name} · {new Date(order.created_at).toLocaleString("th-TH")}
      </p>

      <ul className="divide-y divide-gray-200 border-y border-gray-200">
        {order.items.map((item) => {
          const changed = item.current_price !== null && item.current_price !== item.unit_price;
          return (
            <li key={item.id} className="flex flex-wrap items-baseline gap-x-3 py-3">
              <div className="mr-auto">
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} × {baht(item.unit_price)} <span className="text-gray-400">(ราคาตอนสั่ง)</span>
                </p>
                {changed && (
                  <p className="text-sm text-amber-700">ราคาปัจจุบัน {baht(item.current_price!)}</p>
                )}
              </div>
              <span className="font-medium">{baht(item.line_total)}</span>
            </li>
          );
        })}
      </ul>

      <p className="flex justify-between text-lg">
        <span>ยอดรวม</span>
        <span className="font-bold">{baht(order.total)}</span>
      </p>

      <div className="flex flex-wrap gap-2">
        <Link href="/orders" className="btn-secondary">← กลับ</Link>
        {order.status === "confirmed" && (
          <button onClick={cancel} className="btn-danger" disabled={cancelling}>
            {cancelling ? "กำลังยกเลิก…" : "ยกเลิกคำสั่งซื้อ"}
          </button>
        )}
      </div>
    </div>
  );
}
