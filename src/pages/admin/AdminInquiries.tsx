import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

const AdminInquiries = () => {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Inquiry deleted");
      qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      setDeleteId(null);
    },
  });

  const exportCSV = () => {
    if (!inquiries || inquiries.length === 0) return;
    const headers = ["Name", "Phone", "Email", "Bike", "Message", "Date"];
    const rows = inquiries.map(i => [
      i.name, i.phone, i.email || "", i.bike_title || "", (i.message || "").replace(/,/g, ";"),
      new Date(i.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inquiries.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Inquiries</h1>
        <Button variant="outline" onClick={exportCSV} disabled={!inquiries?.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Phone</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Bike</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Message</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                {isAdmin && <th className="p-3 text-left font-medium text-muted-foreground">Action</th>}
              </tr>
            </thead>
            <tbody>
              {inquiries?.map(inq => (
                <tr key={inq.id} className="border-t border-border">
                  <td className="p-3 font-medium text-foreground">{inq.name}</td>
                  <td className="p-3"><a href={`tel:${inq.phone}`} className="text-primary hover:underline">{inq.phone}</a></td>
                  <td className="p-3 text-muted-foreground">{inq.email || "—"}</td>
                  <td className="p-3 text-muted-foreground">{inq.bike_title || "—"}</td>
                  <td className="p-3 text-muted-foreground max-w-xs truncate">{inq.message || "—"}</td>
                  <td className="p-3 text-muted-foreground">{new Date(inq.created_at).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(inq.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {(!inquiries || inquiries.length === 0) && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No inquiries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminInquiries;
