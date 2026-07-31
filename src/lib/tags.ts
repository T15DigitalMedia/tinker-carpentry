import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export async function listTags(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("tags").select("*").order("name");
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
