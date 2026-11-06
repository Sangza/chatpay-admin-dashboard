import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFetch, BackendApiError, TOKEN_COOKIE } from "@/lib/backend";

interface LoginResponse {
  message: string;
  admin: Record<string, unknown>;
  accessToken: string;
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  try {
    const data = await backendFetch<LoginResponse>("/account/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      token: "", // login itself needs no bearer token
    });

    const cookieStore = await cookies();
    cookieStore.set(TOKEN_COOKIE, data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err instanceof BackendApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Login failed.";
    // Logged server-side since a plain fetch failure (e.g. API_BASE_URL
    // pointing nowhere reachable) gives the browser a vague message like
    // "fetch failed" with no way to tell what actually went wrong - this is
    // the only place that records the real cause.
    console.error(`Admin login failed: ${message}`, err);
    return NextResponse.json({ error: message }, { status });
  }
}
