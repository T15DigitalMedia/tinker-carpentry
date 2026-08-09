import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getProductImageUrl } from "@/lib/storage";

export const LOW_STOCK_THRESHOLD = 3;
export const STOREFRONT_PAGE_SIZE = 12;

export type ProductSort = "name" | "price" | "stock";

// "newest" (by created_at) powers the homepage's "New arrivals" section
// (src/app/page.tsx) — a genuinely recency-based listing, not a stand-in.
// "popularity" (by sales_count, see t5-5) is what the shop page's sort
// dropdown offers shoppers instead.
export type StorefrontSort = "name" | "price" | "newest" | "popularity";

export type StorefrontFilters = {
  search?: string;
  tagSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: StorefrontSort;
};

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];

// Sitewide/seasonal sales (t5-6) write onto sale_price/sale_expires_at in
// bulk (see apply_bulk_sale) rather than clearing them when a sale ends —
// this is the lazy-expiry check, so every customer-facing price read goes
// through it instead of trusting a possibly-stale sale_price directly.
// Admin views intentionally read product.sale_price raw, not through this,
// since the admin needs to see/edit what's actually stored.
export function effectiveSalePrice(product: Pick<ProductRow, "sale_price" | "sale_expires_at">): number | null {
  if (product.sale_price == null) return null;
  if (product.sale_expires_at != null && new Date(product.sale_expires_at) <= new Date()) return null;
  return product.sale_price;
}

export type ProductCardData = {
  product: ProductRow;
  imageUrl?: string;
  imageAlt: string;
};

export async function listProducts(
  supabase: SupabaseClient<Database>,
  { search, sort }: { search?: string; sort?: ProductSort },
) {
  let query = supabase.from("products").select("*");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const sortColumn = sort ?? "name";
  query = query.order(sortColumn, { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listStorefrontProducts(
  supabase: SupabaseClient<Database>,
  { search, tagSlug, minPrice, maxPrice, sort }: StorefrontFilters,
  { limit, offset }: { limit?: number; offset?: number } = {},
) {
  let query = supabase.from("products").select("*").eq("is_active", true);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  if (minPrice != null) {
    query = query.gte("price", minPrice);
  }
  if (maxPrice != null) {
    query = query.lte("price", maxPrice);
  }
  if (tagSlug) {
    const productIds = await getProductIdsForTagSlug(supabase, tagSlug);
    if (productIds.length === 0) return [];
    query = query.in("id", productIds);
  }

  // "id" is a stable tiebreaker so paginated pages don't skip or repeat rows
  // that share a sort value (e.g. two products at the same price).
  switch (sort) {
    case "price":
      query = query.order("price", { ascending: true }).order("id", { ascending: true });
      break;
    case "popularity":
      query = query.order("sales_count", { ascending: false }).order("id", { ascending: true });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false }).order("id", { ascending: true });
      break;
    case "name":
    default:
      query = query.order("name", { ascending: true }).order("id", { ascending: true });
  }

  if (limit != null) {
    const from = offset ?? 0;
    query = query.range(from, from + limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listStorefrontProductsPage(
  supabase: SupabaseClient<Database>,
  filters: StorefrontFilters,
  offset: number,
) {
  const rows = await listStorefrontProducts(supabase, filters, {
    limit: STOREFRONT_PAGE_SIZE + 1,
    offset,
  });
  const hasMore = rows.length > STOREFRONT_PAGE_SIZE;
  return { products: rows.slice(0, STOREFRONT_PAGE_SIZE), hasMore };
}

export async function toProductCardData(
  supabase: SupabaseClient<Database>,
  products: ProductRow[],
): Promise<ProductCardData[]> {
  const primaryImages = await listPrimaryProductImages(
    supabase,
    products.map((product) => product.id),
  );

  return products.map((product) => {
    const image = primaryImages[product.id];
    return {
      product,
      imageUrl: image ? getProductImageUrl(supabase, image.storage_path) : undefined,
      imageAlt: image?.alt ?? product.name,
    };
  });
}

async function getProductIdsForTagSlug(supabase: SupabaseClient<Database>, tagSlug: string) {
  const { data: tag, error: tagError } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", tagSlug)
    .maybeSingle();
  if (tagError) throw tagError;
  if (!tag) return [];

  const { data, error } = await supabase
    .from("product_tags")
    .select("product_id")
    .eq("tag_id", tag.id);
  if (error) throw error;
  return data.map((row) => row.product_id);
}

export async function listProductsOnSale(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .not("sale_price", "is", null)
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getProductsByIds(supabase: SupabaseClient<Database>, productIds: string[]) {
  if (productIds.length === 0) return [];

  const { data, error } = await supabase.from("products").select("*").in("id", productIds);
  if (error) throw error;
  return data;
}

export async function getProduct(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getProductBySlug(supabase: SupabaseClient<Database>, slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProductImages(supabase: SupabaseClient<Database>, productId: string) {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function listPrimaryProductImages(
  supabase: SupabaseClient<Database>,
  productIds: string[],
): Promise<Record<string, ProductImageRow>> {
  if (productIds.length === 0) return {};

  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .in("product_id", productIds)
    .order("product_id", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const primaryByProduct: Record<string, ProductImageRow> = {};
  for (const image of data) {
    if (!(image.product_id in primaryByProduct)) {
      primaryByProduct[image.product_id] = image;
    }
  }
  return primaryByProduct;
}

export async function getProductTagIds(supabase: SupabaseClient<Database>, productId: string) {
  const { data, error } = await supabase
    .from("product_tags")
    .select("tag_id")
    .eq("product_id", productId);
  if (error) throw error;
  return data.map((row) => row.tag_id);
}

export async function setProductTags(
  supabase: SupabaseClient<Database>,
  productId: string,
  tagIds: string[],
) {
  const { error: deleteError } = await supabase
    .from("product_tags")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  if (tagIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("product_tags")
    .insert(tagIds.map((tagId) => ({ product_id: productId, tag_id: tagId })));
  if (insertError) throw insertError;
}
