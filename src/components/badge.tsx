const COLORS: Record<string, string> = {
  verified: "bg-lime-400/10 text-lime-400 border-lime-400/30",
  active: "bg-lime-400/10 text-lime-400 border-lime-400/30",
  completed: "bg-lime-400/10 text-lime-400 border-lime-400/30",
  pending: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  pending_claim: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  processing: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  rejected: "bg-red-400/10 text-red-400 border-red-400/30",
  failed: "bg-red-400/10 text-red-400 border-red-400/30",
  revoked: "bg-red-400/10 text-red-400 border-red-400/30",
  expired: "bg-neutral-400/10 text-neutral-400 border-neutral-400/30",
  expired_needs_kyc: "bg-orange-400/10 text-orange-400 border-orange-400/30",
  not_started: "bg-neutral-400/10 text-neutral-400 border-neutral-400/30",
  cancelled: "bg-neutral-400/10 text-neutral-400 border-neutral-400/30",
  refunded: "bg-neutral-400/10 text-neutral-400 border-neutral-400/30",
};

export default function Badge({ status }: { status: string }) {
  const classes = COLORS[status] || "bg-neutral-400/10 text-neutral-400 border-neutral-400/30";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
