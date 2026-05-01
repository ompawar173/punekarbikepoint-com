import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANDS } from "@/hooks/useBikes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, X, Upload } from "lucide-react";

const SellPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", brand: "", model: "",
    year: "", kmDriven: "", price: "", description: "",
  });
  const [bikeImages, setBikeImages] = useState<File[]>([]);
  const [rcBook, setRcBook] = useState<File | null>(null);

  const bikePreviews = useMemo(() => bikeImages.map(f => URL.createObjectURL(f)), [bikeImages]);
  const rcPreview = useMemo(() => (rcBook ? URL.createObjectURL(rcBook) : null), [rcBook]);

  const handleBikeImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBikeImages(prev => [...prev, ...files].slice(0, 10));
  };

  const removeBikeImage = (idx: number) => {
    setBikeImages(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadFile = async (file: File, bucket: string) => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.brand || !form.model) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (bikeImages.length < 3) {
      toast.error("Please upload at least 3 bike images");
      return;
    }
    if (!rcBook) {
      toast.error("RC Book photo is required");
      return;
    }
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const f of bikeImages) imageUrls.push(await uploadFile(f, "bike-images"));
      const rcUrl = await uploadFile(rcBook, "rc-documents");

      const { error } = await supabase.from("inquiries").insert({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        message: `SELL REQUEST - Brand: ${form.brand}, Model: ${form.model}, Year: ${form.year}, KM: ${form.kmDriven}, Price: ₹${form.price}. ${form.description}\n\nImages:\n${imageUrls.join("\n")}\n\nRC Book: ${rcUrl}`,
        bike_title: `${form.brand} ${form.model}`,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Your bike listing has been submitted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container flex flex-1 flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h2 className="mb-2 font-display text-3xl font-bold text-foreground">Thank You!</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            Your bike details have been submitted. Our team will contact you within 24 hours.
          </p>
          <Button onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", email: "", brand: "", model: "", year: "", kmDriven: "", price: "", description: "" }); setBikeImages([]); setRcBook(null); }}>
            Submit Another
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Sell Your Bike</h1>
          <p className="mb-8 text-muted-foreground">Fill in the details below and our team will get back to you with the best offer.</p>
          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6 md:p-8">
            <h3 className="font-display text-lg font-semibold text-foreground">Your Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label htmlFor="name">Full Name *</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label htmlFor="phone">Phone Number *</Label><Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
              <div className="md:col-span-2"><Label htmlFor="email">Email (optional)</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="border-t border-border pt-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Bike Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Brand *</Label>
                  <Select value={form.brand} onValueChange={(v) => setForm({ ...form, brand: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                    <SelectContent>{BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="model">Model *</Label><Input id="model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required /></div>
                <div><Label htmlFor="year">Year</Label><Input id="year" type="number" min="2000" max="2026" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
                <div><Label htmlFor="km">KM Driven</Label><Input id="km" type="number" value={form.kmDriven} onChange={(e) => setForm({ ...form, kmDriven: e.target.value })} /></div>
                <div><Label htmlFor="price">Expected Price (₹)</Label><Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              </div>
              <div className="mt-4"><Label htmlFor="desc">Description</Label><Textarea id="desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Any additional details..." /></div>
            </div>

            {/* Bike Images */}
            <div className="border-t border-border pt-6">
              <Label>Bike Photos * <span className="text-xs text-muted-foreground">(minimum 3, max 10)</span></Label>
              <div className="mt-2">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-6 text-sm text-muted-foreground hover:bg-muted/50">
                  <Upload className="h-4 w-4" /> Click to add photos
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleBikeImages} />
                </label>
              </div>
              {bikePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {bikePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt={`Preview ${i + 1}`} className="aspect-square w-full rounded-md border border-border object-cover" />
                      <button type="button" onClick={() => removeBikeImage(i)} className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className={`mt-2 text-xs ${bikeImages.length >= 3 ? "text-success" : "text-muted-foreground"}`}>
                {bikeImages.length} / 3 minimum {bikeImages.length >= 3 && "✓"}
              </p>
            </div>

            {/* RC Book */}
            <div className="border-t border-border pt-6">
              <Label>RC Book Photo * <span className="text-xs text-muted-foreground">(required)</span></Label>
              <div className="mt-2">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-6 text-sm text-muted-foreground hover:bg-muted/50">
                  <Upload className="h-4 w-4" /> {rcBook ? "Replace RC Book photo" : "Upload RC Book photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setRcBook(e.target.files?.[0] || null)} />
                </label>
              </div>
              {rcPreview && (
                <div className="mt-3 relative inline-block">
                  <img src={rcPreview} alt="RC Book preview" className="max-h-40 rounded-md border border-border" />
                  <button type="button" onClick={() => setRcBook(null)} className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12" disabled={submitting}>
              {submitting ? "Uploading & Submitting..." : "Submit Listing"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellPage;
