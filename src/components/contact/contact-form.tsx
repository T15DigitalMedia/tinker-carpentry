"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { submitContactAction, type ContactState } from "@/app/contact/actions";

const inputClass =
  "w-full rounded-ui border border-line-strong bg-panel px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/25";
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-ink-2";
const errorClass = "text-xs text-red-700";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactState, FormData>(submitContactAction, undefined);
  const [startedAt] = useState(() => Date.now());
  const fieldErrors = state?.fieldErrors ?? {};

  if (state?.success) {
    return (
      <p className="rounded-ui border border-ok/40 bg-ok/10 p-4 text-sm text-ok">
        Thanks for reaching out — we&apos;ll get back to you within a couple of business days.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-ui border border-line bg-paper p-6 shadow-ui-sm">
      {state?.error && <p className={errorClass}>{state.error}</p>}

      <input type="hidden" name="startedAt" value={startedAt} />
      {/* Honeypot — hidden from sighted and screen-reader users, left open for bots. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className={labelClass}>
        Name
        <input type="text" name="name" required className={inputClass} />
        {fieldErrors.name && <span className={errorClass}>{fieldErrors.name[0]}</span>}
      </label>
      <label className={labelClass}>
        Email
        <input type="email" name="email" required className={inputClass} />
        {fieldErrors.email && <span className={errorClass}>{fieldErrors.email[0]}</span>}
      </label>
      <label className={labelClass}>
        Message
        <textarea name="message" rows={5} required minLength={10} maxLength={2000} className={inputClass} />
        {fieldErrors.message && <span className={errorClass}>{fieldErrors.message[0]}</span>}
      </label>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
