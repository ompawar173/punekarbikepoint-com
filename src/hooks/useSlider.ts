import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SliderImage = Tables<"slider_images">;

export const useSliderImages = (onlyActive = true) => {
  return useQuery({
    queryKey: ["slider_images", onlyActive],
    queryFn: async () => {
      let q = supabase.from("slider_images").select("*").order("sort_order", { ascending: true });
      if (onlyActive) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as SliderImage[];
    },
  });
};
