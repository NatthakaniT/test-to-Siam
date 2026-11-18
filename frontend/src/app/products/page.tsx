"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { baht, type Product } from "@/lib/types";
import { ErrorText, Loading } from "@/components/Status";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    api<Product[]>("/products").then(setProducts).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function remove(p: Product) {
    if (!confirm(`ลบ "${p.name}"? คำสั่งซื้อเก่าที่มีสินค้านี้จะยังอยู่ครบ`)) return;
    try {
      await api(`/products/${p.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">สินค้า</h1>
        <Link href="/products/new" className="btn-primary">+ เพิ่มสินค้า</Link>
      </div>

      {error && <ErrorText message={error} />}
      {!products && !error && <Loading />}
      {products?.length === 0 && <p className="text-gray-500">ยังไม่มีสินค้า</p>}

      <ul className="space-y-2">
        {products?.map((p) => (
          <li key={p.id} className="card flex flex-wrap items-center gap-3">
            <div className="mr-auto">
              <p className="font-medium">{p.name}</p>
              <p className="text-gray-600">{baht(p.price)}</p>
            </div>
            <Link href={`/products/${p.id}/edit`} className="btn-secondary">แก้ไข</Link>
            <button onClick={() => remove(p)} className="btn-danger">ลบ</button>
          </li>
        ))}
      </ul>
    </>
  );
}
