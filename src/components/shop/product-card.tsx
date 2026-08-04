import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import type { Database } from "@/lib/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export function ProductCard({
  product,
  imageUrl,
  imageAlt,
  eagerLoad = false,
}: {
  product: Product;
  imageUrl?: string;
  imageAlt: string;
  eagerLoad?: boolean;
}) {
  const outOfStock = product.stock <= 0 && !product.made_to_order;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-ui border border-line bg-panel shadow-ui-sm transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-ui-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-paper-2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading={eagerLoad ? "eager" : "lazy"}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-wider text-ink-3">
            No photo
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-ui-sm bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-paper shadow-ui-sm">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="font-serif text-lg font-medium text-ink">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="font-medium text-ink">{formatPrice(product.sale_price ?? product.price)}</span>
          {product.sale_price != null && (
            <span className="text-sm text-ink-3 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        {product.made_to_order && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">Made to order</span>
        )}
      </div>
    </Link>
  );
}
