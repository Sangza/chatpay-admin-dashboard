import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";
const TOKEN_COOKIE = "chatpay_admin_token";

export class BackendApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Every Asap-server response is wrapped as { success, data } (on success)
// or { success: false, ...errorFields } (on failure) by its global
// ResponseTransformerInterceptor - unwrap that shape here, once, so every
// caller just gets the real payload or a thrown error.
async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    const message = body?.message || body?.error || `Request failed (${res.status})`;
    throw new BackendApiError(res.status, message);
  }

  return body.data as T;
}

export async function backendFetch<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const token = init?.token ?? (await cookies()).get(TOKEN_COOKIE)?.value;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  return unwrap<T>(res);
}

export { TOKEN_COOKIE, API_BASE_URL };
