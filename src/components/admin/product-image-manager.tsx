"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type ProductImage = {
  id: string;
  storage_path: string;
  alt: string | null;
  sort_order: number;
};

const BUCKET = "product-images";

function publicUrl(path: string) {
  const supabase = createClient();
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function ProductImageManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const [images, setImages] = useState(initialImages);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      let nextSortOrder = images.length > 0 ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;

      for (const file of Array.from(files)) {
        const path = `${productId}/${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
        if (uploadError) {
          setError(uploadError.message);
          continue;
        }

        const { data, error: insertError } = await supabase
          .from("product_images")
          .insert({ product_id: productId, storage_path: path, sort_order: nextSortOrder })
          .select("*")
          .single();

        if (insertError) {
          setError(insertError.message);
          continue;
        }

        setImages((prev) => [...prev, data]);
        nextSortOrder += 1;
      }

      e.target.value = "";
    });
  }

  function handleDelete(image: ProductImage) {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error: storageError } = await supabase.storage.from(BUCKET).remove([image.storage_path]);
      if (storageError) {
        setError(storageError.message);
        return;
      }
      const { error: deleteError } = await supabase.from("product_images").delete().eq("id", image.id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setImages((prev) => prev.filter((i) => i.id !== image.id));
    });
  }

  function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setImages(reordered);

    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const a = reordered[index];
      const b = reordered[targetIndex];
      const [{ error: errorA }, { error: errorB }] = await Promise.all([
        supabase.from("product_images").update({ sort_order: index }).eq("id", a.id),
        supabase.from("product_images").update({ sort_order: targetIndex }).eq("id", b.id),
      ]);
      if (errorA || errorB) setError((errorA ?? errorB)?.message ?? "Reorder failed");
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {error && <p className="text-xs text-red-700">{error}</p>}

      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicUrl(image.storage_path)}
              alt={image.alt ?? ""}
              className="aspect-square w-full rounded-ui border border-line object-cover"
            />
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-ink-3">
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={isPending || index === 0}
                  onClick={() => handleMove(index, -1)}
                  className="disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={isPending || index === images.length - 1}
                  onClick={() => handleMove(index, 1)}
                  className="disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(image)}
                className="text-red-700 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <label
        className={`inline-flex w-fit cursor-pointer items-center justify-center rounded-ui border border-line-strong px-4 py-2 text-sm font-medium text-ink hover:bg-panel ${isPending ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={isPending}
          className="hidden"
        />
        {isPending ? "Working..." : "Upload photos"}
      </label>
    </div>
  );
}
