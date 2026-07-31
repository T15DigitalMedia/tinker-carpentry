import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const LOW_STOCK_THRESHOLD = 3;

export type ProductSort = "name" | "price" | "stock";

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
