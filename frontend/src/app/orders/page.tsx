"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { baht, type Order } from "@/lib/types";
import { ErrorText, Loading } from "@/components/Status";
import StatusBadge from "@/components/StatusBadge";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Order[]>("/orders").then(setOrders).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">คำสั่งซื้อ</h1>
        <Link href="/orders/new" className="btn-primary">+ สั่งซื้อ</Link>
      </div>

      {error && <ErrorText message={error} />}
      {!orders && !error && <Loading />}
      {orders?.length === 0 && <p className="text-gray-500">ยังไม่มีคำสั่งซื้อ</p>}

      <ul className="space-y-2">
        {orders?.map((o) => (
          <li key={o.id}>
            <Link href={`/orders/${o.id}`} className="card flex flex-wrap items-center gap-x-3 gap-y-1 hover:border-blue-400">
              <span className="font-medium">#{o.id}</span>
              <span className="mr-auto">{o.customer_name}</span>
              <StatusBadge status={o.status} />
              <span className="w-full text-sm text-gray-500 sm:w-auto">
                {o.items.length} รายการ · {new Date(o.created_at).toLocaleString("th-TH")}
              </span>
              <span className="font-bold">{baht(o.total)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
