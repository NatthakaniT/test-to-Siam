const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
  });
  const body = res.status === 204 ? null : await res.json();
  if (!res.ok) {
    // Laravel 422: show every field error, not just the first one in `message`
    const fieldErrors = body?.errors ? Object.values(body.errors as Record<string, string[]>).flat() : [];
    throw new Error(fieldErrors.length ? [...new Set(fieldErrors)].join(" · ") : body?.message ?? `HTTP ${res.status}`);
  }
  return body as T;
}
