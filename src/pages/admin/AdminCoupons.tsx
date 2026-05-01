import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";

type Coupon = Tables<"coupons">;

const empty = {
  code: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: "",
  expiry_date: "",
  bike_id: "none",
  is_active: true,
};

const AdminCoupons = () => {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: coupons } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const { data: bikes } = useQuery({
    queryKey: ["admin", "bikes-for-coupon"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bikes").select("id, title").order("title");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        expiry_date: form.expiry_date || null,
        bike_id: form.bike_id === "none" ? null : form.bike_id,
        is_active: form.is_active,
      };
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Coupon created");
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      qc.invalidateQueries({ queryKey: ["coupons", "active"] });
      setForm(empty);
      setShowForm(false);
    },
    onError: (e: any) => toast.error(e.message?.includes("unique") ? "Code already exists" : "Failed to save"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("coupons").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      qc.invalidateQueries({ queryKey: ["coupons", "active"] });
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      qc.invalidateQueries({ queryKey: ["coupons", "active"] });
      setDeleteId(null);
    },
  });

  const bikeTitle = (id: string | null) => bikes?.find(b => b.id === id)?.title || "All bikes";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Discount Coupons</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Coupon
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold">New Coupon</h2>
            <button onClick={() => { setShowForm(false); setForm(empty); }}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <form onSubmit={e => { e.preventDefault(); save.mutate(); }} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Coupon Code *</Label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="DIWALI20" required />
            </div>
            <div>
              <Label>Discount Type *</Label>
              <Select value={form.discount_type} onValueChange={(v: "percentage" | "fixed") => setForm({ ...form, discount_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Discount Value *</Label>
              <Input type="number" min="1" step="0.01" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} required />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Apply to Bike (optional)</Label>
              <Select value={form.bike_id} onValueChange={v => setForm({ ...form, bike_id: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All bikes (general promo)</SelectItem>
                  {bikes?.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox checked={form.is_active} onCheckedChange={c => setForm({ ...form, is_active: !!c })} id="active" />
              <Label htmlFor="active">Active</Label>
            </div>
            <Button type="submit" disabled={save.isPending} className="sm:col-span-2">
              {save.isPending ? "Saving..." : "Create Coupon"}
            </Button>
          </form>
        </div>
      )}

      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left font-medium text-muted-foreground">Code</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Discount</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Expiry</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Bike</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Active</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map(c => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-medium text-foreground"><Tag className="inline h-3 w-3 mr-1" />{c.code}</td>
                <td className="p-3 text-foreground">
                  {c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                </td>
                <td className="p-3 text-muted-foreground">{c.expiry_date || "No expiry"}</td>
                <td className="p-3 text-muted-foreground">{bikeTitle(c.bike_id)}</td>
                <td className="p-3">
                  <Checkbox checked={c.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: c.id, is_active: !!v })} />
                </td>
                <td className="p-3">
                  {isAdmin && (
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {(!coupons || coupons.length === 0) && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No coupons yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && del.mutate(deleteId)} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCoupons;
