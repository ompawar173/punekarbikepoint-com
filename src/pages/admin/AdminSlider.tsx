import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSliderImages, type SliderImage } from "@/hooks/useSlider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_SLIDES = 5;

const AdminSlider = () => {
  const qc = useQueryClient();
  const { data: slides, isLoading } = useSliderImages(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [toDelete, setToDelete] = useState<SliderImage | null>(null);

  const reload = () => qc.invalidateQueries({ queryKey: ["slider_images"] });

  const onUpload = async (file: File) => {
    if ((slides?.length ?? 0) >= MAX_SLIDES) {
      toast.error(`Max ${MAX_SLIDES} slides allowed`);
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("slider-images").upload(path, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("slider-images").getPublicUrl(path);
    const nextOrder = (slides?.length ?? 0) + 1;
    const { error } = await supabase.from("slider_images").insert({
      image_url: publicUrl, caption: caption || null, sort_order: nextOrder, is_active: true,
    });
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    setCaption("");
    toast.success("Slide added");
    reload();
  };

  const move = async (s: SliderImage, dir: -1 | 1) => {
    const list = [...(slides ?? [])];
    const idx = list.findIndex(x => x.id === s.id);
    const swap = idx + dir;
    if (swap < 0 || swap >= list.length) return;
    const a = list[idx], b = list[swap];
    await supabase.from("slider_images").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("slider_images").update({ sort_order: a.sort_order }).eq("id", b.id);
    reload();
  };

  const toggleActive = async (s: SliderImage) => {
    await supabase.from("slider_images").update({ is_active: !s.is_active }).eq("id", s.id);
    reload();
  };

  const doDelete = async () => {
    if (!toDelete) return;
    await supabase.from("slider_images").delete().eq("id", toDelete.id);
    setToDelete(null);
    toast.success("Slide deleted");
    reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-700">Homepage Slider Manager</h1>
        <p className="text-sm text-slate-500">Up to {MAX_SLIDES} images shown on the homepage hero.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-semibold">Add new slide</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label>Caption (optional)</Label>
            <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Festival sale!" />
          </div>
          <div>
            <Label>Image file</Label>
            <Input type="file" accept="image/*" disabled={uploading || (slides?.length ?? 0) >= MAX_SLIDES}
              onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
          </div>
        </div>
        {uploading && <p className="mt-2 text-sm text-blue-600 flex items-center gap-2"><Upload className="h-4 w-4 animate-pulse" /> Uploading…</p>}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Preview</th>
              <th className="p-3 text-left">Caption</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="p-4 text-slate-500" colSpan={5}>Loading…</td></tr>
            ) : (slides?.length ?? 0) === 0 ? (
              <tr><td className="p-4 text-slate-500" colSpan={5}>No slides yet.</td></tr>
            ) : slides!.map((s, i) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="p-3">{i + 1}</td>
                <td className="p-3"><img src={s.image_url} alt="" className="h-16 w-28 rounded object-cover" /></td>
                <td className="p-3">{s.caption || <span className="text-slate-400">—</span>}</td>
                <td className="p-3"><Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} /></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" onClick={() => move(s, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                    <Button size="icon" variant="outline" onClick={() => move(s, 1)} disabled={i === (slides!.length - 1)}><ArrowDown className="h-4 w-4" /></Button>
                    <Button size="icon" variant="outline" className="text-red-600" onClick={() => setToDelete(s)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this slide?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSlider;
