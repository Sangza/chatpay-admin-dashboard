import Link from "next/link";

export default function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-neutral-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {prevDisabled ? (
          <span className="rounded-md border border-neutral-800 px-3 py-1.5 text-neutral-600">Previous</span>
        ) : (
          <Link
            href={`${basePath}?page=${page - 1}`}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-neutral-300 hover:border-neutral-500"
          >
            Previous
          </Link>
        )}
        {nextDisabled ? (
          <span className="rounded-md border border-neutral-800 px-3 py-1.5 text-neutral-600">Next</span>
        ) : (
          <Link
            href={`${basePath}?page=${page + 1}`}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-neutral-300 hover:border-neutral-500"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
