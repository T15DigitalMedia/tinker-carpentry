"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createTagAction } from "@/app/admin/(dashboard)/tags/actions";

export function NewTagForm() {
  const [state, formAction, isPending] = useActionState(createTagAction, undefined);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <label className="flex flex-col gap-1 text-sm text-ink-2">
        New tag
        <input
          type="text"
          name="name"
          required
          placeholder="Reclaimed oak"
          className="rounded-ui border border-line-strong bg-panel px-3 py-2 text-sm text-ink"
        />
      </label>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add tag"}
      </Button>
      {state?.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  );
}
