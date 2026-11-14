import { NextRequest, NextResponse } from "next/server";
import { backendFetch, BackendApiError } from "@/lib/backend";

interface SendResult {
  sent: number;
  failed: number;
  failedChatIds: string[];
}

export async function POST(req: NextRequest) {
  const { segment, message } = await req.json();

  if (!segment || !message) {
    return NextResponse.json({ error: "segment and message are required." }, { status: 400 });
  }

  try {
    const result = await backendFetch<SendResult>("/admin/telegram/send", {
      method: "POST",
      body: JSON.stringify({ segment, message }),
    });
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof BackendApiError ? err.status : 500;
    const message2 = err instanceof Error ? err.message : "Failed to send broadcast.";
    return NextResponse.json({ error: message2 }, { status });
  }
}
