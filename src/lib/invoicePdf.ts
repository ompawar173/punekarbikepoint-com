import html2pdf from "html2pdf.js";
import type { Invoice } from "@/hooks/useInvoices";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import { createRoot } from "react-dom/client";

export const generateInvoicePDF = (inv: Invoice, opts?: { preview?: boolean }) => {
  // Create a temporary container for rendering React component
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.width = "210mm"; // A4 width
  container.style.minHeight = "297mm"; // A4 height
  container.style.backgroundColor = "#ffffff";
  document.body.appendChild(container);

  // Render React component
  const root = createRoot(container);
  root.render(<InvoiceTemplate invoice={inv} type={inv.invoice_type as "sales" | "purchase"} />);

  // Wait for render to complete, then generate PDF
  setTimeout(() => {
    const opt = {
      margin: 0,
      filename: `${inv.invoice_no}.pdf`,
      image: { type: "png", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(container)
      .toPdf()
      .get("pdf")
      .then((pdf: any) => {
        const pageCount = pdf.internal.pages.length - 1;

        // Add page numbers
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(
            `Page ${i} of ${pageCount}`,
            pdf.internal.pageSize.getWidth() / 2,
            pdf.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        }

        if (opts?.preview) {
          // Return blob URL for preview
          const blob = pdf.output("blob");
          const url = URL.createObjectURL(blob);
          root.unmount();
          document.body.removeChild(container);
          return url;
        } else {
          // Download directly
          pdf.save(`${inv.invoice_no}.pdf`);
          root.unmount();
          document.body.removeChild(container);
          return null;
        }
      });
  }, 100);

  return null;
};
