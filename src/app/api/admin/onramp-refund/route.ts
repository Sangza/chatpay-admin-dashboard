import { NextRequest, NextResponse } from "next/server";
import { backendFetch, BackendApiError } from "@/lib/backend";

export async function POST(req: NextRequest) {
  const { reference } = await req.json();

  if (!reference) {
    return NextResponse.json({ error: "reference is required." }, { status: 400 });
  }

  try {
    const result = await backendFetch(`/admin/onramp/${encodeURIComponent(reference)}/refund`, {
      method: "POST",
    });
    return NextResponse.json(result ?? { ok: true });
  } catch (err) {
    const status = err instanceof BackendApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Failed to request refund.";
    return NextResponse.json({ error: message }, { status });
  }
}
