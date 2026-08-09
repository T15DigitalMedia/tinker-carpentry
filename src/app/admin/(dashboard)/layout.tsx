import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { AdminSignOutButton } from "@/components/admin/sign-out-button";
import { AdminNavLink } from "@/components/admin/admin-nav-link";

const adminNavLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/reports", label: "Reports" },
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
      <header className="bg-grain bg-grain-dark sticky top-0 z-40 border-b border-black/10 bg-cover shadow-ui-md">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="font-mono text-xs uppercase tracking-wider text-paper">
                Admin portal
              </span>
              <nav className="flex items-center gap-5">
                {adminNavLinks.map((link) => (
                  <AdminNavLink key={link.href} href={link.href}>
                    {link.label}
                  </AdminNavLink>
                ))}
              </nav>
            </div>
            <AdminSignOutButton />
          </div>
        </Container>
      </header>
      <Container>
        <div className="py-12">{children}</div>
      </Container>
    </div>
  );
}
