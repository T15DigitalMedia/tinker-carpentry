"use client";

import { useState } from "react";
import Link from "next/link";
import { navLinks } from "@/components/layout/nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-ui border border-line-strong"
      >
        <span
          className={`block h-px w-4 bg-ink transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
        />
        <span className={`block h-px w-4 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
        <span
          className={`block h-px w-4 bg-ink transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <nav id="mobile-nav-panel" className="absolute inset-x-0 top-16 border-b border-line bg-paper">
          <ul className="flex flex-col divide-y divide-line px-5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-mono text-xs uppercase tracking-wider text-ink-2 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
