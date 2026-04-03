import { Link } from "react-router-dom";
import { BikeListingData } from "@/data/bikes";
import { MapPin, Gauge, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BikeCardProps {
  bike: BikeListingData;
}

const BikeCard = ({ bike }: BikeCardProps) => {
  return (
    <Link to={`/bike/${bike.id}`} className="group block">
      <div className="card-elevated overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={bike.image}
            alt={bike.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground border-0 font-semibold">
            {bike.condition}
          </Badge>
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {bike.title}
            </h3>
          </div>
          <p className="mb-3 font-display text-2xl font-bold text-primary">
            ₹{bike.price.toLocaleString("en-IN")}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {bike.year}
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" /> {bike.kmDriven.toLocaleString()} km
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
