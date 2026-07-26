import { LuArrowUpRight } from "react-icons/lu";
import type { SectionImage } from "./hero";

export interface PostCardItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: SectionImage | null;
}

export function PostCard({ post }: { post: PostCardItem }) {
  return (
      <a
        href={`/blog/${post.slug}`}
        className="glass-panel glow-primary group flex h-full flex-col rounded-xl p-6 transition-all duration-300 sm:p-8"
      >
        {post.coverImage ? (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.altText ?? ""}
            className="mb-4 aspect-4/3 w-full rounded-lg object-cover"
          />
        ) : null}
        <span className="flex items-start justify-between gap-2 font-heading text-xl font-medium">
          {post.title}
          <LuArrowUpRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
      </a>
  );
}
