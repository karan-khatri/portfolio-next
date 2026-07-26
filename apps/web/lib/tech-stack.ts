import type { IconType } from "react-icons";
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

export interface TechStackItem {
  name: string;
  /** Drop a logo URL here (e.g. an uploaded /uploads/... or hosted image) to use it instead of `Icon`. */
  imageUrl?: string;
  Icon: IconType;
}

export const TECH_STACK_ROW_1: TechStackItem[] = [
  { name: "JavaScript", Icon: SiJavascript },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Python", Icon: SiPython },
  { name: "Go", Icon: SiGo },
  { name: "React", Icon: SiReact },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "Node.js", Icon: SiNodedotjs },
  { name: "FastAPI", Icon: SiFastapi },
];

export const TECH_STACK_ROW_2: TechStackItem[] = [
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "MongoDB", Icon: SiMongodb },
  { name: "Redis", Icon: SiRedis },
  { name: "Docker", Icon: SiDocker },
  { name: "RabbitMQ", Icon: SiRabbitmq },
  { name: "GitHub Actions", Icon: SiGithubactions },
  { name: "LangChain", Icon: SiLangchain },
  { name: "Streamlit", Icon: SiStreamlit },
];
