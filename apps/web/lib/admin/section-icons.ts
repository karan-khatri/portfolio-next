import {
  BriefcaseIcon,
  FolderKanbanIcon,
  LayoutTemplateIcon,
  MailIcon,
  NewspaperIcon,
  QuoteIcon,
  SparklesIcon,
  UserIcon,
  WrenchIcon,
  FileTextIcon,
  type LucideIcon,
} from "lucide-react";
import { SectionType } from "@portfolio/db";

export const sectionIcons: Record<SectionType, LucideIcon> = {
  [SectionType.HERO]: LayoutTemplateIcon,
  [SectionType.ABOUT]: UserIcon,
  [SectionType.PROJECTS]: FolderKanbanIcon,
  [SectionType.EXPERIENCE]: BriefcaseIcon,
  [SectionType.SKILLS]: SparklesIcon,
  [SectionType.SERVICES]: WrenchIcon,
  [SectionType.TESTIMONIALS]: QuoteIcon,
  [SectionType.BLOG]: NewspaperIcon,
  [SectionType.CONTACT]: MailIcon,
  [SectionType.RESUME]: FileTextIcon,
};
