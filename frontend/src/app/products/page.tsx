"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { baht, type Product } from "@/lib/types";
import { ErrorText, Loading, PageTitle } from "@/components/Status";
import { IconPencil, IconPlus, IconTrash } from "@/components/Icons";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    api<Product[]>("/products").then(setProducts).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function remove(p: Product) {
    if (!confirm(`ลบ "${p.name}" ออกจากร้าน?\nคำสั่งซื้อเก่าที่มีสินค้านี้จะยังแสดงครบเหมือนเดิม`)) return;
    try {
      await api(`/products/${p.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageTitle title="สินค้า" sub={products ? `${products.length} รายการในร้าน` : undefined}>
        <Link href="/products/new" className="btn-primary">
          <IconPlus />
          เพิ่มสินค้า
        </Link>
      </PageTitle>

      {error && <ErrorText message={error} />}
      {!products && !error && <Loading />}

      {products?.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="text-muted">ร้านยังไม่มีสินค้า เริ่มจากเพิ่มสินค้าชิ้นแรก</p>
          <Link href="/products/new" className="btn-primary mt-4">
            <IconPlus />
            เพิ่มสินค้า
          </Link>
        </div>
      )}

      {!!products?.length && (
        <ul className="panel divide-y divide-line">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-2 py-2 pr-2 pl-5">
              <p className="min-w-0 flex-1 truncate font-medium">{p.name}</p>
              <p className="num mr-2 font-semibold text-brand">{baht(p.price)}</p>
              <Link href={`/products/${p.id}/edit`} className="icon-btn" aria-label={`แก้ไข ${p.name}`}>
                <IconPencil />
              </Link>
              <button
                onClick={() => remove(p)}
                className="icon-btn hover:bg-danger-soft hover:text-danger"
                aria-label={`ลบ ${p.name}`}
              >
                <IconTrash />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
