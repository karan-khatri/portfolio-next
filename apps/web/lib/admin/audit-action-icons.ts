import { LuActivity, LuPencil, LuPlus, LuSend, LuTrash2 } from "react-icons/lu";
import type { IconType } from "react-icons";

const ICON_BY_VERB: Record<string, IconType> = {
  draft_saved: LuPencil,
  publish: LuSend,
  unpublish: LuTrash2,
  created: LuPlus,
};

export function getAuditActionIcon(action: string): IconType {
  const verb = action.split(".").pop() ?? action;
  return ICON_BY_VERB[verb] ?? LuActivity;
}
