"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <Container>
      <div className="mx-auto flex max-w-sm flex-col gap-6 py-24">
        <h1 className="font-serif text-2xl font-medium text-ink">Admin sign in</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-ui border border-line bg-paper p-6 shadow-ui-md"
        >
          <label className="flex flex-col gap-1 text-sm text-ink-2">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-ui border border-line-strong bg-panel px-3 py-2.5 text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/25"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink-2">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-ui border border-line-strong bg-panel px-3 py-2.5 text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/25"
            />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </Container>
  );
}
