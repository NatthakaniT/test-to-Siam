export function Loading() {
  return (
    <div role="status" className="panel space-y-4 p-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-5 animate-pulse rounded-lg bg-brand-soft" style={{ width: `${85 - i * 20}%` }} />
      ))}
      <p className="text-sm text-muted">กำลังโหลด… ถ้าเปิดครั้งแรกอาจรอประมาณ 1 นาที</p>
    </div>
  );
}

export function ErrorText({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-danger">
      {message}
    </p>
  );
}

export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
