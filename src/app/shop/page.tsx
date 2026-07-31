import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listStorefrontProductsPage, toProductCardData, type StorefrontFilters, type StorefrontSort } from "@/lib/products";
import { listTags } from "@/lib/tags";
import { InfiniteProductGrid } from "@/components/shop/infinite-product-grid";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse handmade carpentry — filter by price, tag, or name.",
};

type ShopSearchParams = {
  q?: string;
  tag?: string;
  min?: string;
  max?: string;
  sort?: string;
};

const sortLinks: { label: string; value: StorefrontSort }[] = [
  { label: "Name", value: "name" },
  { label: "Price", value: "price" },
  { label: "Newest", value: "newest" },
];

const inputClass = "rounded-ui border border-line-strong bg-panel px-3 py-2 text-sm text-ink";
const labelClass = "font-mono text-xs uppercase tracking-wider text-ink-3";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const { q, tag, min, max, sort } = await searchParams;
  const supabase = await createClient();

  const minPrice = min ? Math.round(Number(min) * 100) : undefined;
  const maxPrice = max ? Math.round(Number(max) * 100) : undefined;

  const filters: StorefrontFilters = {
    search: q,
    tagSlug: tag,
    minPrice: minPrice != null && Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: maxPrice != null && Number.isFinite(maxPrice) ? maxPrice : undefined,
    sort: sort as StorefrontSort | undefined,
  };

  const [{ products, hasMore }, tags] = await Promise.all([
    listStorefrontProductsPage(supabase, filters, 0),
    listTags(supabase),
  ]);

  const initialCards = await toProductCardData(supabase, products);

  function buildHref(overrides: Partial<ShopSearchParams>) {
    const merged = { q, tag, min, max, sort, ...overrides };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  }

  return (
    <Container>
      <div className="py-10">
        <h1 className="font-serif text-3xl font-medium text-ink">Shop</h1>
        <p className="mt-2 text-ink-2">Handmade carpentry, made to order and ready-made.</p>

        <form className="mt-8 flex flex-wrap items-end gap-4" method="get">
          <div className="flex flex-col gap-1">
            <label htmlFor="q" className={labelClass}>
              Search
            </label>
            <input
              id="q"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Product name..."
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="tag" className={labelClass}>
              Tag
            </label>
            <select id="tag" name="tag" defaultValue={tag ?? ""} className={inputClass}>
              <option value="">All</option>
              {tags.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="min" className={labelClass}>
              Min price
            </label>
            <input
              id="min"
              type="number"
              name="min"
              min="0"
              step="0.01"
              defaultValue={min}
              className={`w-28 ${inputClass}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="max" className={labelClass}>
              Max price
            </label>
            <input
              id="max"
              type="number"
              name="max"
              min="0"
              step="0.01"
              defaultValue={max}
              className={`w-28 ${inputClass}`}
            />
          </div>
          {sort && <input type="hidden" name="sort" value={sort} />}
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-ink-3">
          Sort:
          {sortLinks.map((s) => (
            <Link
              key={s.value}
              href={buildHref({ sort: s.value })}
              className={sort === s.value || (!sort && s.value === "name") ? "text-walnut" : "hover:text-ink"}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <InfiniteProductGrid
          key={`${q ?? ""}|${tag ?? ""}|${min ?? ""}|${max ?? ""}|${sort ?? ""}`}
          initialCards={initialCards}
          initialHasMore={hasMore}
          filters={filters}
        />
      </div>
    </Container>
  );
}
