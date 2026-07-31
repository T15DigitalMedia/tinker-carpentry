"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { setProductTags } from "@/lib/products";
import { productSchema } from "@/lib/validation/product";

export type ProductFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof typeof productSchema.shape, string[]>>;
} | undefined;

function rawFromForm(formData: FormData) {
  return {
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    is_active: formData.get("is_active") === "on",
    sale_price: formData.get("sale_price"),
    made_to_order: formData.get("made_to_order") === "on",
    lead_time_days: formData.get("lead_time_days"),
    weight_g: formData.get("weight_g"),
  };
}

function toDbFields(data: ReturnType<typeof productSchema.parse>) {
  return {
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    price: Math.round(data.price * 100),
    stock: data.stock,
    is_active: data.is_active,
    sale_price: data.sale_price != null ? Math.round(data.sale_price * 100) : null,
    made_to_order: data.made_to_order,
    lead_time_days: data.lead_time_days ?? null,
    weight_g: data.weight_g ?? null,
  };
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = productSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(toDbFields(parsed.data))
    .select("id")
    .single();

  if (error) return { error: error.message };

  const tagIds = formData.getAll("tags").map(String);
  await setProductTags(supabase, data.id, tagIds);

  revalidatePath("/admin/products");
  redirect(`/admin/products/${data.id}`);
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = productSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(toDbFields(parsed.data))
    .eq("id", productId);

  if (error) return { error: error.message };

  const tagIds = formData.getAll("tags").map(String);
  await setProductTags(supabase, productId, tagIds);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
