import type { BlogContent } from "@portfolio/sections";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";
import { PostCard, type PostCardItem } from "./post-card";
import type { AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export type PostListItem = PostCardItem;

export function BlogSection({
  locale,
  id,
  content,
  headingLevel,
  items,
}: {
  locale: AppLocale;
  id: string;
  content: BlogContent;
  headingLevel: 1 | 2 | 3;
  items: PostListItem[];
}) {
  const t = getDictionary(locale);

  return (
    <SectionShell
      eyebrow={t.eyebrow.writing}
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message={t.empty.posts} />
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((post) => (
            <li key={post.id}>
              <PostCard locale={locale} post={post} />
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
