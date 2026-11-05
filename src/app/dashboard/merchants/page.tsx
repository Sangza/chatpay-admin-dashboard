import { backendFetch, BackendApiError } from "@/lib/backend";
import Badge from "@/components/badge";
import Pagination from "@/components/pagination";
import ApiErrorNotice from "@/components/api-error-notice";
import KycActions from "./kyc-actions";

interface KycEntry {
  verificationIndex: number;
  kycStatus: string;
  kycProviderId: string;
  kycProviderType: string;
  kycType?: string;
  submittedAt?: string;
}

interface MerchantRow {
  merchantId: string;
  email: string;
  businessName: string;
  fullname: string;
  contactNumber?: string;
  createdAt: string;
  personalKycVerifications: KycEntry[];
  businessKycVerifications: KycEntry[];
}

interface KycListResponse {
  merchants: MerchantRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function latest(entries: KycEntry[]): KycEntry | undefined {
  return entries[entries.length - 1];
}

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  let data: KycListResponse | null = null;
  let errorMessage: string | null = null;
  try {
    data = await backendFetch<KycListResponse>(
      `/admin/kyc?page=${currentPage}&limit=20&status=all`,
    );
  } catch (err) {
    errorMessage =
      err instanceof BackendApiError
        ? `(${err.status}) ${err.message}`
        : err instanceof Error
          ? err.message
          : "Unknown error";
  }

  if (errorMessage || !data) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold">Merchants & KYC</h1>
        <ApiErrorNotice error={errorMessage ?? "No data returned."} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Merchants & KYC</h1>
      <p className="mb-6 text-sm text-neutral-400">
        {data.pagination.total} merchants total
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Personal KYC</th>
              <th className="px-4 py-3">Business KYC</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.merchants.map((m) => {
              const personal = latest(m.personalKycVerifications);
              const business = latest(m.businessKycVerifications);
              return (
                <tr key={m.merchantId} className="border-t border-neutral-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{m.businessName}</div>
                    <div className="text-neutral-500">{m.fullname}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    <div>{m.email}</div>
                    <div>{m.contactNumber || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    {personal ? <Badge status={personal.kycStatus} /> : <span className="text-neutral-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {business ? <Badge status={business.kycStatus} /> : <span className="text-neutral-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <KycActions merchantId={m.merchantId} hasPersonal={!!personal} hasBusiness={!!business} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.merchants.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">No merchants found.</p>
      )}

      <Pagination basePath="/dashboard/merchants" page={data.pagination.page} totalPages={data.pagination.totalPages} />
    </div>
  );
}
