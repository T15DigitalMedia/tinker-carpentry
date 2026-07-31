import Link from "next/link";
import { Container } from "@/components/ui/container";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-serif text-lg font-medium text-ink"
          >
            Tinker Carpentry
          </Link>
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-wider text-ink-2 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              className="font-mono text-xs uppercase tracking-wider text-ink-2 hover:text-ink"
            >
              Cart
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
