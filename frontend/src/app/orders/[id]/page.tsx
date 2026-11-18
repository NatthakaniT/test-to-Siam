"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { baht, thaiDate, type Order, type OrderItem } from "@/lib/types";
import { ErrorText, Loading } from "@/components/Status";
import StatusBadge from "@/components/StatusBadge";
import { IconArrowLeft, IconTrendDown, IconTrendUp } from "@/components/Icons";

/** Shown only when today's catalog price differs from the price saved on this order. */
function PriceChange({ item }: { item: OrderItem }) {
  if (item.current_price === null || item.current_price === item.unit_price) return null;
  const up = Number(item.current_price) > Number(item.unit_price);
  const Icon = up ? IconTrendUp : IconTrendDown;
  return (
    <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-2.5 py-0.5 text-sm text-warn">
      <Icon className="size-4" />
      ราคาวันนี้ <span className="num font-medium">{baht(item.current_price)}</span>
    </p>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api<Order>(`/orders/${id}`).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  async function cancel() {
    if (!confirm("ยกเลิกคำสั่งซื้อนี้? ยกเลิกแล้วเปลี่ยนกลับไม่ได้")) return;
    setCancelling(true);
    setError("");
    try {
      setOrder(await api<Order>(`/orders/${id}/cancel`, { method: "POST" }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCancelling(false);
    }
  }

  const cancelled = order?.status === "cancelled";

  return (
    <div className="mx-auto max-w-md">
      <Link href="/orders" className="btn-ghost -ml-4 mb-2">
        <IconArrowLeft />
        กลับไปรายการคำสั่งซื้อ
      </Link>

      {error && <div className="mb-4"><ErrorText message={error} /></div>}
      {!order && !error && <Loading />}

      {order && (
        <>
          <article className="receipt px-6 pt-6 pb-8" aria-label={`ใบเสร็จคำสั่งซื้อ #${order.id}`}>
            <header className="text-center">
              <p className="text-sm text-muted">ร้านเครื่องเขียน</p>
              <h1 className="mt-1 text-2xl font-bold">
                คำสั่งซื้อ <span className="num">#{order.id}</span>
              </h1>
              <div className="mt-2 flex justify-center">
                <StatusBadge status={order.status} />
              </div>
            </header>

            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted">ลูกค้า</dt>
              <dd className="text-right font-medium">{order.customer_name}</dd>
              <dt className="text-muted">วันที่สั่ง</dt>
              <dd className="text-right">{thaiDate(order.created_at)}</dd>
            </dl>

            <ul className="mt-5 divide-y divide-dashed divide-line border-y border-dashed border-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="num text-sm text-muted">
                      {item.quantity} × {baht(item.unit_price)}
                    </p>
                    <PriceChange item={item} />
                  </div>
                  <p className="num font-medium">{baht(item.line_total)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-medium">ยอดรวม</span>
              <span className={`num text-2xl font-bold ${cancelled ? "text-muted line-through" : "text-brand"}`}>
                {baht(order.total)}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">คิดจากราคา ณ วันที่สั่ง ไม่เปลี่ยนตามราคาสินค้าในภายหลัง</p>
          </article>

          {!cancelled && (
            <button onClick={cancel} className="btn-danger mt-8 w-full" disabled={cancelling}>
              {cancelling ? "กำลังยกเลิก…" : "ยกเลิกคำสั่งซื้อ"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
