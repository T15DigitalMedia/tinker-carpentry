import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <Container>
      <div className="flex flex-col items-center gap-3 py-32 text-center">
        <h1 className="font-serif text-4xl font-medium text-ink">
          Tinker Carpentry
        </h1>
        <p className="text-ink-2">Handmade carpentry, coming soon.</p>
      </div>
    </Container>
  );
}
