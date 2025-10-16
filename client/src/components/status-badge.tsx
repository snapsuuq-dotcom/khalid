import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_COLORS, type ShipmentStatus } from "@shared/schema";

interface StatusBadgeProps {
  status: ShipmentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge 
      className={`${STATUS_COLORS[status]} rounded-full px-3 py-1 text-sm font-medium`}
      data-testid={`badge-status-${status}`}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
