import Link from "next/link";
import { backendFetch, BackendApiError } from "@/lib/backend";
import Badge from "@/components/badge";
import Pagination from "@/components/pagination";
import ApiErrorNotice from "@/components/api-error-notice";

const LIMIT = 25;

interface DownstreamRow {
  merchantId: string;
  businessName: string;
  email: string;
  signedUpAt: string;
  isKycVerified: boolean;
  grantStatus: string | null;
  grantValueUsedNgn: number;
  grantValueCapNgn: number;
}

interface DownstreamResponse {
  data: DownstreamRow[];
  total: number;
  page: number;
  limit: number;
}

export default async function DownstreamReferralsPage({
  params,
  searchParams,
}: {
  params: Promise<{ merchantId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { merchantId } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  let result: DownstreamResponse | null = null;
  let errorMessage: string | null = null;
  try {
    result = await backendFetch<DownstreamResponse>(
      `/admin/referrals/${merchantId}/downstream?page=${currentPage}&limit=${LIMIT}`,
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
        <Link href="/dashboard/referrals" className="mb-4 inline-block text-sm text-neutral-400 hover:text-neutral-200">
          ← Back to Referrals
        </Link>
        <h1 className="mb-6 text-2xl font-semibold">Downstream signups</h1>
        <ApiErrorNotice error={errorMessage ?? "No data returned."} />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.total / LIMIT));

  return (
    <div>
      <Link href="/dashboard/referrals" className="mb-4 inline-block text-sm text-neutral-400 hover:text-neutral-200">
        ← Back to Referrals
      </Link>
      <h1 className="mb-1 text-2xl font-semibold">Downstream signups</h1>
      <p className="mb-6 text-sm text-neutral-400">
        {result.total} people have signed up through this merchant&apos;s referral link
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Signed up</th>
              <th className="px-4 py-3">Own KYC</th>
              <th className="px-4 py-3">Trial access</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((d) => (
              <tr key={d.merchantId} className="border-t border-neutral-800">
                <td className="px-4 py-3 font-medium">{d.businessName}</td>
                <td className="px-4 py-3 text-neutral-400">{d.email}</td>
                <td className="px-4 py-3 text-neutral-400">
                  {new Date(d.signedUpAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {d.isKycVerified ? (
                    <Badge status="verified" />
                  ) : (
                    <Badge status="not_started" />
                  )}
                </td>
                <td className="px-4 py-3">
                  {d.grantStatus ? (
                    <div className="flex flex-col gap-1">
                      <Badge status={d.grantStatus} />
                      <span className="text-xs text-neutral-500">
                        ₦{d.grantValueUsedNgn.toLocaleString()} / ₦{d.grantValueCapNgn.toLocaleString()} used
                      </span>
                    </div>
                  ) : (
                    <span className="text-neutral-600">— none issued</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.data.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">No one has signed up through this referral link yet.</p>
      )}

      <Pagination basePath={`/dashboard/referrals/${merchantId}`} page={currentPage} totalPages={totalPages} />
    </div>
  );
}
