import { Badge } from "@/components/ui/badge";

const VARIANT_BY_STATUS: Record<string, "default" | "secondary" | "outline" | "ghost"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  SCHEDULED: "outline",
  ARCHIVED: "ghost",
};

export function StatusBadge({ status, count }: { status: string; count?: number }) {
  const variant = VARIANT_BY_STATUS[status] ?? "outline";
  return (
    <Badge variant={variant}>
      {status}
      {typeof count === "number" ? ` · ${count}` : null}
    </Badge>
  );
}
