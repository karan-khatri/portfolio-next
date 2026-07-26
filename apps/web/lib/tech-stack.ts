import type { IconType } from "react-icons";
import { LuBoxes } from "react-icons/lu";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiGo,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiFastapi,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiDocker,
  SiRabbitmq,
  SiGithubactions,
  SiLangchain,
  SiStreamlit,
} from "react-icons/si";

/** Best-effort fallback icon by name, used until an item has its own uploaded image. */
export const TECH_STACK_ICON_BY_NAME: Record<string, IconType> = {
  JavaScript: SiJavascript,
  TypeScript: SiTypescript,
  Python: SiPython,
  Go: SiGo,
  React: SiReact,
  "Next.js": SiNextdotjs,
  "Node.js": SiNodedotjs,
  FastAPI: SiFastapi,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,
  Redis: SiRedis,
  Docker: SiDocker,
  RabbitMQ: SiRabbitmq,
  "GitHub Actions": SiGithubactions,
  LangChain: SiLangchain,
  Streamlit: SiStreamlit,
};

export const DEFAULT_TECH_STACK_ICON: IconType = LuBoxes;
