"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-4 rounded-lg border border-neutral-600 bg-neutral-800 px-6 py-3 text-sm font-bold uppercase tracking-wider text-neutral-400 transition-colors hover:border-red-500 hover:text-red-400 cursor-pointer"
    >
      Logout
    </button>
  );
}
