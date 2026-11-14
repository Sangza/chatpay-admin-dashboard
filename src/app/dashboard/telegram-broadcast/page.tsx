"use client";

import { useEffect, useState } from "react";

type Segment = "never_started_kyc" | "kyc_pending" | "all";

interface SegmentCounts {
  neverStartedKyc: number;
  kycPendingUnverified: number;
  all: number;
}

interface SendResult {
  sent: number;
  failed: number;
  failedChatIds: string[];
}

const SEGMENT_LABELS: Record<Segment, string> = {
  never_started_kyc: "Never started KYC",
  kyc_pending: "Started KYC, nothing verified yet",
  all: "All merchants with Telegram linked",
};

export default function TelegramBroadcastPage() {
  const [counts, setCounts] = useState<SegmentCounts | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [segment, setSegment] = useState<Segment>("kyc_pending");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"compose" | "review" | "result">("compose");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/telegram-segments")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Failed to load segment counts.");
        setCounts(body);
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  function countFor(s: Segment): number | null {
    if (!counts) return null;
    if (s === "never_started_kyc") return counts.neverStartedKyc;
    if (s === "kyc_pending") return counts.kycPendingUnverified;
    return counts.all;
  }

  async function handleConfirmSend() {
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/admin/telegram-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment, message }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to send broadcast.");
      setResult(body);
      setStep("result");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send broadcast.");
    } finally {
      setSending(false);
    }
  }

  function startOver() {
    setStep("compose");
    setResult(null);
    setSendError(null);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold">Telegram Broadcast</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Send a message directly to merchants inside the bot. Only merchants with a Telegram chatId
        on file are included - anyone who signed up through WhatsApp only has nothing to receive it.
      </p>

      {loadError && <p className="mb-4 text-sm text-red-400">{loadError}</p>}

      {step === "compose" && (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-neutral-300">Segment</label>
            <div className="space-y-2">
              {(Object.keys(SEGMENT_LABELS) as Segment[]).map((s) => (
                <label
                  key={s}
                  className="flex items-center justify-between rounded-md border border-neutral-800 px-3 py-2 text-sm hover:border-neutral-600"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="segment"
                      checked={segment === s}
                      onChange={() => setSegment(s)}
                    />
                    {SEGMENT_LABELS[s]}
                  </span>
                  <span className="text-neutral-500">
                    {countFor(s) === null ? "…" : `${countFor(s)} merchants`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              Message (Telegram Markdown - *bold*, _italic_, `code`)
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="We've added a referral program - check out *referral-link*!"
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-lime-400"
            />
          </div>

          <button
            disabled={!message}
            onClick={() => setStep("review")}
            className="rounded-md bg-lime-400 px-4 py-2 font-medium text-neutral-950 hover:bg-lime-300 disabled:opacity-50"
          >
            Review before sending
          </button>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-300">
            This sends a real Telegram message to {countFor(segment) ?? "…"} real merchants
            ({SEGMENT_LABELS[segment]}), straight into their chat with the bot.
          </div>

          <div className="rounded-lg border border-neutral-800 p-4">
            <p className="text-sm text-neutral-500">Message</p>
            <p className="whitespace-pre-wrap">{message}</p>
          </div>

          {sendError && <p className="text-sm text-red-400">{sendError}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("compose")}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm hover:border-neutral-500"
            >
              Back to edit
            </button>
            <button
              onClick={handleConfirmSend}
              disabled={sending}
              className="rounded-md bg-lime-400 px-4 py-2 font-medium text-neutral-950 hover:bg-lime-300 disabled:opacity-50"
            >
              {sending ? "Sending…" : `Confirm & send to ${countFor(segment) ?? "…"} merchants`}
            </button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-800 p-5">
            <p className="text-lg font-medium">
              {result.sent} sent, {result.failed} failed
            </p>
            {result.failedChatIds.length > 0 && (
              <div className="mt-3 text-sm text-neutral-400">
                <p className="mb-1">Failed chat IDs:</p>
                <ul className="list-inside list-disc">
                  {result.failedChatIds.map((id) => (
                    <li key={id}>{id}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button
            onClick={startOver}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm hover:border-neutral-500"
          >
            Send another broadcast
          </button>
        </div>
      )}
    </div>
  );
}
