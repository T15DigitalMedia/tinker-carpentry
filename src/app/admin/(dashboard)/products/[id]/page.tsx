import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProduct, getProductImages, getProductTagIds } from "@/lib/products";
import { listTags } from "@/lib/tags";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { updateProductAction, deleteProductAction } from "../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  let product;
  try {
    product = await getProduct(supabase, id);
  } catch {
    notFound();
  }

  const [tags, selectedTagIds, images] = await Promise.all([
    listTags(supabase),
    getProductTagIds(supabase, id),
    getProductImages(supabase, id),
  ]);

  const boundUpdate = updateProductAction.bind(null, id);
  const boundDelete = deleteProductAction.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-medium text-ink">{product.name}</h1>
        <form action={boundDelete}>
          <button
            type="submit"
            className="font-mono text-xs uppercase tracking-wider text-red-700 hover:underline"
          >
            Delete
          </button>
        </form>
      </div>

      <div className="mt-6">
        <ProductForm
          action={boundUpdate}
          product={product}
          allTags={tags}
          selectedTagIds={selectedTagIds}
          submitLabel="Save changes"
        />
      </div>

      <div className="mt-10 max-w-2xl rounded-ui border border-line bg-paper p-6 shadow-ui-sm">
        <h2 className="font-serif text-xl font-medium text-ink">Photos</h2>
        <ProductImageManager productId={id} initialImages={images} />
      </div>
    </div>
  );
}
