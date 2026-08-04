import Link from "next/link";
import { Container } from "@/components/ui/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { navLinks } from "@/components/layout/nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 shadow-ui-sm backdrop-blur-md">
      <Container>
        <div className="flex h-18 items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl font-medium text-ink"
          >
            Tinker Carpentry
          </Link>
          <nav className="hidden items-center gap-8 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-1 font-mono text-xs uppercase tracking-wider text-ink-2 hover:text-ink"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-walnut transition-transform duration-200 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
