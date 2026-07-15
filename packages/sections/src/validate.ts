import { SectionType } from "@portfolio/db";
import { sectionRegistry } from "./registry";

export class SectionValidationError extends Error {
  constructor(
    public readonly type: SectionType,
    public readonly issues: string[],
  ) {
    super(`Invalid content for section type ${type}: ${issues.join("; ")}`);
    this.name = "SectionValidationError";
  }
}

export function validateSectionContent(
  type: SectionType,
  content: unknown,
): unknown {
  const def = sectionRegistry[type];
  const result = def.schema.safeParse(content);
  if (!result.success) {
    throw new SectionValidationError(
      type,
      result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    );
  }
  return result.data;
}
