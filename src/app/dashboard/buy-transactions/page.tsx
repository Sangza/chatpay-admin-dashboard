import { backendFetch, BackendApiError } from "@/lib/backend";
import Badge from "@/components/badge";
import Pagination from "@/components/pagination";
import ApiErrorNotice from "@/components/api-error-notice";
import RefundAction from "./refund-action";

const LIMIT = 25;

interface OnrampRow {
  _id: string;
  transactionReference: string;
  fiatAmount: { amount: string; currency: string };
  cryptoAmount?: { amount: string; asset: string; chain: string };
  status: string;
  createdAt: string;
  userId?: { businessName?: string; email?: string } | string;
}

interface OnrampResponse {
  total: number;
  page: number;
  limit: number;
  data: OnrampRow[];
}

export default async function BuyTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  let result: OnrampResponse | null = null;
  let errorMessage: string | null = null;
  try {
    result = await backendFetch<OnrampResponse>(
      `/admin/onramp?page=${currentPage}&limit=${LIMIT}`,
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
        <h1 className="mb-6 text-2xl font-semibold">Buy Transactions</h1>
        <ApiErrorNotice error={errorMessage ?? "No data returned."} />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.total / LIMIT));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Buy Transactions</h1>
      <p className="mb-6 text-sm text-neutral-400">
        {result.total} buy (receive/collection) transactions total. Only a <strong>failed</strong>{" "}
        transaction can be refunded - Yellow Card never does this automatically on the buy side.
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Merchant</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Crypto</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Refund</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((tx) => (
              <tr key={tx._id} className="border-t border-neutral-800">
                <td className="px-4 py-3 font-mono text-xs text-neutral-400">
                  {tx.transactionReference}
                </td>
                <td className="px-4 py-3">
                  {typeof tx.userId === "object" ? tx.userId?.businessName || "—" : "—"}
                </td>
                <td className="px-4 py-3">
                  {tx.fiatAmount?.amount} {tx.fiatAmount?.currency}
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {tx.cryptoAmount
                    ? `${tx.cryptoAmount.amount} ${tx.cryptoAmount.asset?.toUpperCase()} (${tx.cryptoAmount.chain})`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge status={tx.status} />
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <RefundAction reference={tx.transactionReference} status={tx.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.data.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">No buy transactions yet.</p>
      )}

      <Pagination basePath="/dashboard/buy-transactions" page={currentPage} totalPages={totalPages} />
    </div>
  );
}
