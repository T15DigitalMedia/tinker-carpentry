import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug, getProductImages, LOW_STOCK_THRESHOLD } from "@/lib/products";
import { listProductTags } from "@/lib/tags";
import { getProductImageUrl } from "@/lib/storage";
import { formatPrice } from "@/lib/currency";
import { Container } from "@/components/ui/container";
import { ProductGallery } from "@/components/shop/product-gallery";
import { AddToCartForm } from "@/components/shop/add-to-cart-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const product = await getProductBySlug(supabase, slug);
  if (!product) return {};

  const description = product.description ?? `${product.name} — handmade carpentry from Tinker Carpentry.`;
  const images = await getProductImages(supabase, product.id);
  const primaryImage = images[0];
  const imageUrl = primaryImage ? getProductImageUrl(supabase, primaryImage.storage_path) : undefined;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  };
}

function getStockStatus(stock: number) {
  if (stock <= 0) {
    return { label: "Out of stock", tone: "border-open/40 bg-open/10 text-open" };
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return { label: `Only ${stock} left`, tone: "border-open/40 bg-open/10 text-open" };
  }
  return { label: "In stock", tone: "border-ok/40 bg-ok/10 text-ok" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const product = await getProductBySlug(supabase, slug);
  if (!product) notFound();

  const [images, tags] = await Promise.all([
    getProductImages(supabase, product.id),
    listProductTags(supabase, product.id),
  ]);

  const gallery = images.map((image) => ({
    url: getProductImageUrl(supabase, image.storage_path),
    alt: image.alt ?? product.name,
  }));

  const stockStatus = getStockStatus(product.stock);

  return (
    <Container>
      <div className="py-14">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-ink-3 transition-colors hover:text-ink"
        >
          <span aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Back to shop
        </Link>

        <div className="mt-8 grid gap-12 md:grid-cols-2">
          <ProductGallery images={gallery} fallbackAlt={product.name} />

          <div className="flex flex-col gap-6">
            <h1 className="font-serif text-4xl font-medium text-ink">{product.name}</h1>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-medium text-ink">
                {formatPrice(product.sale_price ?? product.price)}
              </span>
              {product.sale_price != null && (
                <span className="text-lg text-ink-3 line-through">{formatPrice(product.price)}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {product.made_to_order && (
                <span className="inline-flex w-fit items-center rounded-ui-sm border border-walnut/40 bg-walnut/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-walnut">
                  Made to order
                </span>
              )}
              <span
                className={`inline-flex w-fit items-center rounded-ui-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${stockStatus.tone}`}
              >
                {stockStatus.label}
              </span>
              {product.made_to_order && product.lead_time_days != null && (
                <span className="text-sm text-ink-2">
                  Ships in about {product.lead_time_days} day{product.lead_time_days === 1 ? "" : "s"}
                </span>
              )}
            </div>

            <AddToCartForm
              productId={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              salePrice={product.sale_price}
              imageUrl={gallery[0]?.url}
              stock={product.stock}
              madeToOrder={product.made_to_order}
            />

            {product.description && <p className="leading-relaxed text-ink-2">{product.description}</p>}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-line pt-6">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/shop?tag=${tag.slug}`}
                    className="rounded-ui-sm border border-line-strong px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-2 transition-colors hover:border-walnut hover:text-walnut"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
