"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/tags";
import { tagSchema } from "@/lib/validation/tag";

export type TagFormState = { error?: string } | undefined;

export async function createTagAction(
  _prevState: TagFormState,
  formData: FormData,
): Promise<TagFormState> {
  const parsed = tagSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid name" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert({
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/tags");
  return {};
}

export async function deleteTagAction(tagId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", tagId);
  if (error) throw error;
  revalidatePath("/admin/tags");
}
