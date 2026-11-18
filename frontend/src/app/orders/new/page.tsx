"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { baht, type Order, type Product } from "@/lib/types";
import { ErrorText, Loading, PageTitle } from "@/components/Status";
import { IconMinus, IconPlus, IconX } from "@/components/Icons";

type Line = { product_id: string; quantity: number };

export default function NewOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [customer, setCustomer] = useState("");
  const [lines, setLines] = useState<Line[]>([{ product_id: "", quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Product[]>("/products").then(setProducts).catch((e) => setError(e.message));
  }, []);

  const update = (i: number, patch: Partial<Line>) =>
    setLines(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const priceOf = (l: Line) => Number(products?.find((p) => String(p.id) === l.product_id)?.price ?? 0);

  // Preview only: the server reads the real price from the DB when saving
  const estimate = lines.reduce((sum, l) => sum + priceOf(l) * l.quantity, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const order = await api<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customer_name: customer,
          items: lines.map((l) => ({ product_id: Number(l.product_id), quantity: l.quantity })),
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
    <form onSubmit={submit} className="mx-auto max-w-2xl">
      <PageTitle title="สร้างคำสั่งซื้อ" sub="ราคาจะถูกบันทึกตามราคาสินค้า ณ ตอนกดยืนยัน" />
      {error && <div className="mb-4"><ErrorText message={error} /></div>}

      <section className="panel mb-4 p-5">
        <label htmlFor="customer" className="mb-1.5 block font-medium">ชื่อลูกค้า</label>
        <input
          id="customer"
          className="input"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          required
          maxLength={255}
          autoComplete="name"
        />
      </section>

      <section className="panel p-5" aria-labelledby="items-heading">
        <h2 id="items-heading" className="mb-3 font-medium">รายการสินค้า</h2>

        <ul className="space-y-3">
          {lines.map((line, i) => {
            const taken = lines.filter((_, j) => j !== i).map((l) => l.product_id);
            const n = i + 1;
            return (
              <li key={i} className="rounded-xl bg-wash p-3">
                <div className="flex gap-2">
                  <select
                    className="input flex-1"
                    value={line.product_id}
                    onChange={(e) => update(i, { product_id: e.target.value })}
                    required
                    aria-label={`สินค้าบรรทัดที่ ${n}`}
                  >
                    <option value="">เลือกสินค้า</option>
                    {products?.map((p) => (
                      <option key={p.id} value={p.id} disabled={taken.includes(String(p.id))}>
                        {p.name} ({baht(p.price)})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="icon-btn hover:bg-danger-soft hover:text-danger"
                    onClick={() => setLines(lines.filter((_, j) => j !== i))}
                    disabled={lines.length === 1}
                    aria-label={`เอาบรรทัดที่ ${n} ออก`}
                  >
                    <IconX />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-xl border border-line bg-white" role="group" aria-label={`จำนวนบรรทัดที่ ${n}`}>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => update(i, { quantity: Math.max(1, line.quantity - 1) })}
                      disabled={line.quantity <= 1}
                      aria-label="ลดจำนวน"
                    >
                      <IconMinus />
                    </button>
                    <input
                      className="num w-14 bg-transparent text-center font-semibold focus:outline-none"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => update(i, { quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                      aria-label={`จำนวนบรรทัดที่ ${n}`}
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => update(i, { quantity: line.quantity + 1 })}
                      aria-label="เพิ่มจำนวน"
                    >
                      <IconPlus />
                    </button>
                  </div>
                  <span className="num font-medium">{baht(priceOf(line) * line.quantity)}</span>
                </div>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="btn-ghost mt-3 w-full border border-dashed border-line"
          onClick={() => setLines([...lines, { product_id: "", quantity: 1 }])}
          disabled={lines.length >= (products?.length ?? 0)}
        >
          <IconPlus />
          เพิ่มสินค้าอีกรายการ
        </button>
      </section>

      {/* Sticky so the total and the confirm button stay reachable on a phone */}
      <div className="sticky bottom-20 mt-4 md:bottom-4">
        <div className="panel flex items-center justify-between gap-4 p-4 shadow-lg shadow-brand/10">
          <div>
            <p className="text-sm text-muted">ยอดรวมโดยประมาณ</p>
            <p className="num text-xl font-bold text-brand">{baht(estimate)}</p>
          </div>
          <button type="submit" className="btn-primary px-6" disabled={saving}>
            {saving ? "กำลังบันทึก…" : "ยืนยันคำสั่งซื้อ"}
          </button>
        </div>
      </div>
    </form>
  );
}
