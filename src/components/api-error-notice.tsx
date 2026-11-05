export default function ApiErrorNotice({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-300">
      <p className="font-medium">Couldn&apos;t load this page</p>
      <p className="mt-1 text-red-400/80">{error}</p>
    </div>
  );
}
