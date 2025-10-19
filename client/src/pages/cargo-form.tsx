import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CARGO_STATUSES, STATUS_LABELS, insertCargoSchema, type Cargo } from "@shared/schema";

export default function CargoForm() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/edit-cargo/:id");
  const editingId = params?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    productName: "",
    truckNumber: "",
    date: new Date().toISOString().slice(0, 10),
    status: "china" as (typeof CARGO_STATUSES)[number],
  });

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me", { credentials: "include" });
      if (me.status === 401) return setLocation("/login");
      if (editingId) {
        const r = await fetch(`/api/cargo/${editingId}`);
        if (r.ok) {
          const c: Cargo = await r.json();
          setForm({
            customerName: c.customerName,
            phoneNumber: c.phoneNumber,
            productName: c.productName,
            truckNumber: c.truckNumber,
            date: c.date.slice(0, 10),
            status: c.status,
          });
        }
      }
    })();
  }, [editingId, setLocation]);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Validate
      insertCargoSchema.parse(form);
      const endpoint = editingId ? `/api/admin/cargo/${editingId}` : "/api/admin/cargo";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setLocation("/admin");
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Cargo" : "Add Cargo"}</CardTitle>
          <CardDescription>Fill in the cargo details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Customer Name</label>
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Phone Number</label>
              <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Product Name</label>
              <Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Truck Number</label>
              <Input value={form.truckNumber} onChange={(e) => setForm({ ...form, truckNumber: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Date</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {CARGO_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLocation("/admin")}>Cancel</Button>
            <Button onClick={submit} disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
