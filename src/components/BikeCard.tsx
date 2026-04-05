import { Link } from "react-router-dom";
import { MapPin, Gauge, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Bike } from "@/hooks/useBikes";

interface BikeCardProps {
  bike: Bike;
}

const BikeCard = ({ bike }: BikeCardProps) => {
  const image = bike.images && bike.images.length > 0
    ? bike.images[0]
    : "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop";

  return (
    <Link to={`/bike/${bike.id}`} className="group block">
      <div className="overflow-hidden rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={bike.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground border-0 font-semibold text-xs">
            {bike.condition}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {bike.title}
          </h3>
          <p className="mt-1 font-display text-xl font-bold text-primary">
            ₹{bike.price.toLocaleString("en-IN")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {bike.year}
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" /> {bike.km_driven.toLocaleString()} km
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {bike.location}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {bike.owner}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BikeCard;
