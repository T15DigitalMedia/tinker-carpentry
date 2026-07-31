import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { AdminSignOutButton } from "@/components/admin/sign-out-button";

const adminNavLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/tags", label: "Tags" },
];

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
            <div className="flex items-center gap-6">
              <span className="font-mono text-xs uppercase tracking-wider text-paper">
                Admin portal
              </span>
              <nav className="flex items-center gap-4">
                {adminNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-mono text-xs uppercase tracking-wider text-paper/70 hover:text-paper"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
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
