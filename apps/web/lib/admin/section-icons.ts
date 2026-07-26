import {
  LuBriefcase,
  LuFolderKanban,
  LuGraduationCap,
  LuLanguages,
  LuLayoutTemplate,
  LuListChecks,
  LuMail,
  LuNewspaper,
  LuQuote,
  LuSparkles,
  LuUser,
  LuWrench,
  LuFileText,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { SectionType } from "@portfolio/db";

export const sectionIcons: Record<SectionType, IconType> = {
  [SectionType.HERO]: LuLayoutTemplate,
  [SectionType.ABOUT]: LuUser,
  [SectionType.PROJECTS]: LuFolderKanban,
  [SectionType.EXPERIENCE]: LuBriefcase,
  [SectionType.EDUCATION]: LuGraduationCap,
  [SectionType.SKILLS]: LuSparkles,
  [SectionType.LANGUAGES]: LuLanguages,
  [SectionType.SERVICES]: LuWrench,
  [SectionType.TESTIMONIALS]: LuQuote,
  [SectionType.BLOG]: LuNewspaper,
  [SectionType.CONTACT]: LuMail,
  [SectionType.RESUME]: LuFileText,
  [SectionType.NOW]: LuListChecks,
};
