import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listStorefrontProducts, toProductCardData } from "@/lib/products";
import { ProductCard } from "@/components/shop/product-card";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const NEW_ARRIVALS_COUNT = 6;

export default async function Home() {
  const supabase = await createClient();

  // No admin-curated "featured" flag exists yet, so the landing page shows
  // newest active listings and is labeled accordingly. Swap for a real
  // featured flag (and rename the section) if the catalog wants one later.
  const newestProducts = await listStorefrontProducts(
    supabase,
    { sort: "newest" },
    { limit: NEW_ARRIVALS_COUNT },
  );
  const newArrivals = await toProductCardData(supabase, newestProducts);

  return (
    <>
      <section className="border-b border-line bg-panel">
        <Container>
          <div className="flex flex-col items-start gap-4 py-24">
            <p className="font-mono text-xs uppercase tracking-wider text-walnut">Handmade Carpentry</p>
            <h1 className="max-w-xl font-serif text-4xl font-medium text-ink sm:text-5xl">
              Built by hand, made to last.
            </h1>
            <p className="max-w-lg text-ink-2">
              Furniture and woodwork crafted one piece at a time — some ready to pick up, some made to order.
            </p>
            <Link href="/shop">
              <Button>Shop the catalog</Button>
            </Link>
          </div>
        </Container>
      </section>

      <Container>
        <section className="py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl font-medium text-ink">New arrivals</h2>
            <Link href="/shop" className="font-mono text-xs uppercase tracking-wider text-ink-3 hover:text-ink">
              View all →
            </Link>
          </div>

          {newArrivals.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {newArrivals.map(({ product, imageUrl, imageAlt }, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imageUrl={imageUrl}
                  imageAlt={imageAlt}
                  eagerLoad={index < 3}
                />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-ink-3">New pieces are on the way — check back soon.</p>
          )}
        </section>
      </Container>
    </>
  );
}
