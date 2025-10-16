import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Package, Truck, CheckCircle, Clock, Plus, Search, ArrowRight, Copy, Check, Filter } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { SHIPMENT_STATUSES, STATUS_LABELS, type Shipment } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: shipments, isLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments", statusFilter !== "all" ? statusFilter : undefined],
    queryFn: async () => {
      const url = statusFilter && statusFilter !== "all" 
        ? `/api/shipments?status=${statusFilter}`
        : "/api/shipments";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch shipments");
      return response.json();
    },
  });

  const filteredShipments = shipments?.filter(shipment => {
    const query = searchQuery.toLowerCase();
    return (
      shipment.trackingNumber.toLowerCase().includes(query) ||
      shipment.productName.toLowerCase().includes(query) ||
      shipment.originCity.toLowerCase().includes(query) ||
      shipment.destination.toLowerCase().includes(query)
    );
  }) || [];

  const stats = {
    total: shipments?.length || 0,
    inTransit: shipments?.filter(s => s.currentStatus === "in_transit" || s.currentStatus === "departed_china").length || 0,
    delivered: shipments?.filter(s => s.currentStatus === "delivered").length || 0,
    pending: shipments?.filter(s => s.currentStatus === "pending" || s.currentStatus === "order_placed").length || 0,
  };

  const copyTrackingNumber = (trackingNumber: string, id: string) => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Copied!",
      description: "Tracking number copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Shipment Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your sourcing shipments from China to Somaliland
            </p>
          </div>
          <Link href="/create">
            <Button size="default" data-testid="button-create-shipment">
              <Plus className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Shipments" value={stats.total} icon={Package} />
          <StatsCard title="In Transit" value={stats.inTransit} icon={Truck} />
          <StatsCard title="Delivered" value={stats.delivered} icon={CheckCircle} />
          <StatsCard title="Pending" value={stats.pending} icon={Clock} />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by tracking number, product, or location..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {SHIPMENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredShipments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No shipments yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery ? "No shipments match your search" : "Create your first shipment to get started"}
                </p>
                {!searchQuery && (
                  <Link href="/create">
                    <Button data-testid="button-create-first-shipment">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Shipment
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredShipments.map((shipment) => (
              <Card key={shipment.id} className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3 flex-wrap">
                        <button
                          onClick={() => copyTrackingNumber(shipment.trackingNumber, shipment.id)}
                          className="font-mono text-sm tracking-wider text-primary hover-elevate px-2 py-1 rounded-md transition-colors flex items-center gap-2"
                          data-testid={`button-copy-tracking-${shipment.id}`}
                        >
                          {shipment.trackingNumber}
                          {copiedId === shipment.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                        <StatusBadge status={shipment.currentStatus as any} />
                      </div>

                      <div>
                        <h3 className="text-lg font-medium" data-testid={`text-product-${shipment.id}`}>
                          {shipment.productName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {shipment.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{shipment.originCity}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="font-medium text-foreground">{shipment.destination}</span>
                      </div>

                      {shipment.estimatedDelivery && (
                        <div className="text-sm text-muted-foreground">
                          Est. Delivery: {format(new Date(shipment.estimatedDelivery), "MMM dd, yyyy")}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/shipment/${shipment.id}`}>
                        <Button variant="outline" size="default" data-testid={`button-view-${shipment.id}`}>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
