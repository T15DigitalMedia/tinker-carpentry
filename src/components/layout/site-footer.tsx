import Link from "next/link";
import { Container } from "@/components/ui/container";
import { navLinks } from "@/components/layout/nav-links";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-grain bg-grain-dark border-t border-black/10 bg-cover text-paper/80">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <span className="font-serif text-xl font-medium text-paper">{SITE_NAME}</span>
            <p className="max-w-xs text-sm text-paper/70">{SITE_DESCRIPTION}</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-paper/50">Shop</span>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-paper/70 hover:text-paper">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-paper/50">The workshop</span>
            <p className="text-sm text-paper/70">
              Every piece is built by hand, one at a time — some ready to pick up, some made to order.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-paper/10 py-6 font-mono text-xs uppercase tracking-wider text-paper/50">
          <span>&copy; {new Date().getFullYear()} {SITE_NAME}</span>
          <span>Handmade, built to order</span>
        </div>
      </Container>
    </footer>
  );
}
