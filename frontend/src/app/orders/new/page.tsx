"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { baht, type Order, type Product } from "@/lib/types";
import { ErrorText, Loading } from "@/components/Status";

type Line = { product_id: string; quantity: string };

export default function NewOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [customer, setCustomer] = useState("");
  const [lines, setLines] = useState<Line[]>([{ product_id: "", quantity: "1" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch((e) => setError(e.message));
  }, []);

  const update = (i: number, patch: Partial<Line>) =>
    setLines(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  // Preview only: the server reads the real price from the DB when saving
  const estimate = lines.reduce((sum, l) => {
    const p = products?.find((p) => String(p.id) === l.product_id);
    return sum + (p ? Number(p.price) * Number(l.quantity || 0) : 0);
  }, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const order = await api<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customer_name: customer,
          items: lines.map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) })),
        }),
      });
      router.push(`/orders/${order.id}`);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  if (!products && !error) return <Loading />;

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h1 className="text-2xl font-bold">สร้างคำสั่งซื้อ</h1>
      {error && <ErrorText message={error} />}

      <label className="block">
        <span className="mb-1 block font-medium">ชื่อลูกค้า</span>
        <input className="input" value={customer} onChange={(e) => setCustomer(e.target.value)} required maxLength={255} />
      </label>

      <fieldset className="space-y-3">
        <legend className="mb-1 font-medium">รายการสินค้า</legend>
        {lines.map((line, i) => {
          const taken = lines.filter((_, j) => j !== i).map((l) => l.product_id);
          return (
            <div key={i} className="flex flex-wrap gap-2 sm:flex-nowrap">
              <select
                className="input sm:flex-1"
                value={line.product_id}
                onChange={(e) => update(i, { product_id: e.target.value })}
                required
                aria-label={`สินค้าบรรทัดที่ ${i + 1}`}
              >
                <option value="">— เลือกสินค้า —</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id} disabled={taken.includes(String(p.id))}>
                    {p.name} ({baht(p.price)})
                  </option>
                ))}
              </select>
              <input
                className="input w-24 flex-1 sm:flex-none"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={line.quantity}
                onChange={(e) => update(i, { quantity: e.target.value })}
                required
                aria-label={`จำนวนบรรทัดที่ ${i + 1}`}
              />
              <button
                type="button"
                className="btn-danger"
                onClick={() => setLines(lines.filter((_, j) => j !== i))}
                disabled={lines.length === 1}
                aria-label={`ลบบรรทัดที่ ${i + 1}`}
              >
                ✕
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setLines([...lines, { product_id: "", quantity: "1" }])}
          disabled={lines.length >= (products?.length ?? 0)}
        >
          + เพิ่มรายการ
        </button>
      </fieldset>

      <p className="text-lg">
        ยอดประมาณ: <span className="font-bold">{baht(estimate)}</span>
      </p>

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
        {saving ? "กำลังบันทึก…" : "ยืนยันคำสั่งซื้อ"}
      </button>
    </form>
  );
}
