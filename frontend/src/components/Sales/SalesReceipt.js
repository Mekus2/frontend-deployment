import jsPDF from "jspdf";
import "jspdf-autotable";
import { logoBase64 } from "../../data/imageData"; // Import your base64 logo

const SalesReceipt = ({ sale, invoiceDetails }) => {
  const formatCurrency = (value) => {
    const numberValue = parseFloat((value || "").toString().replace(/[^\d.-]/g, ""));
    return isNaN(numberValue) ? "0.00" : numberValue.toFixed(2);
  };

  const generateReceipt = () => {
    const doc = new jsPDF();
    const { SALES_INV_ID, client_name, SALES_INV_TOTAL_PRICE, SALES_INV_DISCOUNT } = sale;

    // Add logo and header
    const logoWidth = 15;
    const logoHeight = logoWidth;
    const logoX = 12;
    const logoY = 5;
    const pageWidth = doc.internal.pageSize.width;

    doc.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PHILVETS", pageWidth / 2, logoY + logoHeight + 8, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("123-456-789", pageWidth / 2, logoY + logoHeight + 14, { align: "center" });

    // Add title and date
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Sales Receipt", 14, logoY + logoHeight + 24);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, logoY + logoHeight + 30);

    // Invoice details
    doc.text(`Invoice ID: ${SALES_INV_ID || "N/A"}`, 14, logoY + logoHeight + 36);
    doc.text(`Customer Name: ${client_name || "N/A"}`, 14, logoY + logoHeight + 42);
    doc.text(`Total Price: ${formatCurrency(SALES_INV_TOTAL_PRICE || 0)}`, 14, logoY + logoHeight + 48);
    doc.text(`Discount: ${formatCurrency(SALES_INV_DISCOUNT || 0)}`, 14, logoY + logoHeight + 54);

    // Table data
    const tableData = invoiceDetails.map((item) => [
      item.SALES_INV_ITEM_PROD_NAME || "N/A",
      formatCurrency(item.SALES_INV_ITEM_PROD_SELL_PRICE || 0),
      formatCurrency(
        (item.SALES_INV_ITEM_PROD_SELL_PRICE || 0) * (item.SALES_INV_item_PROD_DLVRD || 0)
      ),
    ]);

    doc.autoTable({
      startY: logoY + logoHeight + 60,
      head: [["Product Name", "Selling Price", "Total Price"]],
      body: tableData,
      styles: {
        cellPadding: 3,
        fontSize: 9,
        halign: "center",
      },
      headStyles: {
        fillColor: [0, 196, 255],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    // Open PDF in a new tab
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  };

  return { generateReceipt };
};

export default SalesReceipt;
