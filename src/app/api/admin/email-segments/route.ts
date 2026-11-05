import { NextResponse } from "next/server";
import { backendFetch, BackendApiError } from "@/lib/backend";

interface SegmentCounts {
  neverStartedKyc: number;
  kycPendingUnverified: number;
  all: number;
}

export async function GET() {
  try {
    const data = await backendFetch<SegmentCounts>("/admin/email/segments");
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof BackendApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Failed to load segment counts.";
    return NextResponse.json({ error: message }, { status });
  }
}
