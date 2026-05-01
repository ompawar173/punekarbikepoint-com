import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Coupon = Tables<"coupons">;

export const useActiveCoupons = () => {
  return useQuery({
    queryKey: ["coupons", "active"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .or(`expiry_date.is.null,expiry_date.gte.${today}`);
      if (error) throw error;
      return data as Coupon[];
    },
  });
};
