"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-md border border-neutral-700 px-3 py-2 text-left text-sm text-neutral-400 transition hover:border-neutral-600 hover:text-neutral-200"
    >
      Sign out
    </button>
  );
}
