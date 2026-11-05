"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KycActions({
  merchantId,
  hasPersonal,
  hasBusiness,
}: {
  merchantId: string;
  hasPersonal: boolean;
  hasBusiness: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function verify(kycType: "personal" | "business", status: "verified" | "rejected") {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kyc-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, kycType, status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error || "Failed to update KYC status.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!hasPersonal && !hasBusiness) {
    return <span className="text-neutral-600">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {hasPersonal && (
        <>
          <button
            disabled={loading}
            onClick={() => verify("personal", "verified")}
            className="rounded-md bg-lime-400/10 px-2 py-1 text-xs text-lime-400 hover:bg-lime-400/20 disabled:opacity-50"
          >
            Approve personal
          </button>
          <button
            disabled={loading}
            onClick={() => verify("personal", "rejected")}
            className="rounded-md bg-red-400/10 px-2 py-1 text-xs text-red-400 hover:bg-red-400/20 disabled:opacity-50"
          >
            Reject personal
          </button>
        </>
      )}
      {hasBusiness && (
        <>
          <button
            disabled={loading}
            onClick={() => verify("business", "verified")}
            className="rounded-md bg-lime-400/10 px-2 py-1 text-xs text-lime-400 hover:bg-lime-400/20 disabled:opacity-50"
          >
            Approve business
          </button>
          <button
            disabled={loading}
            onClick={() => verify("business", "rejected")}
            className="rounded-md bg-red-400/10 px-2 py-1 text-xs text-red-400 hover:bg-red-400/20 disabled:opacity-50"
          >
            Reject business
          </button>
        </>
      )}
    </div>
  );
}
