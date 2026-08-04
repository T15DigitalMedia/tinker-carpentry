import { createClient } from "@/lib/supabase/server";
import { listTags } from "@/lib/tags";
import { NewTagForm } from "@/components/admin/new-tag-form";
import { deleteTagAction } from "./actions";

export default async function TagsPage() {
  const supabase = await createClient();
  const tags = await listTags(supabase);

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-3xl font-medium text-ink">Tags</h1>

      <div className="mt-6 rounded-ui border border-line bg-paper p-5 shadow-ui-sm">
        <NewTagForm />
      </div>

      <ul className="mt-6 flex flex-col overflow-hidden rounded-ui border border-line bg-paper shadow-ui-sm">
        {tags.map((tag) => {
          const boundDelete = deleteTagAction.bind(null, tag.id);
          return (
            <li
              key={tag.id}
              className="flex items-center justify-between border-b border-line px-5 py-3 text-sm text-ink last:border-none hover:bg-panel/60"
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
        {tags.length === 0 && <li className="px-5 py-4 text-sm text-ink-3">No tags yet.</li>}
      </ul>
    </div>
  );
}
