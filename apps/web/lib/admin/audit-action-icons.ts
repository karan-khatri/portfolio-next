import {
  ActivityIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react";

const ICON_BY_VERB: Record<string, LucideIcon> = {
  draft_saved: PencilIcon,
  publish: SendIcon,
  unpublish: Trash2Icon,
  created: PlusIcon,
};

export function getAuditActionIcon(action: string): LucideIcon {
  const verb = action.split(".").pop() ?? action;
  return ICON_BY_VERB[verb] ?? ActivityIcon;
}
