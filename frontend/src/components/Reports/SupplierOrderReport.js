import React, { useState, useEffect } from "react";
import ReportBody from "./ReportBody";
import generatePDF from "./GeneratePdf";
import generateExcel from "./GenerateExcel";
import PreviewModal from "./PreviewModal";

const SupplierOrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [orders, setOrders] = useState([]); // State to store fetched orders

  // Fetch purchase orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/supplier-order/purchaseOrder/");
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      }
    };
    fetchOrders();
  }, []);

  // Helper function to search in all fields
  const matchesSearchTerm = (order) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      (order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME && order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME.toLowerCase().includes(searchStr)) ||
      (order.PURCHASE_ORDER_DATE_CREATED && order.PURCHASE_ORDER_DATE_CREATED.toLowerCase().includes(searchStr)) ||
      (order.PURCHASE_ORDER_TOTAL_QTY && order.PURCHASE_ORDER_TOTAL_QTY.toString().includes(searchStr)) ||
      (order.PURCHASE_ORDER_SUPPLIER_CMPNY_NUM && order.PURCHASE_ORDER_SUPPLIER_CMPNY_NUM.toString().includes(searchStr))
    );
  };

  const filteredOrders = orders
    .filter((order) => {
      const matchesDateRange =
        (!startDate ||
          new Date(order.PURCHASE_ORDER_DATE_CREATED) >= new Date(startDate)) &&
        (!endDate ||
          new Date(order.PURCHASE_ORDER_DATE_CREATED) <= new Date(endDate));
      return matchesSearchTerm(order) && matchesDateRange;
    })
    .sort(
      (a, b) =>
        new Date(b.PURCHASE_ORDER_DATE_CREATED) - new Date(a.PURCHASE_ORDER_DATE_CREATED)
    );

  const totalOrders = filteredOrders.length;

  // Calculate total order value (as negative)
  const totalOrderValue = +filteredOrders.reduce(
    (acc, order) => acc + (order.PURCHASE_ORDER_TOTAL_QTY || 0),
    0
  );

  // Format the date and create the table data
  const tableData = filteredOrders.map((order) => [
    order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME, // Supplier Name
    new Date(order.PURCHASE_ORDER_DATE_CREATED).toLocaleDateString("en-US"), // Formatted Date Created
    order.PURCHASE_ORDER_STATUS, // Status
    order.PURCHASE_ORDER_TOTAL_QTY, // Order Quantity
  ]);

  const header = ["Supplier", "Order Date", "Status", "Order Quantity"];

  const handlePreviewPDF = () => {
    const pdfData = generatePDF(
      header,
      tableData,
      totalOrders,
      totalOrderValue
    );
    setPdfContent(pdfData);
    setExcelData(null);
    setIsModalOpen(true);
  };

  const handlePreviewExcel = () => {
    setExcelData({
      header,
      rows: tableData,
      totalOrders, // Pass total orders
      totalAmount: totalOrderValue, // Pass total amount as negative
    });
    setPdfContent("");
    setIsModalOpen(true);
  };

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfContent;
    link.download = "supplier_order_report.pdf";
    link.click();
    setIsModalOpen(false);
  };

  const handleDownloadExcel = async () => {
    try {
      const excelBlobData = await generateExcel(
        header,
        tableData,
        totalOrders,
        totalOrderValue
      );
      const url = URL.createObjectURL(excelBlobData);
      const a = document.createElement("a");
      a.href = url;
      a.download = "supplier_order_report.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  return (
    <>
      <ReportBody
        title="Supplier Order Report"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        headers={header}
        rows={tableData}
        totalOrders={totalOrders}
        totalOrderValue={totalOrderValue}
        onDownloadPDF={handlePreviewPDF}
        onPreviewExcel={handlePreviewExcel}
      />

      <PreviewModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        pdfContent={pdfContent}
        excelData={excelData}
        onDownloadPDF={handleDownloadPDF}
        onDownloadExcel={handleDownloadExcel}
      />
    </>
  );
};

export default SupplierOrderReport;
