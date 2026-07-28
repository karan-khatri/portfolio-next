import { z } from "zod";
import { SectionType } from "@portfolio/db";
import type { FlatRevisionData, PageRevisionData } from "@portfolio/db/server";

export const flatRevisionDataSchema: z.ZodType<FlatRevisionData> = z.object({
  title: z.string(),
  excerpt: z.string().nullish(),
  body: z.string().nullish(),
  coverImageId: z.string().nullish(),
  tagIds: z.array(z.string()).optional(),
  codeRepository: z.string().nullish(),
  liveUrl: z.string().nullish(),
  authorId: z.string().nullish(),
});

export const pageRevisionDataSchema: z.ZodType<PageRevisionData> = z.object({
  title: z.string(),
  sections: z.array(
    z.object({
      type: z.nativeEnum(SectionType),
      order: z.number(),
      enabled: z.boolean(),
      content: z.unknown(),
    }),
  ),
});
