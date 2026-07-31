import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const PRODUCT_IMAGES_BUCKET = "product-images";

export function getProductImageUrl(supabase: SupabaseClient<Database>, path: string) {
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}
