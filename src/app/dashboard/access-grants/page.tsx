import { backendFetch, BackendApiError } from "@/lib/backend";
import Badge from "@/components/badge";
import Pagination from "@/components/pagination";
import ApiErrorNotice from "@/components/api-error-notice";

const LIMIT = 25;

interface GrantRow {
  _id: string;
  label: string;
  status: string;
  source?: "manual" | "referral_signup";
  delegateTelegramChatId: string | null;
  grantValueCapNgn: number;
  grantValueUsedNgn: number;
  claimedAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  merchantId?: { businessName?: string; email?: string } | string;
}

interface GrantsResponse {
  data: GrantRow[];
  total: number;
  page: number;
  limit: number;
}

export default async function AccessGrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  let result: GrantsResponse | null = null;
  let errorMessage: string | null = null;
  try {
    result = await backendFetch<GrantsResponse>(
      `/admin/access-grants?page=${currentPage}&limit=${LIMIT}`,
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
        <h1 className="mb-6 text-2xl font-semibold">Access Grants</h1>
        <ApiErrorNotice error={errorMessage ?? "No data returned."} />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.total / LIMIT));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Access Grants</h1>
      <p className="mb-6 text-sm text-neutral-400">
        {result.total} grants total — merchants delegating account access to staff/associates
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-4 py-3">Merchant</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Delegate chat id</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Last used</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((g) => (
              <tr key={g._id} className="border-t border-neutral-800">
                <td className="px-4 py-3">
                  {typeof g.merchantId === "object" ? g.merchantId?.businessName || "—" : "—"}
                </td>
                <td className="px-4 py-3">{g.label}</td>
                <td className="px-4 py-3">
                  {g.source === "referral_signup" ? (
                    <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-xs text-lime-400">
                      🔗 Referral
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                      👥 Manual
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-400">
                  {g.delegateTelegramChatId || "— (not yet claimed)"}
                </td>
                <td className="px-4 py-3">
                  <Badge status={g.status} />
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  ₦{g.grantValueUsedNgn.toLocaleString()} / ₦{g.grantValueCapNgn.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {g.lastUsedAt ? new Date(g.lastUsedAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.data.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">No access grants created yet.</p>
      )}

      <Pagination basePath="/dashboard/access-grants" page={currentPage} totalPages={totalPages} />
    </div>
  );
}
