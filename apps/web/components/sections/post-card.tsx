import Image from "next/image";
import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import type { SectionImage } from "./hero";
import type { AppLocale } from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/paths";

export interface PostCardItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: SectionImage | null;
}

export function PostCard({ post, locale }: { post: PostCardItem; locale: AppLocale }) {
  return (
      <Link
        href={localizePath(`/blog/${post.slug}`, locale)}
        className="glass-panel glow-primary group flex h-full flex-col rounded-xl p-6 transition-all duration-300 sm:p-8"
      >
        {post.coverImage ? (
          <div className="relative mb-4 aspect-4/3 w-full overflow-hidden rounded-lg">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.altText || post.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              placeholder={post.coverImage.blurDataUrl ? "blur" : undefined}
              blurDataURL={post.coverImage.blurDataUrl ?? undefined}
              className="object-cover"
            />
          </div>
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
      </Link>
  );
}
