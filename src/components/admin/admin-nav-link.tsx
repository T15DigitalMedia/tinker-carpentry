"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AdminNavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`font-mono text-xs uppercase tracking-wider transition-colors ${
        isActive ? "text-paper" : "text-paper/60 hover:text-paper"
      }`}
    >
      {children}
    </Link>
  );
}
