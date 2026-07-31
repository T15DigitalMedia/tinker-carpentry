import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-panel">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 py-8 font-mono text-xs uppercase tracking-wider text-ink-3">
          <span>&copy; {new Date().getFullYear()} Tinker Carpentry</span>
          <span>Handmade, built to order</span>
        </div>
      </Container>
    </footer>
  );
}
