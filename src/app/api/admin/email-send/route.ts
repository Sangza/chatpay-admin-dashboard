import { NextRequest, NextResponse } from "next/server";
import { backendFetch, BackendApiError } from "@/lib/backend";

interface SendResult {
  sent: number;
  failed: number;
  failedEmails: string[];
}

export async function POST(req: NextRequest) {
  const { segment, subject, html, fromEmail, fromName } = await req.json();

  if (!segment || !subject || !html) {
    return NextResponse.json({ error: "segment, subject, and html are required." }, { status: 400 });
  }

  try {
    const result = await backendFetch<SendResult>("/admin/email/send", {
      method: "POST",
      body: JSON.stringify({ segment, subject, html, fromEmail, fromName }),
    });
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof BackendApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Failed to send campaign.";
    return NextResponse.json({ error: message }, { status });
  }
}
