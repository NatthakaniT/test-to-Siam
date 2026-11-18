import type { Order } from "@/lib/types";

export default function StatusBadge({ status }: { status: Order["status"] }) {
  return status === "cancelled" ? (
    <span className="inline-flex items-center rounded-full bg-danger-soft px-2.5 py-0.5 text-sm font-medium text-danger">
      ยกเลิกแล้ว
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-ok-soft px-2.5 py-0.5 text-sm font-medium text-ok">
      ยืนยันแล้ว
    </span>
  );
}
