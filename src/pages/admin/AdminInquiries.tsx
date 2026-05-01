import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const STATUSES = ["Pending", "Open", "Converted"] as const;
type Status = typeof STATUSES[number];

const statusBadge = (s: string) => {
  if (s === "Converted") return "bg-green-100 text-green-700 border-green-200";
  if (s === "Open") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
};

const AdminInquiries = () => {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!inquiries) return [];
    return inquiries.filter(i => {
      if (statusFilter !== "all" && (i.status || "Pending") !== statusFilter) return false;
      const created = new Date(i.created_at);
      if (startDate && created < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (created > end) return false;
      }
      return true;
    });
  }, [inquiries, statusFilter, startDate, endDate]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
    },
    onError: () => toast.error("Failed to update status"),
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
    if (!filtered.length) return;
    const headers = ["Name", "Phone", "Email", "Bike", "Status", "Message", "Date"];
    const rows = filtered.map(i => [
      i.name, i.phone, i.email || "", i.bike_title || "", i.status || "Pending",
      (i.message || "").replace(/,/g, ";").replace(/\n/g, " "),
      new Date(i.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "inquiries.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => { setStatusFilter("all"); setStartDate(""); setEndDate(""); };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Inquiries</h1>
        <Button variant="outline" onClick={exportCSV} disabled={!filtered.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4" /> Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">From Date</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">To Date</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full">Clear</Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Showing {filtered.length} of {inquiries?.length ?? 0}</p>
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
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Message</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                {isAdmin && <th className="p-3 text-left font-medium text-muted-foreground">Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inq => (
                <tr key={inq.id} className="border-t border-border">
                  <td className="p-3 font-medium text-foreground">{inq.name}</td>
                  <td className="p-3"><a href={`tel:${inq.phone}`} className="text-primary hover:underline">{inq.phone}</a></td>
                  <td className="p-3 text-muted-foreground">{inq.email || "—"}</td>
                  <td className="p-3 text-muted-foreground">{inq.bike_title || "—"}</td>
                  <td className="p-3">
                    <Select
                      value={inq.status || "Pending"}
                      onValueChange={(v) => updateStatus.mutate({ id: inq.id, status: v as Status })}
                    >
                      <SelectTrigger className={`h-8 w-32 text-xs border ${statusBadge(inq.status || "Pending")}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
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
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No inquiries match these filters.</td></tr>
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
