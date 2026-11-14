import { backendFetch, BackendApiError } from "@/lib/backend";
import Badge from "@/components/badge";
import Pagination from "@/components/pagination";
import ApiErrorNotice from "@/components/api-error-notice";

const LIMIT = 25;

interface TransactionRow {
  _id: string;
  reference: string;
  amount: string;
  currency: string;
  coinAsset?: { chain: string; asset: string; amount: string };
  status: string;
  paymentType: string;
  createdAt: string;
  merchantId?: { businessName?: string; email?: string } | string;
  actingDelegateChatId?: string | null;
}

interface TransactionsResponse {
  total: number;
  page: number;
  limit: number;
  data: TransactionRow[];
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  let result: TransactionsResponse | null = null;
  let errorMessage: string | null = null;
  try {
    result = await backendFetch<TransactionsResponse>(
      `/admin/transactions?page=${currentPage}&limit=${LIMIT}`,
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
        <h1 className="mb-6 text-2xl font-semibold">Transactions</h1>
        <ApiErrorNotice error={errorMessage ?? "No data returned."} />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.total / LIMIT));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Transactions</h1>
      <p className="mb-6 text-sm text-neutral-400">{result.total} transactions total</p>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Merchant</th>
              <th className="px-4 py-3">Performed by</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Crypto</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((tx) => (
              <tr key={tx._id} className="border-t border-neutral-800">
                <td className="px-4 py-3 font-mono text-xs text-neutral-400">{tx.reference}</td>
                <td className="px-4 py-3">
                  {typeof tx.merchantId === "object" ? tx.merchantId?.businessName || "—" : "—"}
                </td>
                <td className="px-4 py-3">
                  {tx.actingDelegateChatId ? (
                    <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-xs text-lime-400">
                      🔗 Delegate ({tx.actingDelegateChatId})
                    </span>
                  ) : (
                    <span className="text-neutral-500">Merchant</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {tx.amount} {tx.currency}
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {tx.coinAsset ? `${tx.coinAsset.amount} ${tx.coinAsset.asset?.toUpperCase()} (${tx.coinAsset.chain})` : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-400">{tx.paymentType}</td>
                <td className="px-4 py-3">
                  <Badge status={tx.status} />
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.data.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">No transactions yet.</p>
      )}

      <Pagination basePath="/dashboard/transactions" page={currentPage} totalPages={totalPages} />
    </div>
  );
}
