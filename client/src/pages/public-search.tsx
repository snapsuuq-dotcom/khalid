import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LABELS, CARGO_STATUSES, type Cargo } from "@shared/schema";

export default function PublicSearch() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data = [], isLoading } = useQuery<Cargo[]>({
    queryKey: ["/api/cargo", status !== "all" ? `status=${status}` : undefined, q ? `q=${q}` : undefined],
    queryFn: async () => {
      const usp = new URLSearchParams();
      if (status && status !== "all") usp.set("status", status);
      if (q) usp.set("q", q);
      const res = await fetch(`/api/cargo${usp.toString() ? `?${usp.toString()}` : ""}`);
      if (!res.ok) throw new Error("Failed to load cargo");
      return res.json();
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Track Your Cargo</h1>
        <p className="text-muted-foreground">Search by truck number, name, or phone. No login required.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by Truck #, Customer Name, or Phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {CARGO_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Truck #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No results</TableCell>
                </TableRow>
              ) : (
                data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.customerName}</TableCell>
                    <TableCell>{c.phoneNumber}</TableCell>
                    <TableCell>{c.productName}</TableCell>
                    <TableCell className="font-mono">{c.truckNumber}</TableCell>
                    <TableCell>{STATUS_LABELS[c.status]}</TableCell>
                    <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
