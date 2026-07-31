"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { loadMoreProducts } from "@/app/shop/actions";
import type { ProductCardData, StorefrontFilters } from "@/lib/products";

// Render with a `key` derived from the active filters (see ShopPage) so a new
// search/sort/filter combination remounts this component with fresh initial
// props instead of syncing state from props in an effect.
export function InfiniteProductGrid({
  initialCards,
  initialHasMore,
  filters,
}: {
  initialCards: ProductCardData[];
  initialHasMore: boolean;
  filters: StorefrontFilters;
}) {
  const [cards, setCards] = useState(initialCards);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isPending) {
          startTransition(async () => {
            const next = await loadMoreProducts(filters, cards.length);
            setCards((prev) => [...prev, ...next.cards]);
            setHasMore(next.hasMore);
          });
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isPending, filters, cards.length]);

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ product, imageUrl, imageAlt }, index) => (
          <ProductCard
            key={product.id}
            product={product}
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            eagerLoad={index < 3}
          />
        ))}
        {cards.length === 0 && (
          <p className="col-span-full py-12 text-center text-ink-3">No products match your filters.</p>
        )}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-10">
          <span className="font-mono text-xs uppercase tracking-wider text-ink-3">
            {isPending ? "Loading more..." : ""}
          </span>
        </div>
      )}
    </>
  );
}
