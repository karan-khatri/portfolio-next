import type { SectionType } from "@portfolio/db";

export interface ComposerSection {
  clientId: string;
  type: SectionType;
  order: number;
  enabled: boolean;
  content: Record<string, unknown>;
}
