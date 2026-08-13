import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "About" };

const VALUES = [
  {
    title: "Solid material",
    body: "Hardwoods sourced from regional mills — no veneer, no particleboard. What you see is what holds the joint.",
  },
  {
    title: "Hand-cut joinery",
    body: "Mortise and tenon, dovetails, and draw-bored pegs where they belong — fasteners are a last resort, not a first one.",
  },
  {
    title: "Built to be repaired",
    body: "Pieces are finished so that scratches, water rings, and years of use can be sanded out and refinished, not thrown out.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-grain border-b border-line bg-linear-to-b from-panel to-paper">
        <Container>
          <div className="mx-auto max-w-2xl py-20 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-walnut">The maker&apos;s story</p>
            <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
              Placeholder — a short story about how this workshop started.
            </h1>
            <p className="mt-5 text-lg text-ink-2">
              This paragraph should be replaced with a real, first-person account of who&apos;s building these
              pieces, why, and what a customer is actually paying for when they buy something handmade instead of
              something off a shelf.
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <section className="py-16">
          <div className="mx-auto max-w-2xl space-y-6 text-ink-2">
            <p>
              Placeholder copy: a couple of paragraphs on the workshop&apos;s background — where it&apos;s based,
              how long it&apos;s been running, what kind of space the work happens in, and what got the maker
              started with woodworking in the first place.
            </p>
            <p>
              Placeholder copy: a note on process — how a typical piece goes from rough lumber to a finished
              product, roughly how long that takes, and what makes the approach here different from
              mass-produced furniture.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-ui border border-line bg-paper p-6 shadow-ui-sm">
                <h2 className="font-serif text-lg font-medium text-ink">{value.title}</h2>
                <p className="mt-2 text-sm text-ink-2">{value.body}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-14 flex max-w-2xl flex-col items-center gap-4 text-center">
            <p className="text-ink-2">Have a piece in mind, or a question about a commission?</p>
            <Link href="/contact">
              <Button>Get in touch</Button>
            </Link>
          </div>
        </section>
      </Container>
    </>
  );
}
