import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANDS } from "@/hooks/useBikes";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";
import { Checkbox } from "@/components/ui/checkbox";

type Bike = Tables<"bikes">;

const emptyForm = {
  title: "", brand: "", model: "", year: "", price: "", km_driven: "",
  fuel_type: "Petrol", location: "Pune", owner: "1st Owner", description: "",
  condition: "Good", features: "", seller_note: "", is_featured: false,
};

const AdminBikes = () => {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Bike | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const { data: bikes, isLoading } = useQuery({
    queryKey: ["admin", "bikes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bikes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Upload images first
      let imageUrls: string[] = editing?.images ?? [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const ext = file.name.split(".").pop();
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: upErr } = await supabase.storage.from("bike-images").upload(path, file);
          if (upErr) throw upErr;
          const { data: urlData } = supabase.storage.from("bike-images").getPublicUrl(path);
          imageUrls = [...imageUrls, urlData.publicUrl];
        }
      }

      const payload = {
        title: form.title,
        brand: form.brand,
        model: form.model,
        year: parseInt(form.year),
        price: parseInt(form.price),
        km_driven: parseInt(form.km_driven) || 0,
        fuel_type: form.fuel_type,
        location: form.location,
        owner: form.owner,
        description: form.description || null,
        condition: form.condition,
        features: form.features ? form.features.split(",").map(f => f.trim()).filter(Boolean) : [],
        seller_note: form.seller_note || null,
        is_featured: form.is_featured,
        images: imageUrls,
      };

      if (editing) {
        const { error } = await supabase.from("bikes").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bikes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Bike updated!" : "Bike added!");
      qc.invalidateQueries({ queryKey: ["admin", "bikes"] });
      qc.invalidateQueries({ queryKey: ["bikes"] });
      resetForm();
    },
    onError: () => toast.error("Failed to save bike"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bikes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Bike deleted");
      qc.invalidateQueries({ queryKey: ["admin", "bikes"] });
      qc.invalidateQueries({ queryKey: ["bikes"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    setImageFiles([]);
  };

  const startEdit = (bike: Bike) => {
    setEditing(bike);
    setForm({
      title: bike.title, brand: bike.brand, model: bike.model,
      year: String(bike.year), price: String(bike.price), km_driven: String(bike.km_driven),
      fuel_type: bike.fuel_type, location: bike.location, owner: bike.owner,
      description: bike.description || "", condition: bike.condition,
      features: bike.features?.join(", ") || "", seller_note: bike.seller_note || "",
      is_featured: bike.is_featured,
    });
    setShowForm(true);
    setImageFiles([]);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Bikes</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Bike
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold">{editing ? "Edit Bike" : "Add New Bike"}</h2>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
              <div>
                <Label>Brand *</Label>
                <Select value={form.brand} onValueChange={v => setForm({...form, brand: v})}>
                  <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
                  <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Model *</Label><Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} required /></div>
              <div><Label>Year *</Label><Input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} required /></div>
              <div><Label>Price (₹) *</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
              <div><Label>KM Driven</Label><Input type="number" value={form.km_driven} onChange={e => setForm({...form, km_driven: e.target.value})} /></div>
              <div><Label>Fuel Type</Label><Input value={form.fuel_type} onChange={e => setForm({...form, fuel_type: e.target.value})} /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
              <div><Label>Owner</Label><Input value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} /></div>
              <div>
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={v => setForm({...form, condition: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            <div><Label>Features (comma-separated)</Label><Input value={form.features} onChange={e => setForm({...form, features: e.target.value})} placeholder="ABS, Disc Brakes, LED Lights" /></div>
            <div><Label>Seller Note</Label><Input value={form.seller_note} onChange={e => setForm({...form, seller_note: e.target.value})} /></div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.is_featured} onCheckedChange={c => setForm({...form, is_featured: !!c})} id="featured" />
              <Label htmlFor="featured">Featured on homepage</Label>
            </div>
            <div>
              <Label>Images</Label>
              <Input type="file" accept="image/*" multiple onChange={e => setImageFiles(Array.from(e.target.files || []))} />
              {editing?.images && editing.images.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {editing.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="h-16 w-20 rounded object-cover border border-border" />
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editing ? "Update Bike" : "Add Bike"}
            </Button>
          </form>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Image</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Brand</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Price</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Year</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Featured</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bikes?.map(bike => (
                <tr key={bike.id} className="border-t border-border">
                  <td className="p-3">
                    <img src={bike.images?.[0] || "/placeholder.svg"} alt="" className="h-10 w-14 rounded object-cover" />
                  </td>
                  <td className="p-3 font-medium text-foreground">{bike.title}</td>
                  <td className="p-3 text-muted-foreground">{bike.brand}</td>
                  <td className="p-3 font-medium text-foreground">₹{bike.price.toLocaleString()}</td>
                  <td className="p-3 text-muted-foreground">{bike.year}</td>
                  <td className="p-3">{bike.is_featured ? "⭐" : "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(bike)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(bike.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!bikes || bikes.length === 0) && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No bikes yet. Add your first bike!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this bike?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBikes;
