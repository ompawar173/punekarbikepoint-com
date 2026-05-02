import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSliderImages } from "@/hooks/useSlider";

interface HeroSliderProps {
  /** Fallback image URL when no slides are configured. */
  fallback?: string;
  intervalMs?: number;
}

const HeroSlider = ({
  fallback = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&h=1080&fit=crop",
  intervalMs = 5000,
}: HeroSliderProps) => {
  const { data: slides } = useSliderImages(true);
  const images = (slides && slides.length > 0 ? slides.map((s) => s.image_url) : [fallback]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  const go = (dir: number) => setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <div
          key={src + i}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === index ? "opacity-25" : "opacity-0"}`}
          style={{ backgroundImage: `url(${src})` }}
          aria-hidden={i !== index}
        />
      ))}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-accent" : "w-2 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;
