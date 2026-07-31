import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const LOW_STOCK_THRESHOLD = 3;

export type ProductSort = "name" | "price" | "stock";

// "newest" stands in for popularity until Phase 5 adds a real sales-count metric (see t5-5).
export type StorefrontSort = "name" | "price" | "newest";

type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];

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
  {
    search,
    tagSlug,
    minPrice,
    maxPrice,
    sort,
  }: {
    search?: string;
    tagSlug?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: StorefrontSort;
  },
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

  switch (sort) {
    case "price":
      query = query.order("price", { ascending: true });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "name":
    default:
      query = query.order("name", { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
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

export async function getProduct(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
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
