import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { listStorefrontProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const products = await listStorefrontProducts(supabase, {});

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/shop/${product.slug}`,
    lastModified: product.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...productEntries,
  ];
}
