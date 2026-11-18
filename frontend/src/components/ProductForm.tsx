"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ErrorText, Loading } from "@/components/Status";

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

  if (loading) return <Loading />;

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h1 className="text-2xl font-bold">{id ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</h1>
      {id && (
        <p className="text-sm text-gray-500">
          เปลี่ยนราคาตรงนี้ได้ คำสั่งซื้อเก่าจะยังใช้ราคาเดิมตอนที่สั่ง
        </p>
      )}
      {error && <ErrorText message={error} />}

      <label className="block">
        <span className="mb-1 block font-medium">ชื่อสินค้า</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={255} />
      </label>

      <label className="block">
        <span className="mb-1 block font-medium">ราคา (บาท)</span>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </label>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "กำลังบันทึก…" : "บันทึก"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
