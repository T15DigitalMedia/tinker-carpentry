import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { navLinks } from "@/components/layout/nav-links";

export function SiteHeader() {
  return (
    <header className="relative border-b border-line bg-paper">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-serif text-lg font-medium text-ink"
          >
            Tinker Carpentry
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-wider text-ink-2 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
