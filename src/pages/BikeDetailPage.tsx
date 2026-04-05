import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useBike, useBikes } from "@/hooks/useBikes";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BikeCard from "@/components/BikeCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Gauge, MapPin, User, Fuel, Phone, MessageCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const BikeDetailPage = () => {
  const { id } = useParams();
  const { data: bike, isLoading } = useBike(id);
  const { data: allBikes } = useBikes();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [selectedImage, setSelectedImage] = useState(0);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please fill name and phone number");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      message: form.message || null,
      bike_id: bike?.id,
      bike_title: bike?.title,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit inquiry");
      return;
    }
    setSubmitted(true);
    toast.success("Inquiry submitted! We'll contact you soon.");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container py-8">
          <Skeleton className="mb-6 h-8 w-40" />
          <div className="grid gap-8 lg:grid-cols-5">
            <Skeleton className="lg:col-span-3 aspect-[16/10] rounded-xl" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container flex flex-1 flex-col items-center justify-center py-20">
          <h2 className="font-display text-2xl font-bold text-foreground">Bike not found</h2>
          <Link to="/buy"><Button className="mt-4">Browse Bikes</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = bike.images && bike.images.length > 0
    ? bike.images
    : ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=500&fit=crop"];

  const relatedBikes = allBikes?.filter(b => b.id !== bike.id && b.brand === bike.brand).slice(0, 4) ?? [];

  const specs = [
    { icon: Calendar, label: "Year", value: bike.year },
    { icon: Gauge, label: "KM Driven", value: `${bike.km_driven.toLocaleString()} km` },
    { icon: MapPin, label: "Location", value: bike.location },
    { icon: User, label: "Ownership", value: bike.owner },
    { icon: Fuel, label: "Fuel Type", value: bike.fuel_type },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container py-8">
        <Link to="/buy" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Link>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Image Gallery */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-border">
              <img src={images[selectedImage]} alt={bike.title} className="aspect-[16/10] w-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === selectedImage ? "border-primary" : "border-border"
                    }`}
                  >
                    <img src={img} alt="" className="h-16 w-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <Badge className="mb-3 bg-accent text-accent-foreground border-0">{bike.condition}</Badge>
            <h1 className="mb-2 font-display text-3xl font-bold text-foreground">{bike.title}</h1>
            <p className="mb-6 font-display text-4xl font-bold text-primary">
              ₹{bike.price.toLocaleString("en-IN")}
            </p>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <spec.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{spec.label}</p>
                    <p className="text-sm font-semibold text-foreground">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA - Enquire Now */}
            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 mb-3"
              onClick={() => setInquiryOpen(!inquiryOpen)}
            >
              Enquire Now
            </Button>

            <div className="flex gap-3">
              <a href={`https://wa.me/919372058229?text=Hi%2C%20I%27m%20interested%20in%20${encodeURIComponent(bike.title)}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="w-full bg-success text-success-foreground hover:bg-success/90 font-semibold h-12">
                  <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
                </Button>
              </a>
              <a href="tel:+919372058229" className="flex-1">
                <Button size="lg" variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 font-semibold h-12">
                  <Phone className="mr-2 h-5 w-5" /> Call Now
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        {inquiryOpen && (
          <div className="mt-8 mx-auto max-w-2xl rounded-xl border border-border bg-card p-6">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
                <h3 className="font-display text-xl font-bold text-foreground">Inquiry Sent!</h3>
                <p className="mt-2 text-muted-foreground">We'll contact you shortly about {bike.title}.</p>
              </div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Enquire about {bike.title}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="inq-name">Name *</Label>
                    <Input id="inq-name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="inq-phone">Phone *</Label>
                    <Input id="inq-phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="inq-email">Email</Label>
                  <Input id="inq-email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="inq-msg">Message</Label>
                  <Textarea id="inq-msg" rows={3} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="I'm interested in this bike..." />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Sending..." : "Submit Inquiry"}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Description & Features */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {bike.description && (
            <div>
              <h3 className="mb-3 font-display text-xl font-semibold text-foreground">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{bike.description}</p>
            </div>
          )}
          {bike.features && bike.features.length > 0 && (
            <div>
              <h3 className="mb-3 font-display text-xl font-semibold text-foreground">Features</h3>
              <ul className="space-y-2">
                {bike.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {bike.seller_note && (
            <div>
              <h3 className="mb-3 font-display text-xl font-semibold text-foreground">Seller Note</h3>
              <p className="text-sm leading-relaxed text-muted-foreground italic">{bike.seller_note}</p>
            </div>
          )}
        </div>

        {/* Related Bikes */}
        {relatedBikes.length > 0 && (
          <div className="mt-16">
            <h3 className="mb-6 font-display text-2xl font-bold text-foreground">Similar Bikes</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedBikes.map(b => <BikeCard key={b.id} bike={b} />)}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BikeDetailPage;
