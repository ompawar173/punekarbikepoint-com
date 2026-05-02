import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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

/** Map of bike_id -> active coupon (non-expired, active, with bike assigned). */
export const useCouponByBike = () => {
  const { data: coupons } = useActiveCoupons();
  return useMemo(() => {
    const m = new Map<string, Coupon>();
    coupons?.forEach((c) => {
      if (c.bike_id) m.set(c.bike_id, c);
    });
    return m;
  }, [coupons]);
};
