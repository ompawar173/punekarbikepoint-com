import { useState, useMemo } from "react";
import { useBikes, BRANDS } from "@/hooks/useBikes";
import BikeCard from "@/components/BikeCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BuyPage = () => {
  const { data: bikes, isLoading } = useBikes();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [yearRange, setYearRange] = useState("all");
  const [maxKm, setMaxKm] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    if (!bikes) return [];
    return bikes.filter((bike) => {
      if (search && !bike.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (brand !== "all" && bike.brand !== brand) return false;
      if (bike.price < priceRange[0] || bike.price > priceRange[1]) return false;
      if (yearRange !== "all" && bike.year < parseInt(yearRange)) return false;
      if (maxKm !== "all" && bike.km_driven > parseInt(maxKm)) return false;
      return true;
    });
  }, [bikes, search, brand, priceRange, yearRange, maxKm]);

  const clearFilters = () => {
    setSearch("");
    setBrand("all");
    setPriceRange([0, 500000]);
    setYearRange("all");
    setMaxKm("all");
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block text-sm font-semibold text-foreground">Brand</Label>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="All Brands" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-2 block text-sm font-semibold text-foreground">
          Price: ₹{priceRange[0].toLocaleString()} — ₹{priceRange[1].toLocaleString()}
        </Label>
        <Slider min={0} max={500000} step={5000} value={priceRange} onValueChange={setPriceRange} className="mt-3" />
      </div>
      <div>
        <Label className="mb-2 block text-sm font-semibold text-foreground">Year</Label>
        <Select value={yearRange} onValueChange={setYearRange}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="Any Year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Year</SelectItem>
            <SelectItem value="2024">2024+</SelectItem>
            <SelectItem value="2023">2023+</SelectItem>
            <SelectItem value="2022">2022+</SelectItem>
            <SelectItem value="2021">2021+</SelectItem>
            <SelectItem value="2020">2020+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-2 block text-sm font-semibold text-foreground">KM Driven</Label>
        <Select value={maxKm} onValueChange={setMaxKm}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="5000">Under 5,000 km</SelectItem>
            <SelectItem value="10000">Under 10,000 km</SelectItem>
            <SelectItem value="20000">Under 20,000 km</SelectItem>
            <SelectItem value="50000">Under 50,000 km</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" onClick={clearFilters} className="w-full border-destructive text-destructive hover:bg-destructive/5">
        <X className="mr-2 h-4 w-4" /> Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Buy a Bike</h1>
          <p className="mt-2 text-muted-foreground">Browse quality pre-owned bikes</p>
        </div>
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search bikes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card" />
          </div>
          <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-display font-semibold text-foreground">Filters</h3>
              <FilterPanel />
            </div>
          </aside>
          {showFilters && (
            <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground">Filters</h3>
                  <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-[4/3] rounded-lg" />)}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((bike, i) => (
                  <div key={bike.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <BikeCard bike={bike} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="font-display text-xl font-semibold text-foreground">No bikes found</h3>
                <p className="mt-2 text-muted-foreground">Try adjusting your filters</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BuyPage;
