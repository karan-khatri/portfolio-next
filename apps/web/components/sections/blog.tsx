import type { BlogContent } from "@portfolio/sections";
import { SectionShell } from "./section-shell";
import { EmptyState } from "./empty-state";
import { PostCard, type PostCardItem } from "./post-card";

export type PostListItem = PostCardItem;

export function BlogSection({
  id,
  content,
  headingLevel,
  items,
}: {
  id: string;
  content: BlogContent;
  headingLevel: 2 | 3;
  items: PostListItem[];
}) {
  return (
    <SectionShell
      eyebrow="Writing"
      id={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
      showEyebrow={content.showEyebrow}
      headingAlign={content.headingAlign}
    >
      {items.length === 0 ? (
        <EmptyState message="No posts published yet." />
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
