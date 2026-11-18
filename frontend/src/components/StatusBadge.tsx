import type { Order } from "@/lib/types";

export default function StatusBadge({ status }: { status: Order["status"] }) {
  return status === "cancelled" ? (
    <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm text-red-700">ยกเลิกแล้ว</span>
  ) : (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-sm text-green-700">ยืนยันแล้ว</span>
  );
}
