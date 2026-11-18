export function Loading() {
  return <p className="text-gray-500">กำลังโหลด… (เปิดครั้งแรกอาจรอประมาณ 1 นาที)</p>;
}

export function ErrorText({ message }: { message: string }) {
  return <p className="rounded-lg bg-red-50 p-3 text-red-700">⚠️ {message}</p>;
}
