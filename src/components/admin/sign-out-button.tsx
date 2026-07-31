"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="font-mono text-xs uppercase tracking-wider text-paper/80 hover:text-paper"
    >
      Sign out
    </button>
  );
}
