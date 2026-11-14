"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./logout-button";

const NAV_ITEMS = [
  { href: "/dashboard/merchants", label: "Merchants & KYC" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/buy-transactions", label: "Buy Transactions" },
  { href: "/dashboard/access-grants", label: "Access Grants" },
  { href: "/dashboard/email-campaigns", label: "Email Campaigns" },
  { href: "/dashboard/telegram-broadcast", label: "Telegram Broadcast" },
  { href: "/dashboard/groups", label: "Groups" },
  { href: "/dashboard/referrals", label: "Referrals" },
  { href: "/dashboard/revenue", label: "Revenue" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-2 text-sm text-neutral-300 transition hover:bg-neutral-800 hover:text-neutral-50"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar - the fixed w-60 sidebar below is hidden under md:,
          so narrow screens need their own way in: a bar + off-canvas drawer. */}
      <div className="flex items-center justify-between border-b border-neutral-800 p-4 md:hidden">
        <h1 className="text-lg font-semibold">ChatPay Admin</h1>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md border border-neutral-700 p-2 text-neutral-300 hover:bg-neutral-800"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="relative flex h-full w-64 flex-col border-r border-neutral-800 bg-neutral-950 p-5">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-lg font-semibold">ChatPay Admin</h1>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-neutral-400 hover:text-neutral-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {navLinks}
            <div className="mt-8">
              <LogoutButton />
            </div>
          </aside>
        </div>
      )}

      {/* Desktop static sidebar - unchanged from before, just now gated to md: and up */}
      <aside className="hidden w-60 shrink-0 border-r border-neutral-800 p-5 md:flex md:flex-col">
        <h1 className="mb-8 text-lg font-semibold">ChatPay Admin</h1>
        {navLinks}
        <div className="mt-8">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
