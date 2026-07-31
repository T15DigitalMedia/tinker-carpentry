"use server";

import { createClient } from "@/lib/supabase/server";
import { listStorefrontProductsPage, toProductCardData, type StorefrontFilters } from "@/lib/products";

export async function loadMoreProducts(filters: StorefrontFilters, offset: number) {
  const supabase = await createClient();
  const { products, hasMore } = await listStorefrontProductsPage(supabase, filters, offset);
  const cards = await toProductCardData(supabase, products);
  return { cards, hasMore };
}
