import { backendFetch, BackendApiError } from "@/lib/backend";
import Pagination from "@/components/pagination";
import ApiErrorNotice from "@/components/api-error-notice";

const LIMIT = 25;

interface GroupRow {
  _id: string;
  groupChatId: string;
  groupTitle: string;
  priceNgn: number;
  billingCycleDays: number;
  activeSubscriberCount: number;
  createdAt: string;
  merchantId?: { businessName?: string; email?: string } | string;
}

interface GroupsResponse {
  data: GroupRow[];
  total: number;
  page: number;
  limit: number;
}

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  let result: GroupsResponse | null = null;
  let errorMessage: string | null = null;
  try {
    result = await backendFetch<GroupsResponse>(
      `/admin/groups?page=${currentPage}&limit=${LIMIT}`,
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
        <h1 className="mb-6 text-2xl font-semibold">Groups</h1>
        <ApiErrorNotice error={errorMessage ?? "No data returned."} />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.total / LIMIT));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Groups</h1>
      <p className="mb-6 text-sm text-neutral-400">
        {result.total} paid Telegram groups — merchants charging for group/channel access
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Active subscribers</th>
              <th className="px-4 py-3">Set up</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((g) => (
              <tr key={g._id} className="border-t border-neutral-800">
                <td className="px-4 py-3">
                  <div className="font-medium">{g.groupTitle}</div>
                  <div className="font-mono text-xs text-neutral-500">{g.groupChatId}</div>
                </td>
                <td className="px-4 py-3">
                  {typeof g.merchantId === "object" ? g.merchantId?.businessName || "—" : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  ₦{g.priceNgn.toLocaleString()} / {g.billingCycleDays}d
                </td>
                <td className="px-4 py-3">{g.activeSubscriberCount}</td>
                <td className="px-4 py-3 text-neutral-400">
                  {new Date(g.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.data.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">
          No groups set up yet — a merchant runs *setup-group [price]* inside a group they admin to register it.
        </p>
      )}

      <Pagination basePath="/dashboard/groups" page={currentPage} totalPages={totalPages} />
    </div>
  );
}
