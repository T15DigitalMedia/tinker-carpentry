"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ProductFormState } from "@/app/admin/(dashboard)/products/actions";

type ProductFormValues = {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  is_active: boolean;
  sale_price: number | null;
  made_to_order: boolean;
  lead_time_days: number | null;
  weight_g: number | null;
};

function centsToDollarsInput(cents: number | null | undefined) {
  return cents == null ? "" : (cents / 100).toFixed(2);
}

const inputClass =
  "w-full rounded-ui border border-line-strong bg-panel px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/25";
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-ink-2";
const errorClass = "text-xs text-red-700";
const checkboxClass = "h-4 w-4 accent-walnut";

export function ProductForm({
  action,
  product,
  allTags,
  selectedTagIds = [],
  submitLabel,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product?: ProductFormValues;
  allTags: { id: string; name: string }[];
  selectedTagIds?: string[];
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="flex max-w-2xl flex-col gap-5 rounded-ui border border-line bg-paper p-6 shadow-ui-sm"
    >
      {state?.error && <p className={errorClass}>{state.error}</p>}

      <label className={labelClass}>
        Name
        <input type="text" name="name" required defaultValue={product?.name} className={inputClass} />
        {fieldErrors.name && <span className={errorClass}>{fieldErrors.name[0]}</span>}
      </label>

      <label className={labelClass}>
        Slug
        <input
          type="text"
          name="slug"
          required
          defaultValue={product?.slug}
          placeholder="walnut-side-table"
          className={inputClass}
        />
        {fieldErrors.slug && <span className={errorClass}>{fieldErrors.slug[0]}</span>}
      </label>

      <label className={labelClass}>
        Description
        <textarea name="description" rows={4} defaultValue={product?.description ?? ""} className={inputClass} />
      </label>

      <div className="grid grid-cols-2 gap-5">
        <label className={labelClass}>
          Price (CAD)
          <input
            type="number"
            name="price"
            required
            step="0.01"
            min="0"
            defaultValue={centsToDollarsInput(product?.price)}
            className={inputClass}
          />
          {fieldErrors.price && <span className={errorClass}>{fieldErrors.price[0]}</span>}
        </label>
        <label className={labelClass}>
          Sale price (CAD, optional)
          <input
            type="number"
            name="sale_price"
            step="0.01"
            min="0"
            defaultValue={centsToDollarsInput(product?.sale_price)}
            className={inputClass}
          />
          {fieldErrors.sale_price && <span className={errorClass}>{fieldErrors.sale_price[0]}</span>}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <label className={labelClass}>
          Stock
          <input
            type="number"
            name="stock"
            required
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            className={inputClass}
          />
          {fieldErrors.stock && <span className={errorClass}>{fieldErrors.stock[0]}</span>}
        </label>
        <label className={labelClass}>
          Weight (grams, optional)
          <input
            type="number"
            name="weight_g"
            min="0"
            step="1"
            defaultValue={product?.weight_g ?? ""}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className={checkboxClass} />
        Listed (visible in the storefront)
      </label>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="made_to_order"
          defaultChecked={product?.made_to_order ?? false}
          className={checkboxClass}
        />
        Made to order
      </label>

      <label className={labelClass}>
        Lead time (days, if made to order)
        <input
          type="number"
          name="lead_time_days"
          min="0"
          step="1"
          defaultValue={product?.lead_time_days ?? ""}
          className={inputClass}
        />
      </label>

      {allTags.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm text-ink-2">Tags</legend>
          <div className="flex flex-wrap gap-3">
            {allTags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name="tags"
                  value={tag.id}
                  defaultChecked={selectedTagIds.includes(tag.id)}
                  className={checkboxClass}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
