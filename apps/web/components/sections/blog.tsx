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
      headingId={id}
      headingLevel={headingLevel}
      heading={content.heading}
      subheading={content.subheading}
    >
      {items.length === 0 ? (
        <EmptyState message="No posts published yet." />
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((post, index) => (
            <li key={post.id}>
              <PostCard post={post} delay={Math.min(index * 0.05, 0.3)} />
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
