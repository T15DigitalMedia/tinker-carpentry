import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "FAQ & care" };

const FAQS = [
  {
    question: "Placeholder — do you take custom commissions?",
    answer:
      "Placeholder answer: yes/no, what kinds of pieces are typically taken on as commissions, and how to start that conversation (link to the contact page).",
  },
  {
    question: "Placeholder — how long does a made-to-order piece take?",
    answer:
      "Placeholder answer: a general lead-time range for made-to-order pieces, and a note that exact timing depends on the queue and the piece.",
  },
  {
    question: "Placeholder — do you ship, or is it pickup only?",
    answer:
      "Placeholder answer: describe delivery area / pickup location, and point to the shipping policy for the full details.",
  },
  {
    question: "Placeholder — what if I need to return or exchange something?",
    answer:
      "Placeholder answer: a short summary, with a pointer to the full returns policy for specifics on the window and condition requirements.",
  },
  {
    question: "Placeholder — what wood species and finishes do you work with?",
    answer:
      "Placeholder answer: the usual species stocked, whether custom species/finish requests are possible, and any lead-time impact.",
  },
];

const CARE_TIPS = [
  {
    title: "Everyday cleaning",
    body: "Placeholder: wipe with a soft, slightly damp cloth and dry immediately. Avoid all-purpose household cleaners and paper towels on finished surfaces.",
  },
  {
    title: "Heat, water & sunlight",
    body: "Placeholder: use coasters and trivets, wipe up spills promptly, and keep pieces out of direct sunlight and away from heat vents to prevent warping or fading.",
  },
  {
    title: "Oiled finishes",
    body: "Placeholder: re-oil every few months (or as needed) with a food-safe mineral or board oil once the surface starts to look dry.",
  },
  {
    title: "Scratches & wear",
    body: "Placeholder: light scratches can usually be sanded and re-finished — see the contact page if a piece needs a refresh.",
  },
];

export default function FaqPage() {
  return (
    <Container>
      <div className="mx-auto max-w-2xl py-14">
        <h1 className="font-serif text-3xl font-medium text-ink">FAQ &amp; care</h1>
        <p className="mt-3 text-ink-2">Common questions, plus how to look after a handmade piece so it lasts.</p>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-walnut">Frequently asked</h2>
          <div className="mt-4 divide-y divide-line rounded-ui border border-line bg-paper shadow-ui-sm">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink marker:content-none">
                  {faq.question}
                  <span className="shrink-0 text-ink-3 transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-ink-2">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-walnut">Care &amp; maintenance</h2>
          <p className="mt-3 text-ink-2">
            Every piece is finished to be used, not just looked at — a little routine care keeps it that way for
            years.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {CARE_TIPS.map((tip) => (
              <div key={tip.title} className="rounded-ui border border-line bg-paper p-5 shadow-ui-sm">
                <h3 className="font-serif text-base font-medium text-ink">{tip.title}</h3>
                <p className="mt-2 text-sm text-ink-2">{tip.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Container>
  );
}
