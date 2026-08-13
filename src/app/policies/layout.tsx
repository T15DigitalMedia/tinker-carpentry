import Link from "next/link";
import { Container } from "@/components/ui/container";
import { policyLinks } from "@/components/layout/nav-links";

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <div className="grid gap-10 py-14 sm:grid-cols-[160px_1fr] sm:gap-12">
        <nav className="flex flex-row flex-wrap gap-x-6 gap-y-2 sm:flex-col sm:gap-2">
          {policyLinks
            .filter((link) => link.href.startsWith("/policies/"))
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-wider text-ink-2 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="max-w-2xl">{children}</div>
      </div>
    </Container>
  );
}
