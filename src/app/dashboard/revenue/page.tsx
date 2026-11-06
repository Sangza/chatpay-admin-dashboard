import { backendFetch, BackendApiError } from "@/lib/backend";
import ApiErrorNotice from "@/components/api-error-notice";

interface VolumeResponse {
  totalAmountProcessed: number;
  asset: string;
}

function describeError(err: unknown): string {
  return err instanceof BackendApiError
    ? `(${err.status}) ${err.message}`
    : err instanceof Error
      ? err.message
      : "Unknown error";
}

export default async function RevenuePage() {
  const [usdcResult, usdtResult] = await Promise.allSettled([
    backendFetch<VolumeResponse>("/admin/total-amount-processed?asset=usdc"),
    backendFetch<VolumeResponse>("/admin/total-amount-processed?asset=usdt"),
  ]);

  const usdc = usdcResult.status === "fulfilled" ? usdcResult.value : null;
  const usdt = usdtResult.status === "fulfilled" ? usdtResult.value : null;
  const firstError =
    usdcResult.status === "rejected"
      ? describeError(usdcResult.reason)
      : usdtResult.status === "rejected"
        ? describeError(usdtResult.reason)
        : null;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Revenue</h1>
      <p className="mb-6 text-sm text-neutral-400">Platform margin captured</p>

      {firstError && (
        <div className="mb-6">
          <ApiErrorNotice error={firstError} />
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-800 p-5">
          <p className="text-sm text-neutral-400">USDC volume processed</p>
          <p className="mt-1 text-2xl font-semibold">{usdc?.totalAmountProcessed?.toLocaleString() ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-neutral-800 p-5">
          <p className="text-sm text-neutral-400">USDT volume processed</p>
          <p className="mt-1 text-2xl font-semibold">{usdt?.totalAmountProcessed?.toLocaleString() ?? "—"}</p>
        </div>
      </div>
      <p className="mb-6 text-xs text-neutral-500">
        Gross volume, not profit — only counts transactions marked <code>completed</code>, which
        today excludes confirmed Telegram <code>pay</code> transactions (a known gap: that flow
        never flips status to <code>completed</code>). Treat this as a lower bound, not the real total.
      </p>

      <div className="rounded-lg border border-dashed border-neutral-700 p-10 text-center">
        <p className="text-neutral-300">Margin/profit: coming soon</p>
        <p className="mt-1 text-sm text-neutral-500">
          Pay/buy/sell currently capture no platform margin (confirmed: buy&apos;s buffer is
          overridden at settlement, sell never applies one). This section will show real numbers
          once the fee system is actually built — not before.
        </p>
      </div>
    </div>
  );
}
