import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useInvoices, type Invoice } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, FileText, Trash2, Download, Eye, Loader2 } from "lucide-react";
import { generateInvoicePDF } from "@/lib/invoicePdf";
import InvoiceForm from "./InvoiceForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const AdminInvoices = () => {
  const qc = useQueryClient();
  const { data: invoices, isLoading } = useInvoices();
  const [tab, setTab] = useState<"sales" | "purchase">("sales");
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [creating, setCreating] = useState<"sales" | "purchase" | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Invoice | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  const list = (invoices ?? []).filter(i => i.invoice_type === tab);

  const reload = () => qc.invalidateQueries({ queryKey: ["invoices"] });

  const handlePreview = async (inv: Invoice) => {
    setGeneratingPdfId(inv.id);
    try {
      const url = await generateInvoicePDF(inv, { preview: true });
      if (url) setPreviewUrl(url);
    } catch (error) {
      console.error("Failed to generate preview:", error);
      toast.error("Failed to generate PDF preview");
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleDownload = async (inv: Invoice) => {
    setGeneratingPdfId(inv.id);
    try {
      await generateInvoicePDF(inv);
      toast.success("Invoice downloaded");
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast.error("Failed to download invoice");
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const doDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("invoices").delete().eq("id", toDelete.id);
    setToDelete(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Invoice deleted");
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Billing / Invoices</h1>
          <p className="text-sm text-slate-500">Create sales (delivery note) or purchase invoices.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreating("sales")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" /> New Sales Invoice
          </Button>
          <Button onClick={() => setCreating("purchase")} variant="outline">
            <Plus className="h-4 w-4 mr-1" /> New Purchase Invoice
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
        </TabsList>

        {(["sales", "purchase"] as const).map((t) => (
          <TabsContent key={t} value={t}>
            <div className="rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3 text-left">Invoice No.</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Bike</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td className="p-4" colSpan={6}>Loading…</td></tr>
                  ) : list.length === 0 ? (
                    <tr><td className="p-4 text-slate-500" colSpan={6}>No {t} invoices yet.</td></tr>
                  ) : list.map((inv) => (
                    <tr key={inv.id} className="border-t border-slate-100">
                      <td className="p-3 font-mono text-blue-700">{inv.invoice_no}</td>
                      <td className="p-3">{new Date(inv.created_at).toLocaleDateString("en-IN")}</td>
                      <td className="p-3">{inv.customer_name}<br/><span className="text-xs text-slate-500">{inv.mobile}</span></td>
                      <td className="p-3">{inv.bike_model}</td>
                      <td className="p-3">₹{Number(inv.final_price || inv.sale_price).toLocaleString("en-IN")}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handlePreview(inv)}
                            title="Preview"
                            disabled={generatingPdfId === inv.id}
                          >
                            {generatingPdfId === inv.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDownload(inv)}
                            title="Download"
                            disabled={generatingPdfId === inv.id}
                          >
                            {generatingPdfId === inv.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => setEditing(inv)} title="Edit"><FileText className="h-4 w-4" /></Button>
                          <Button size="icon" variant="outline" className="text-red-600" onClick={() => setToDelete(inv)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create / Edit dialog */}
      <Dialog open={!!creating || !!editing} onOpenChange={(v) => { if (!v) { setCreating(null); setEditing(null); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${editing.invoice_no}` : creating === "sales" ? "New Sales Invoice" : "New Purchase Invoice"}
            </DialogTitle>
          </DialogHeader>
          <InvoiceForm
            invoice={editing}
            type={editing?.invoice_type as ("sales" | "purchase") ?? creating ?? "sales"}
            onSaved={async (saved) => {
              setCreating(null); setEditing(null); reload();
              // Auto-preview after save
              try {
                const url = await generateInvoicePDF(saved, { preview: true });
                if (url) setPreviewUrl(url);
              } catch (error) {
                console.error("Failed to auto-preview:", error);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* PDF preview */}
      <Dialog open={!!previewUrl} onOpenChange={(v) => { if (!v) { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && <iframe src={previewUrl} className="flex-1 w-full rounded border" />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice {toDelete?.invoice_no}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminInvoices;
