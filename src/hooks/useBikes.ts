import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Bike = Tables<"bikes">;

export const useBikes = () => {
  return useQuery({
    queryKey: ["bikes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bikes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Bike[];
    },
  });
};

export const useFeaturedBikes = () => {
  return useQuery({
    queryKey: ["bikes", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bikes")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data as Bike[];
    },
  });
};

export const useBike = (id: string | undefined) => {
  return useQuery({
    queryKey: ["bikes", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("bikes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Bike;
    },
    enabled: !!id,
  });
};

export const useUpcomingBikes = () => {
  return useQuery({
    queryKey: ["upcoming_bikes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upcoming_bikes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"upcoming_bikes">[];
    },
  });
};

export const BRANDS = [
  "Honda", "Yamaha", "Royal Enfield", "Bajaj", "TVS",
  "Suzuki", "KTM", "Hero", "Kawasaki", "BMW",
];
