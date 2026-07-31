import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { AdminSignOutButton } from "@/components/admin/sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-panel">
      <header className="border-b border-line bg-cover">
        <Container>
          <div className="flex h-14 items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-paper">
              Admin portal
            </span>
            <AdminSignOutButton />
          </div>
        </Container>
      </header>
      <Container>
        <div className="py-10">{children}</div>
      </Container>
    </div>
  );
}
