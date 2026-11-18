"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState("กำลังโหลด… (เปิดครั้งแรกอาจรอประมาณ 1 นาที)");

  useEffect(() => {
    api<{ status: string }>("/health")
      .then((r) => setStatus(`API: ${r.status}`))
      .catch((e) => setStatus(`API ใช้ไม่ได้: ${e.message}`));
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold">ระบบขายสินค้าและคำสั่งซื้อ</h1>
      <p className="mt-4">{status}</p>
    </main>
  );
}
