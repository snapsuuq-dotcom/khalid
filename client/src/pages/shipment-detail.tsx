import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Package, MapPin, Calendar, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/status-badge";
import { ShipmentTimeline } from "@/components/shipment-timeline";
import { useToast } from "@/hooks/use-toast";
import { SHIPMENT_STATUSES, STATUS_LABELS, type Shipment, type StatusUpdate } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

export default function ShipmentDetail() {
  const [, params] = useRoute("/shipment/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  const { data: shipment, isLoading } = useQuery<Shipment>({
    queryKey: ["/api/shipments", params?.id],
    enabled: !!params?.id,
  });

  const { data: statusUpdates = [] } = useQuery<StatusUpdate[]>({
    queryKey: ["/api/shipments", params?.id, "status-updates"],
    enabled: !!params?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { status: string; notes?: string }) => {
      return await apiRequest("POST", `/api/shipments/${params?.id}/status`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments", params?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/shipments", params?.id, "status-updates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({
        title: "Status Updated",
        description: "Shipment status has been updated successfully",
      });
      setNewStatus("");
      setStatusNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyTrackingNumber = () => {
    if (shipment) {
      navigator.clipboard.writeText(shipment.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
      toast({
        title: "Copied!",
        description: "Tracking number copied to clipboard",
      });
    }
  };

  const handleUpdateStatus = () => {
    if (newStatus) {
      updateStatusMutation.mutate({
        status: newStatus,
        notes: statusNotes || undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Shipment Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The shipment you're looking for doesn't exist.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Shipment Details</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <button
                onClick={copyTrackingNumber}
                className="font-mono text-sm tracking-wider text-primary hover-elevate px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
                data-testid="button-copy-tracking"
              >
                {shipment.trackingNumber}
                {copiedTracking ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <StatusBadge status={shipment.currentStatus as any} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Product</span>
                  </div>
                  <div className="font-medium text-lg" data-testid="text-product-name">
                    {shipment.productName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Quantity: {shipment.quantity}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Supplier</span>
                  </div>
                  <div className="font-medium" data-testid="text-supplier">
                    {shipment.supplierInfo}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Route</span>
                  </div>
                  <div className="font-medium">
                    <div data-testid="text-origin">{shipment.originCity}, China</div>
                    <div className="text-muted-foreground text-sm my-1">→</div>
                    <div data-testid="text-destination">{shipment.destination}, Somaliland</div>
                  </div>
                </div>

                {shipment.estimatedDelivery && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Estimated Delivery</span>
                    </div>
                    <div className="font-medium" data-testid="text-estimated-delivery">
                      {format(new Date(shipment.estimatedDelivery), "MMMM dd, yyyy")}
                    </div>
                  </div>
                )}

                {shipment.notes && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Notes</div>
                    <div className="text-sm" data-testid="text-notes">
                      {shipment.notes}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Created: {format(new Date(shipment.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last Updated: {format(new Date(shipment.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>
                  Update the shipment status and add notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status-select">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="status-select" data-testid="select-status">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIPMENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-notes">Notes (Optional)</Label>
                  <Textarea
                    id="status-notes"
                    placeholder="Add any notes about this status update..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows={3}
                    data-testid="input-status-notes"
                  />
                </div>

                <Button
                  onClick={handleUpdateStatus}
                  disabled={!newStatus || updateStatusMutation.isPending}
                  className="w-full"
                  data-testid="button-update-status"
                >
                  {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Shipment Timeline</CardTitle>
              <CardDescription>
                Track the journey of your shipment from China to Somaliland
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShipmentTimeline
                currentStatus={shipment.currentStatus as any}
                statusUpdates={statusUpdates}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
