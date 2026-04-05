import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUpcomingBikes } from "@/hooks/useBikes";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, IndianRupee } from "lucide-react";

const GalleryPage = () => {
  const { data: bikes, isLoading } = useUpcomingBikes();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container py-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Upcoming Bikes</h1>
        <p className="mb-8 text-muted-foreground">Check out the latest bikes coming soon</p>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <Skeleton key={i} className="aspect-[4/3] rounded-lg" />)}
          </div>
        ) : bikes && bikes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bikes.map((bike) => (
              <div key={bike.id} className="overflow-hidden rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={bike.image || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop"}
                    alt={bike.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-foreground">{bike.title}</h3>
                  {bike.expected_price && (
                    <p className="mt-1 flex items-center gap-1 text-lg font-bold text-primary">
                      <IndianRupee className="h-4 w-4" />
                      {bike.expected_price.toLocaleString("en-IN")} (Expected)
                    </p>
                  )}
                  {bike.launch_date && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> {bike.launch_date}
                    </p>
                  )}
                  {bike.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{bike.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-20">No upcoming bikes yet. Check back soon!</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default GalleryPage;
