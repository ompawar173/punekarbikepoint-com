import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2">
              <img src={logo} alt="Punekar Bike Point" className="h-10 w-10 rounded-lg object-contain" />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-lg font-bold">Punekar Bike Point</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground/50">Sale & Purchase</span>
              </div>
            </Link>
            <p className="text-sm text-secondary-foreground/70">
              India's trusted platform for buying and selling pre-owned bikes. Get the best deals on quality two-wheelers.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <Link to="/buy" className="hover:text-primary transition-colors">Buy Bikes</Link>
              <Link to="/sell" className="hover:text-primary transition-colors">Sell Your Bike</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Popular Brands</h4>
            <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <Link to="/buy?brand=Honda" className="hover:text-primary transition-colors">Honda</Link>
              <Link to="/buy?brand=Yamaha" className="hover:text-primary transition-colors">Yamaha</Link>
              <Link to="/buy?brand=Royal+Enfield" className="hover:text-primary transition-colors">Royal Enfield</Link>
              <Link to="/buy?brand=KTM" className="hover:text-primary transition-colors">KTM</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-secondary-foreground/70">
              <a href="tel:+919999999999" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" /> +91 99999 99999
              </a>
              <a href="mailto:info@2wheelr.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" /> info@2wheelr.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Pune, Maharashtra
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-secondary-foreground/10 pt-6 text-center text-sm text-secondary-foreground/50">
          © {new Date().getFullYear()} 2WheelR. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
