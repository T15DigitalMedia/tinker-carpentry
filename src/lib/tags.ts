import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export async function listTags(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function listProductTags(supabase: SupabaseClient<Database>, productId: string) {
  const { data: joins, error: joinError } = await supabase
    .from("product_tags")
    .select("tag_id")
    .eq("product_id", productId);
  if (joinError) throw joinError;

  const tagIds = joins.map((row) => row.tag_id);
  if (tagIds.length === 0) return [];

  const { data, error } = await supabase.from("tags").select("*").in("id", tagIds).order("name");
  if (error) throw error;
  return data;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
