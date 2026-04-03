import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ShieldCheck, Handshake } from "lucide-react";
import BikeCard from "@/components/BikeCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BIKE_LISTINGS } from "@/data/bikes";

const Index = () => {
  const featuredBikes = BIKE_LISTINGS.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-15" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 font-display text-4xl font-bold leading-tight text-secondary-foreground md:text-6xl">
              <span className="text-gradient">Punekar Bike Point</span>
            </h1>
            <p className="mb-2 text-xl font-semibold text-accent md:text-2xl">Sale & Purchase</p>
            <p className="mb-8 text-lg text-secondary-foreground/70 md:text-xl">
              Pune's most trusted destination for quality second-hand two-wheelers. Find your perfect ride or sell your bike at the best price.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/buy">
                <Button size="lg" className="w-48 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base h-12">
                  <Search className="mr-2 h-5 w-5" /> Buy a Bike
                </Button>
              </Link>
              <Link to="/sell">
                <Button size="lg" className="w-48 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base h-12">
                  Sell Your Bike
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-border bg-card py-8">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Verified Bikes", desc: "Every bike inspected for quality" },
              { icon: Handshake, title: "Best Price Guaranteed", desc: "Transparent pricing, no hidden charges" },
              { icon: Search, title: "Wide Selection", desc: "Hundreds of bikes across all brands" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bikes */}
      <section className="py-16">
        <div className="container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground">Featured Bikes</h2>
              <p className="mt-2 text-muted-foreground">Hand-picked bikes in excellent condition</p>
            </div>
            <Link to="/buy" className="hidden text-sm font-semibold text-primary hover:underline md:block">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredBikes.map((bike, i) => (
              <div key={bike.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <BikeCard bike={bike} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/buy">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                View All Bikes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground">
            Ready to sell your bike?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Get the best price for your bike. List it in minutes.
          </p>
          <Link to="/sell">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base h-12 px-8">
              Sell Now — It's Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/919999999999?text=Hi%2C%20I%27m%20interested%20in%20buying%20a%20bike"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-success shadow-lg transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-success-foreground">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
};

export default Index;
