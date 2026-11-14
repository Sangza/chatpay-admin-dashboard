"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefundAction({
  reference,
  status,
}: {
  reference: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status !== "collection.failed") {
    return <span className="text-neutral-600">—</span>;
  }

  async function requestRefund() {
    if (!confirm(`Request a refund from Yellow Card for ${reference}?`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/onramp-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(body.error || "Failed to request refund.");
        return;
      }
      alert(`Refund requested - status: ${body?.result?.status || body?.data?.result?.status || "pending_refund"}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      disabled={loading}
      onClick={requestRefund}
      className="rounded-md bg-amber-400/10 px-2 py-1 text-xs text-amber-400 hover:bg-amber-400/20 disabled:opacity-50"
    >
      {loading ? "Requesting…" : "Request refund"}
    </button>
  );
}
