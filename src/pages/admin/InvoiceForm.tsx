import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Invoice } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  invoice: Invoice | null;
  type: "sales" | "purchase";
  onSaved: (saved: Invoice) => void;
}

const blank = (type: "sales" | "purchase") => ({
  invoice_type: type,
  customer_name: "",
  address: "",
  mobile: "",
  bike_model: "",
  registration_no: "",
  engine_no: "",
  chassis_no: "",
  km_driven: 0,
  sale_price: 0,
  payment_mode: "Cash" as const,
  delivery_date: "",
  rc_details: "",
  owner_details: "",
  advance: 0,
  balance: 0,
  final_price: 0,
  notes: "",
});

const InvoiceForm = ({ invoice, type, onSaved }: Props) => {
  const [form, setForm] = useState<any>(invoice ? { ...invoice } : blank(type));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(invoice ? { ...invoice } : blank(type));
  }, [invoice, type]);

  const isPurchase = (form.invoice_type ?? type) === "purchase";

  // Auto-calc balance for purchase: balance = final_price - advance
  useMemo(() => {
    if (isPurchase) {
      const fp = Number(form.final_price || 0);
      const adv = Number(form.advance || 0);
      const bal = Math.max(0, fp - adv);
      if (bal !== Number(form.balance || 0)) {
        setForm((f: any) => ({ ...f, balance: bal }));
      }
    }
  }, [form.final_price, form.advance, isPurchase]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.customer_name || !form.mobile || !form.bike_model) {
      toast.error("Customer name, mobile, and bike model are required");
      return;
    }
    setSaving(true);
    const payload: any = {
      invoice_type: form.invoice_type ?? type,
      customer_name: form.customer_name,
      address: form.address || null,
      mobile: form.mobile,
      bike_model: form.bike_model,
      registration_no: form.registration_no || null,
      engine_no: form.engine_no || null,
      chassis_no: form.chassis_no || null,
      km_driven: Number(form.km_driven || 0),
      sale_price: Number(form.sale_price || 0),
      payment_mode: form.payment_mode || "Cash",
      delivery_date: form.delivery_date || null,
      rc_details: form.rc_details || null,
      owner_details: form.owner_details || null,
      advance: Number(form.advance || 0),
      balance: Number(form.balance || 0),
      final_price: Number(form.final_price || form.sale_price || 0),
      notes: form.notes || null,
    };
    let result;
    if (invoice) {
      result = await supabase.from("invoices").update(payload).eq("id", invoice.id).select().single();
    } else {
      result = await supabase.from("invoices").insert(payload).select().single();
    }
    setSaving(false);
    if (result.error) { toast.error(result.error.message); return; }
    toast.success(invoice ? "Invoice updated" : "Invoice created");
    onSaved(result.data as Invoice);
  };

  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-blue-700">Customer Details</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Name *</Label><Input value={form.customer_name} onChange={e => set("customer_name", e.target.value)} /></div>
          <div><Label>Mobile *</Label><Input value={form.mobile} onChange={e => set("mobile", e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Address</Label><Textarea rows={2} value={form.address || ""} onChange={e => set("address", e.target.value)} /></div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-blue-700">Vehicle Details</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Bike Model *</Label><Input value={form.bike_model} onChange={e => set("bike_model", e.target.value)} /></div>
          <div><Label>Registration No.</Label><Input value={form.registration_no || ""} onChange={e => set("registration_no", e.target.value)} /></div>
          <div><Label>Engine No.</Label><Input value={form.engine_no || ""} onChange={e => set("engine_no", e.target.value)} /></div>
          <div><Label>Chassis No.</Label><Input value={form.chassis_no || ""} onChange={e => set("chassis_no", e.target.value)} /></div>
          <div><Label>KM Driven</Label><Input type="number" value={form.km_driven || 0} onChange={e => set("km_driven", e.target.value)} /></div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-blue-700">Pricing & Payment</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {!isPurchase && (
            <div><Label>Sale Price (₹) *</Label><Input type="number" value={form.sale_price || 0} onChange={e => set("sale_price", e.target.value)} /></div>
          )}
          <div>
            <Label>Payment Mode</Label>
            <Select value={form.payment_mode || "Cash"} onValueChange={(v) => set("payment_mode", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Bank">Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Delivery Date</Label><Input type="date" value={form.delivery_date || ""} onChange={e => set("delivery_date", e.target.value)} /></div>
        </div>
      </section>

      {isPurchase && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-blue-700">Purchase Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2"><Label>RC Details</Label><Textarea rows={2} value={form.rc_details || ""} onChange={e => set("rc_details", e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Owner Details</Label><Textarea rows={2} value={form.owner_details || ""} onChange={e => set("owner_details", e.target.value)} /></div>
            <div><Label>Final Price (₹)</Label><Input type="number" value={form.final_price || 0} onChange={e => set("final_price", e.target.value)} /></div>
            <div><Label>Advance (₹)</Label><Input type="number" value={form.advance || 0} onChange={e => set("advance", e.target.value)} /></div>
            <div><Label>Balance (auto)</Label><Input type="number" value={form.balance || 0} readOnly className="bg-slate-50" /></div>
          </div>
        </section>
      )}

      <section>
        <Label>Notes</Label>
        <Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} />
      </section>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          {saving ? "Saving…" : invoice ? "Update & Preview PDF" : "Create & Preview PDF"}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceForm;
