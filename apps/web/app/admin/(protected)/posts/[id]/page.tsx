import { notFound } from "next/navigation";
import { prisma, getLatestRevision, type FlatRevisionData } from "@portfolio/db/server";
import { PostEditor } from "@/components/admin/post-editor";
import { toMediaPickerValue, type MediaPickerValue } from "@/lib/admin/media";

export default async function PostEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { tags: true, seo: true, coverImage: true },
  });
  if (!post) notFound();

  const authors = await prisma.author.findMany({ orderBy: { name: "asc" } });
  const latestDraft = await getLatestRevision("Post", id, "DRAFT");

  let title = post.title;
  let excerpt = post.excerpt ?? "";
  let body = post.body ?? "";
  let tagNames = post.tags.map((tag) => tag.name);
  let coverImage: MediaPickerValue | null = post.coverImage
    ? toMediaPickerValue(post.coverImage)
    : null;
  let authorId = post.authorId;

  if (latestDraft) {
    const data = latestDraft.data as unknown as FlatRevisionData;
    title = data.title;
    excerpt = data.excerpt ?? "";
    body = data.body ?? "";
    authorId = data.authorId ?? null;
    if (data.tagIds) {
      const draftTags = await prisma.tag.findMany({ where: { id: { in: data.tagIds } } });
      tagNames = draftTags.map((tag) => tag.name);
    }
    if (data.coverImageId !== undefined) {
      const media = data.coverImageId
        ? await prisma.media.findUnique({ where: { id: data.coverImageId } })
        : null;
      coverImage = media ? toMediaPickerValue(media) : null;
    }
  }

  return (
    <PostEditor
      postId={post.id}
      postStatus={post.status}
      hasDraft={Boolean(latestDraft)}
      authors={authors}
      initial={{ title, excerpt, body, tags: tagNames, coverImage, authorId }}
      seo={{
        metaTitle: post.seo?.metaTitle ?? null,
        metaDescription: post.seo?.metaDescription ?? null,
        canonicalUrl: post.seo?.canonicalUrl ?? null,
        noindex: post.seo?.noindex ?? false,
        nofollow: post.seo?.nofollow ?? false,
      }}
    />
  );
}
