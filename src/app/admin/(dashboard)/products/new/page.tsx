import { createClient } from "@/lib/supabase/server";
import { listTags } from "@/lib/tags";
import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "../actions";

export default async function NewProductPage() {
  const supabase = await createClient();
  const tags = await listTags(supabase);

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-ink">New product</h1>
      <div className="mt-6">
        <ProductForm action={createProductAction} allTags={tags} submitLabel="Create product" />
      </div>
    </div>
  );
}
