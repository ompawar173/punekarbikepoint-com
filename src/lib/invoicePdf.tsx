import type { Invoice } from "@/hooks/useInvoices";
import { DeliveryNoteTemplate } from "@/components/DeliveryNoteTemplate";
import { createRoot } from "react-dom/client";
import jsPDF from "jspdf";

declare const html2canvas: any;

export const generateInvoicePDF = async (
  inv: Invoice,
  opts?: { preview?: boolean }
): Promise<string | null> => {
  // Guard against non-browser environments (SSR, build time)
  if (typeof document === "undefined") {
    throw new Error("PDF generation requires a browser environment");
  }

  // Dynamically load html2canvas if needed
  if (!window.html2canvas) {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    document.head.appendChild(script);
    await new Promise(resolve => script.onload = resolve);
  }

  return new Promise((resolve, reject) => {
    try {
      // Create a temporary container for rendering React component
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "210mm";
      container.style.minHeight = "297mm";
      container.style.backgroundColor = "#ffffff";
      container.style.padding = "0";
      document.body.appendChild(container);

      // Render React component
      const root = createRoot(container);
      const invoiceElement = <DeliveryNoteTemplate invoice={inv} />;
      root.render(invoiceElement);

      // Wait for render to complete, then generate PDF
      setTimeout(async () => {
        try {
          // Use html2canvas to convert HTML to canvas
          const canvas = await window.html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
          });

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF({
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }

          // Add page numbers
          const pageCount = pdf.internal.pages.length - 1;
          for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.setTextColor(150);
            pdf.text(
              `Page ${i} of ${pageCount}`,
              pdfWidth / 2,
              pdfHeight - 8,
              { align: "center" }
            );
          }

          if (opts?.preview) {
            // Return blob URL for preview
            const blob = pdf.output("blob");
            const url = URL.createObjectURL(blob);
            root.unmount();
            document.body.removeChild(container);
            resolve(url);
          } else {
            // Download directly
            pdf.save(`${inv.invoice_no}.pdf`);
            root.unmount();
            document.body.removeChild(container);
            resolve(null);
          }
        } catch (error) {
          root.unmount();
          document.body.removeChild(container);
          reject(error);
        }
      }, 100);
    } catch (error) {
      reject(error);
    }
  });
};
