import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";

type UpcomingBike = Tables<"upcoming_bikes">;

const AdminGallery = () => {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UpcomingBike | null>(null);
  const [form, setForm] = useState({ title: "", expected_price: "", launch_date: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("upcoming_bikes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = editing?.image || null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `gallery/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("bike-images").upload(path, imageFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("bike-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
      const payload = {
        title: form.title,
        expected_price: form.expected_price ? parseInt(form.expected_price) : null,
        launch_date: form.launch_date || null,
        description: form.description || null,
        image: imageUrl,
      };
      if (editing) {
        const { error } = await supabase.from("upcoming_bikes").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("upcoming_bikes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Updated!" : "Added!");
      qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
      qc.invalidateQueries({ queryKey: ["upcoming_bikes"] });
      resetForm();
    },
    onError: () => toast.error("Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("upcoming_bikes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
      setDeleteId(null);
    },
  });

  const resetForm = () => {
    setForm({ title: "", expected_price: "", launch_date: "", description: "" });
    setEditing(null);
    setShowForm(false);
    setImageFile(null);
  };

  const startEdit = (item: UpcomingBike) => {
    setEditing(item);
    setForm({
      title: item.title,
      expected_price: item.expected_price ? String(item.expected_price) : "",
      launch_date: item.launch_date || "",
      description: item.description || "",
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Gallery / Upcoming Bikes</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" /> Add</Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold">{editing ? "Edit" : "Add New"}</h2>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
              <div><Label>Expected Price (₹)</Label><Input type="number" value={form.expected_price} onChange={e => setForm({...form, expected_price: e.target.value})} /></div>
              <div><Label>Launch Date</Label><Input value={form.launch_date} onChange={e => setForm({...form, launch_date: e.target.value})} placeholder="e.g. July 2026" /></div>
              <div><Label>Image</Label><Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editing ? "Update" : "Add"}
            </Button>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Image</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Price</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Launch</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items?.map(item => (
                <tr key={item.id} className="border-t border-border">
                  <td className="p-3"><img src={item.image || "/placeholder.svg"} alt="" className="h-10 w-14 rounded object-cover" /></td>
                  <td className="p-3 font-medium text-foreground">{item.title}</td>
                  <td className="p-3 text-muted-foreground">{item.expected_price ? `₹${item.expected_price.toLocaleString()}` : "—"}</td>
                  <td className="p-3 text-muted-foreground">{item.launch_date || "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      {isAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!items || items.length === 0) && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No items yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGallery;
