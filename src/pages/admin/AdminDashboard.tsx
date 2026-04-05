import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bike, MessageSquare, Image } from "lucide-react";

const AdminDashboard = () => {
  const { data: bikeCount } = useQuery({
    queryKey: ["admin", "bikeCount"],
    queryFn: async () => {
      const { count } = await supabase.from("bikes").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: inquiryCount } = useQuery({
    queryKey: ["admin", "inquiryCount"],
    queryFn: async () => {
      const { count } = await supabase.from("inquiries").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: galleryCount } = useQuery({
    queryKey: ["admin", "galleryCount"],
    queryFn: async () => {
      const { count } = await supabase.from("upcoming_bikes").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const stats = [
    { label: "Total Bikes", value: bikeCount ?? 0, icon: Bike, color: "text-primary" },
    { label: "Inquiries", value: inquiryCount ?? 0, icon: MessageSquare, color: "text-success" },
    { label: "Gallery Items", value: galleryCount ?? 0, icon: Image, color: "text-accent" },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
