import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice } from "@/hooks/useInvoices";

const BUSINESS = {
  name: "PUNEKAR BIKE POINT",
  tagline: "Sale & Purchase",
  address:
    "Opposite Marathi School, Near Bhaji Mandai, Dhanvantari Colony, Wadgaon Sheri, Pune, Maharashtra 411014",
  phone: "+91 93720 58229",
};

const fmtINR = (n: number | string | null | undefined) =>
  `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

export const generateInvoicePDF = (inv: Invoice, opts?: { preview?: boolean }) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;

  // Header band
  doc.setFillColor(30, 64, 175); // blue-700
  doc.rect(0, 0, W, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(BUSINESS.name, M, 35);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(BUSINESS.tagline, M, 52);
  doc.setFontSize(9);
  doc.text(BUSINESS.phone, M, 68);

  // Invoice title (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const title = inv.invoice_type === "sales" ? "SALES INVOICE / DELIVERY NOTE" : "PURCHASE INVOICE";
  doc.text(title, W - M, 40, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`No: ${inv.invoice_no}`, W - M, 58, { align: "right" });
  doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString("en-IN")}`, W - M, 72, { align: "right" });

  // Address line
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  const addrLines = doc.splitTextToSize(BUSINESS.address, W - 2 * M);
  doc.text(addrLines, M, 95);

  let y = 120;

  // Customer block
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(inv.invoice_type === "sales" ? "Customer Details" : "Seller Details", M, y);
  doc.setLineWidth(0.5);
  doc.line(M, y + 3, W - M, y + 3);
  y += 18;

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 130 } },
    body: [
      ["Name", inv.customer_name],
      ["Mobile", inv.mobile],
      ["Address", inv.address || "-"],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 16;

  // Bike details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Vehicle Details", M, y);
  doc.line(M, y + 3, W - M, y + 3);
  y += 18;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [30, 64, 175], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 6 },
    head: [["Field", "Details"]],
    body: [
      ["Bike Model", inv.bike_model],
      ["Registration No.", inv.registration_no || "-"],
      ["Engine No.", inv.engine_no || "-"],
      ["Chassis No.", inv.chassis_no || "-"],
      ["KM Driven", String(inv.km_driven ?? 0)],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 16;

  // Pricing block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Pricing & Payment", M, y);
  doc.line(M, y + 3, W - M, y + 3);
  y += 18;

  const priceRows: [string, string][] = [];
  if (inv.invoice_type === "purchase") {
    priceRows.push(["Advance Paid", fmtINR(inv.advance)]);
    priceRows.push(["Balance", fmtINR(inv.balance)]);
    priceRows.push(["Final Price", fmtINR(inv.final_price || inv.sale_price)]);
  } else {
    priceRows.push(["Sale Price", fmtINR(inv.sale_price)]);
  }
  priceRows.push(["Payment Mode", String(inv.payment_mode || "Cash")]);
  if (inv.delivery_date) {
    priceRows.push(["Delivery Date", new Date(inv.delivery_date).toLocaleDateString("en-IN")]);
  }

  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [30, 64, 175], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 6 },
    head: [["Item", "Amount / Value"]],
    body: priceRows,
  });

  y = (doc as any).lastAutoTable.finalY + 16;

  // Purchase extras
  if (inv.invoice_type === "purchase" && (inv.rc_details || inv.owner_details)) {
    doc.setFont("helvetica", "bold");
    doc.text("RC & Owner Details", M, y);
    doc.line(M, y + 3, W - M, y + 3);
    y += 18;
    autoTable(doc, {
      startY: y,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 130 } },
      body: [
        ["RC Details", inv.rc_details || "-"],
        ["Owner Details", inv.owner_details || "-"],
      ],
    });
    y = (doc as any).lastAutoTable.finalY + 16;
  }

  if (inv.notes) {
    doc.setFont("helvetica", "bold");
    doc.text("Notes", M, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(inv.notes, W - 2 * M);
    doc.text(lines, M, y);
    y += lines.length * 12 + 10;
  }

  // Signatures
  const pageH = doc.internal.pageSize.getHeight();
  const sigY = Math.max(y + 40, pageH - 100);
  doc.setDrawColor(120);
  doc.line(M, sigY, M + 160, sigY);
  doc.line(W - M - 160, sigY, W - M, sigY);
  doc.setFontSize(10);
  doc.text("Customer Signature", M, sigY + 14);
  doc.text("Authorized Signatory", W - M, sigY + 14, { align: "right" });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`${BUSINESS.name} • ${BUSINESS.phone}`, W / 2, pageH - 20, { align: "center" });

  if (opts?.preview) {
    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
  }
  doc.save(`${inv.invoice_no}.pdf`);
  return null;
};
