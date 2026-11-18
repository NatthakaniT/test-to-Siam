"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ErrorText, Loading } from "@/components/Status";
import { IconArrowLeft } from "@/components/Icons";

/** Used for both create (no id) and edit (with id). */
export default function ProductForm({ id }: { id?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api<Product>(`/products/${id}`)
      .then((p) => {
        setName(p.name);
        setPrice(p.price);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(id ? `/products/${id}` : "/products", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({ name, price }),
      });
      router.push("/products");
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/products" className="btn-ghost -ml-4 mb-2">
        <IconArrowLeft />
        กลับไปหน้าสินค้า
      </Link>

      {loading ? (
        <Loading />
      ) : (
        <form onSubmit={submit} className="panel space-y-5 p-5 md:p-6">
          <h1 className="text-2xl font-bold">{id ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</h1>
          {error && <ErrorText message={error} />}

          <div>
            <label htmlFor="name" className="mb-1.5 block font-medium">ชื่อสินค้า</label>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={255} />
          </div>

          <div>
            <label htmlFor="price" className="mb-1.5 block font-medium">ราคาต่อชิ้น</label>
            <div className="relative">
              <input
                id="price"
                className="input num pr-14"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                aria-describedby={id ? "price-help" : undefined}
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted">บาท</span>
            </div>
            {id && (
              <p id="price-help" className="mt-2 text-sm text-muted">
                ราคาใหม่จะใช้กับคำสั่งซื้อหลังจากนี้ คำสั่งซื้อที่สั่งไปแล้วยังคิดราคาเดิม
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button type="button" className="btn-outline" onClick={() => router.back()}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "กำลังบันทึก…" : id ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
