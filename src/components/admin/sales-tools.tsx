"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { SaleActionState } from "@/app/admin/(dashboard)/sales/actions";

type BoundAction = (prevState: SaleActionState, formData: FormData) => Promise<SaleActionState>;

const inputClass =
  "w-full rounded-ui border border-line-strong bg-panel px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/25";
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-ink-2";
const errorClass = "text-xs text-red-700";

function TagSelect({ tags }: { tags: { id: string; name: string }[] }) {
  return (
    <label className={labelClass}>
      Scope
      <select name="tagId" defaultValue="" className={inputClass}>
        <option value="">All active products</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SalesTools({
  tags,
  applyAction,
  clearAction,
}: {
  tags: { id: string; name: string }[];
  applyAction: BoundAction;
  clearAction: BoundAction;
}) {
  const [applyState, applyFormAction, isApplying] = useActionState(applyAction, undefined);
  const [clearState, clearFormAction, isClearing] = useActionState(clearAction, undefined);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        action={applyFormAction}
        className="flex flex-col gap-5 rounded-ui border border-line bg-paper p-6 shadow-ui-sm"
      >
        <h2 className="font-mono text-xs uppercase tracking-wider text-walnut">Apply a sale</h2>
        {applyState?.error && <p className={errorClass}>{applyState.error}</p>}
        {applyState?.message && <p className="text-xs text-ok">{applyState.message}</p>}

        <label className={labelClass}>
          Discount percent
          <input
            type="number"
            name="discountPercent"
            required
            min="1"
            max="100"
            step="1"
            placeholder="15"
            className={inputClass}
          />
        </label>

        <TagSelect tags={tags} />

        <label className={labelClass}>
          Ends (optional)
          <input type="date" name="expiresAt" className={inputClass} />
          <span className="text-xs text-ink-3">
            Left blank, the sale stays on until it&rsquo;s cleared manually.
          </span>
        </label>

        <Button type="submit" disabled={isApplying} className="self-start">
          {isApplying ? "Applying..." : "Apply sale"}
        </Button>
      </form>

      <form
        action={clearFormAction}
        className="flex flex-col gap-5 rounded-ui border border-line bg-paper p-6 shadow-ui-sm"
      >
        <h2 className="font-mono text-xs uppercase tracking-wider text-walnut">Clear a sale</h2>
        {clearState?.error && <p className={errorClass}>{clearState.error}</p>}
        {clearState?.message && <p className="text-xs text-ok">{clearState.message}</p>}

        <TagSelect tags={tags} />
        <p className="text-xs text-ink-3">
          Removes sale pricing from every matching product, even if it was set individually from the product form.
        </p>

        <Button type="submit" variant="secondary" disabled={isClearing} className="self-start">
          {isClearing ? "Clearing..." : "Clear active sales"}
        </Button>
      </form>
    </div>
  );
}
