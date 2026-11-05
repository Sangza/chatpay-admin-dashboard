import { NextRequest, NextResponse } from "next/server";
import { backendFetch, BackendApiError } from "@/lib/backend";

export async function POST(req: NextRequest) {
  const { merchantId, kycType, status } = await req.json();

  if (!merchantId || !kycType || !status) {
    return NextResponse.json({ error: "merchantId, kycType, and status are required." }, { status: 400 });
  }

  try {
    await backendFetch("/admin/kyc/verify", {
      method: "POST",
      body: JSON.stringify({ merchantId, kycType, status }),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status_ = err instanceof BackendApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Failed to update KYC status.";
    return NextResponse.json({ error: message }, { status: status_ });
  }
}
