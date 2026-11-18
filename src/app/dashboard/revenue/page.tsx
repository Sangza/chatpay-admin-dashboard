import { backendFetch, BackendApiError } from "@/lib/backend";
import ApiErrorNotice from "@/components/api-error-notice";

interface FlowBreakdown {
  amount: number;
  count: number;
}

interface VolumeResponse {
  totalAmountProcessed: number;
  breakdown: { pay: FlowBreakdown; buy: FlowBreakdown; sell: FlowBreakdown };
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
          <p className="text-sm text-neutral-400">USDC volume processed (pay + buy + sell)</p>
          <p className="mt-1 text-2xl font-semibold">{usdc?.totalAmountProcessed?.toLocaleString() ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-neutral-800 p-5">
          <p className="text-sm text-neutral-400">USDT volume processed (pay + buy + sell)</p>
          <p className="mt-1 text-2xl font-semibold">{usdt?.totalAmountProcessed?.toLocaleString() ?? "—"}</p>
        </div>
      </div>

      {(usdc || usdt) && (
        <div className="mb-6 overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-4 py-3">Flow</th>
                <th className="px-4 py-3">USDC amount</th>
                <th className="px-4 py-3">USDC count</th>
                <th className="px-4 py-3">USDT amount</th>
                <th className="px-4 py-3">USDT count</th>
              </tr>
            </thead>
            <tbody>
              {(["pay", "buy", "sell"] as const).map((flow) => (
                <tr key={flow} className="border-t border-neutral-800">
                  <td className="px-4 py-3 font-medium capitalize">{flow}</td>
                  <td className="px-4 py-3">{usdc?.breakdown?.[flow]?.amount.toLocaleString() ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-400">{usdc?.breakdown?.[flow]?.count ?? "—"}</td>
                  <td className="px-4 py-3">{usdt?.breakdown?.[flow]?.amount.toLocaleString() ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-400">{usdt?.breakdown?.[flow]?.count ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mb-6 text-xs text-neutral-500">
        Gross volume, not profit — only counts transactions marked <code>completed</code> in each
        flow&apos;s own status field. Treat this as a lower bound, not the real total, if any flow&apos;s
        completion status isn&apos;t being set reliably.
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
