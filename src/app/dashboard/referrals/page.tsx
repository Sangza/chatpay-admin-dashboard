import Link from "next/link";
import { backendFetch, BackendApiError } from "@/lib/backend";
import Pagination from "@/components/pagination";
import ApiErrorNotice from "@/components/api-error-notice";

const LIMIT = 25;

interface ReferralSummaryRow {
  referrerMerchantId: string;
  referrerBusinessName: string;
  referredCount: number;
  transactionCount: number;
  totalPendingPayoutNgn: number;
}

interface ReferralSummaryResponse {
  data: ReferralSummaryRow[];
  total: number;
  page: number;
  limit: number;
}

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  let result: ReferralSummaryResponse | null = null;
  let errorMessage: string | null = null;
  try {
    result = await backendFetch<ReferralSummaryResponse>(
      `/admin/referrals?page=${currentPage}&limit=${LIMIT}`,
    );
  } catch (err) {
    errorMessage =
      err instanceof BackendApiError
        ? `(${err.status}) ${err.message}`
        : err instanceof Error
          ? err.message
          : "Unknown error";
  }

  if (errorMessage || !result) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold">Referrals</h1>
        <ApiErrorNotice error={errorMessage ?? "No data returned."} />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.total / LIMIT));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Referrals</h1>
      <p className="mb-6 text-sm text-neutral-400">
        {result.total} merchants have referred at least one other merchant
      </p>

      <div className="mb-6 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-300">
        Pending payout is always ₦0 right now — the fee/margin system this depends on hasn&apos;t
        been built yet. The attribution and accrual mechanism below is real; the amounts will
        start reflecting actual money the moment that exists.
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-4 py-3">Referrer</th>
              <th className="px-4 py-3">Merchants referred</th>
              <th className="px-4 py-3">Referred transactions</th>
              <th className="px-4 py-3">Pending payout</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((r) => (
              <tr key={r.referrerMerchantId} className="border-t border-neutral-800">
                <td className="px-4 py-3 font-medium">{r.referrerBusinessName}</td>
                <td className="px-4 py-3">{r.referredCount}</td>
                <td className="px-4 py-3 text-neutral-400">{r.transactionCount}</td>
                <td className="px-4 py-3">₦{r.totalPendingPayoutNgn.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/referrals/${r.referrerMerchantId}`}
                    className="text-lime-400 hover:underline"
                  >
                    View downstream →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.data.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">
          No referrals yet — a merchant shares their own link (t.me/ChatPay_Crypto_bot?start=ref_&lt;their merchant id&gt;) to refer someone.
        </p>
      )}

      <Pagination basePath="/dashboard/referrals" page={currentPage} totalPages={totalPages} />
    </div>
  );
}
