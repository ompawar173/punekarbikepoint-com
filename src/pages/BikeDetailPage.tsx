import { useParams, Link } from "react-router-dom";
import { BIKE_LISTINGS } from "@/data/bikes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Gauge, MapPin, User, Fuel, Phone, MessageCircle } from "lucide-react";

const BikeDetailPage = () => {
  const { id } = useParams();
  const bike = BIKE_LISTINGS.find((b) => b.id === id);

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

  const specs = [
    { icon: Calendar, label: "Year", value: bike.year },
    { icon: Gauge, label: "KM Driven", value: `${bike.kmDriven.toLocaleString()} km` },
    { icon: MapPin, label: "Location", value: bike.location },
    { icon: User, label: "Ownership", value: bike.owner },
    { icon: Fuel, label: "Fuel Type", value: bike.fuelType },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="container py-8">
        <Link to="/buy" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Link>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Image */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-border">
              <img src={bike.image} alt={bike.title} className="aspect-[16/10] w-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <Badge className="mb-3 bg-accent text-accent-foreground border-0">{bike.condition}</Badge>
            <h1 className="mb-2 font-display text-3xl font-bold text-foreground">{bike.title}</h1>
            <p className="mb-6 font-display text-4xl font-bold text-primary">
              ₹{bike.price.toLocaleString("en-IN")}
            </p>

            {/* Specs grid */}
            <div className="mb-6 grid grid-cols-2 gap-4">
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

            <div className="mb-6">
              <h3 className="mb-2 font-display font-semibold text-foreground">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{bike.description}</p>
            </div>

            <div className="flex flex-col gap-3">
              <a href="https://wa.me/919999999999?text=Hi%2C%20I%27m%20interested%20in%20the%20" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full bg-success text-success-foreground hover:bg-success/90 font-semibold h-12">
                  <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
                </Button>
              </a>
              <a href="tel:+919999999999">
                <Button size="lg" variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 font-semibold h-12">
                  <Phone className="mr-2 h-5 w-5" /> Call Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BikeDetailPage;
