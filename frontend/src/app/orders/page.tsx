"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { baht, thaiDate, type Order } from "@/lib/types";
import { ErrorText, Loading, PageTitle } from "@/components/Status";
import StatusBadge from "@/components/StatusBadge";
import { IconPlus } from "@/components/Icons";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Order[]>("/orders").then(setOrders).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageTitle title="คำสั่งซื้อ" sub={orders ? `ทั้งหมด ${orders.length} ใบ` : undefined}>
        <Link href="/orders/new" className="btn-primary">
          <IconPlus />
          สร้างคำสั่งซื้อ
        </Link>
      </PageTitle>

      {error && <ErrorText message={error} />}
      {!orders && !error && <Loading />}

      {orders?.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="text-muted">ยังไม่มีคำสั่งซื้อ</p>
          <Link href="/orders/new" className="btn-primary mt-4">
            <IconPlus />
            สร้างคำสั่งซื้อแรก
          </Link>
        </div>
      )}

      {!!orders?.length && (
        <ul className="panel divide-y divide-line overflow-hidden">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-wash"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    <span className="num text-muted">#{o.id}</span> {o.customer_name}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {thaiDate(o.created_at)}, {o.items.length} รายการ
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`num font-semibold ${o.status === "cancelled" ? "text-muted line-through" : ""}`}>
                    {baht(o.total)}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
