import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Invoice = Tables<"invoices">;

export const useInvoices = (type?: "sales" | "purchase") => {
  return useQuery({
    queryKey: ["invoices", type ?? "all"],
    queryFn: async () => {
      let q = supabase.from("invoices").select("*").order("created_at", { ascending: false });
      if (type) q = q.eq("invoice_type", type);
      const { data, error } = await q;
      if (error) throw error;
      return data as Invoice[];
    },
  });
};
