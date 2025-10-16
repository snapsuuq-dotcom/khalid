import { Check, Circle } from "lucide-react";
import { SHIPMENT_STATUSES, STATUS_LABELS, type ShipmentStatus, type StatusUpdate } from "@shared/schema";
import { format } from "date-fns";

interface ShipmentTimelineProps {
  currentStatus: ShipmentStatus;
  statusUpdates: StatusUpdate[];
}

export function ShipmentTimeline({ currentStatus, statusUpdates }: ShipmentTimelineProps) {
  const currentIndex = SHIPMENT_STATUSES.indexOf(currentStatus);

  const getStatusUpdate = (status: ShipmentStatus) => {
    return statusUpdates.find(update => update.status === status);
  };

  return (
    <div className="space-y-0">
      {SHIPMENT_STATUSES.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === SHIPMENT_STATUSES.length - 1;
        const update = getStatusUpdate(status);

        return (
          <div key={status} className="relative">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                  data-testid={`timeline-step-${status}`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`h-16 w-0.5 ${
                      isCompleted ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className={`font-medium ${isCurrent ? "text-foreground" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                  {STATUS_LABELS[status]}
                </div>
                {update && (
                  <div className="mt-1 space-y-1">
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(update.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                    </div>
                    {update.notes && (
                      <div className="text-sm text-foreground">
                        {update.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
