import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsCard } from "@/components/stats-card";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { STATUS_LABELS, type Cargo } from "@shared/schema";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) setLocation("/login");
        setAuthChecked(true);
      })
      .catch(() => setLocation("/login"));
  }, [setLocation]);

  const { data: stats } = useQuery<{ total: number; china: number; on_air: number; on_sea: number; arrived: number; delivered: number }>({
    queryKey: ["/api/stats"],
  });

  const { data: cargo = [], refetch } = useQuery<Cargo[]>({
    queryKey: ["/api/cargo"],
  });

  if (!authChecked) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and track cargo</p>
        </div>
        <div className="flex gap-2">
          <Link href="/add-cargo"><Button>Add Cargo</Button></Link>
          <Button variant="outline" onClick={async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); setLocation("/login"); }}>Logout</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Cargo" value={stats?.total ?? 0} icon={Package} />
        <StatsCard title="In China" value={stats?.china ?? 0} icon={Truck} />
        <StatsCard title="In Transit" value={(stats?.on_air ?? 0) + (stats?.on_sea ?? 0)} icon={Truck} />
        <StatsCard title="Delivered" value={stats?.delivered ?? 0} icon={CheckCircle} />
      </div>

      {stats && (
        <Card>
          <CardContent className="p-4">
            <ChartContainer
              config={{
                china: { label: "China", color: "hsl(var(--chart-1))" },
                on_air: { label: "On Air", color: "hsl(var(--chart-3))" },
                on_sea: { label: "On Sea", color: "hsl(var(--chart-4))" },
                arrived: { label: "Arrived", color: "hsl(var(--chart-1))" },
                delivered: { label: "Delivered", color: "hsl(var(--chart-2))" },
              }}
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={[{
                  name: "Cargo",
                  china: stats.china,
                  on_air: stats.on_air,
                  on_sea: stats.on_sea,
                  arrived: stats.arrived,
                  delivered: stats.delivered,
                }]}>
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend />
                  <Bar dataKey="china" fill="var(--color-china)" />
                  <Bar dataKey="on_air" fill="var(--color-on_air)" />
                  <Bar dataKey="on_sea" fill="var(--color-on_sea)" />
                  <Bar dataKey="arrived" fill="var(--color-arrived)" />
                  <Bar dataKey="delivered" fill="var(--color-delivered)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargo.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.customerName}</TableCell>
                  <TableCell>{c.phoneNumber}</TableCell>
                  <TableCell>{c.productName}</TableCell>
                  <TableCell className="font-mono">{c.truckNumber}</TableCell>
                  <TableCell>{STATUS_LABELS[c.status]}</TableCell>
                  <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/edit-cargo/${c.id}`}><Button size="sm" variant="outline">Edit</Button></Link>
                      <Button size="sm" variant="destructive" onClick={async () => { if (!confirm("Delete cargo?")) return; await fetch(`/api/admin/cargo/${c.id}`, { method: "DELETE", credentials: "include" }); refetch(); }}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
