import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANDS } from "@/data/bikes";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const SellPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", brand: "", model: "",
    year: "", kmDriven: "", price: "", description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.brand || !form.model) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitted(true);
    toast.success("Your bike listing has been submitted!");
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
          <Button onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", email: "", brand: "", model: "", year: "", kmDriven: "", price: "", description: "" }); }}>
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
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Bike Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Brand *</Label>
                  <Select value={form.brand} onValueChange={(v) => setForm({ ...form, brand: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                    <SelectContent>
                      {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input id="model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="year">Year of Purchase</Label>
                  <Input id="year" type="number" min="2000" max="2025" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="km">KM Driven</Label>
                  <Input id="km" type="number" value={form.kmDriven} onChange={(e) => setForm({ ...form, kmDriven: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="price">Expected Price (₹)</Label>
                  <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Any additional details about your bike..." />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12">
              Submit Listing
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellPage;
