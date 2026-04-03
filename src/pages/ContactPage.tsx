import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you soon.");
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container flex flex-1 flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h2 className="mb-2 font-display text-3xl font-bold text-foreground">Message Sent!</h2>
          <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Contact Us</h1>
          <p className="mb-8 text-muted-foreground">Got questions? We'd love to hear from you.</p>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6">
              {[
                { icon: Phone, label: "Phone", value: "+91 93720 58229", href: "tel:+919372058229" },
                { icon: Mail, label: "Email", value: "info@punekarbikes.com", href: "mailto:info@punekarbikes.com" },
                { icon: MapPin, label: "Address", value: "Opposite Marathi School, Near Bhaji Mandai, Dhanvantari Colony, Wadgaon Sheri, Pune, Maharashtra 411014" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-primary hover:underline">{item.value}</a>
                    ) : (
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4 rounded-xl border border-border bg-card p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </div>
              <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
