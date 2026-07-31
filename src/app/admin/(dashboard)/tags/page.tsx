import { createClient } from "@/lib/supabase/server";
import { listTags } from "@/lib/tags";
import { NewTagForm } from "@/components/admin/new-tag-form";
import { deleteTagAction } from "./actions";

export default async function TagsPage() {
  const supabase = await createClient();
  const tags = await listTags(supabase);

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl font-medium text-ink">Tags</h1>

      <div className="mt-6">
        <NewTagForm />
      </div>

      <ul className="mt-8 flex flex-col gap-1">
        {tags.map((tag) => {
          const boundDelete = deleteTagAction.bind(null, tag.id);
          return (
            <li
              key={tag.id}
              className="flex items-center justify-between border-t border-line py-2 text-sm text-ink first:border-none"
            >
              {tag.name}
              <form action={boundDelete}>
                <button
                  type="submit"
                  className="font-mono text-xs uppercase tracking-wider text-red-700 hover:underline"
                >
                  Delete
                </button>
              </form>
            </li>
          );
        })}
        {tags.length === 0 && <li className="py-2 text-sm text-ink-3">No tags yet.</li>}
      </ul>
    </div>
  );
}
