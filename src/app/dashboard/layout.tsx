import Link from "next/link";
import LogoutButton from "./logout-button";

const NAV_ITEMS = [
  { href: "/dashboard/merchants", label: "Merchants & KYC" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/access-grants", label: "Access Grants" },
  { href: "/dashboard/email-campaigns", label: "Email Campaigns" },
  { href: "/dashboard/groups", label: "Groups" },
  { href: "/dashboard/referrals", label: "Referrals" },
  { href: "/dashboard/revenue", label: "Revenue" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-50">
      <aside className="w-60 shrink-0 border-r border-neutral-800 p-5">
        <h1 className="mb-8 text-lg font-semibold">ChatPay Admin</h1>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-neutral-300 transition hover:bg-neutral-800 hover:text-neutral-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
