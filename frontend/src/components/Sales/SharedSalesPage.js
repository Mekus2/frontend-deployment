import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import ReportCard from "../Layout/ReportCard";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";
import Button from "../Layout/Button";
import SalesDetailsModal from "./SalesDetailsModal";
import {
  fetchSalesInvoices,
  fetchSalesInvoiceDetails,
} from "../../api/SalesInvoiceApi";

const SharedSalesPage = () => {
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSalesInvoices({
          search: searchTerm,
          startDate: startDate,
          endDate: endDate,
          page: 1,
        });
        setTableData(data.results.sales_invoices);
        setTotalOrders(data.count);
        setTotalSales(data.results.total_gross_revenue);
        setTotalIncome(data.results.total_gross_income);
      } catch (error) {
        console.error("Error fetching sales invoices:", error);
      }
    };

    fetchData();
  }, [searchTerm, startDate, endDate]);

  const formatCurrency = (value) => {
    const numberValue = isNaN(value) ? 0 : Number(value);
    return `₱${numberValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const filteredData = tableData.filter((order) => {
    return (
      order.SALES_INV_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.SALES_INV_DATETIME.toLowerCase().includes(
        searchTerm.toLowerCase()
      ) ||
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_province.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_address.toLowerCase().includes(searchTerm.toLowerCase()) || // Search for City using client_address
      formatCurrency(order.SALES_INV_TOTAL_PRICE)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) // Amount Paid search
    );
  });

  const InvoiceData = filteredData.map((order) => [
    order.SALES_INV_ID || "N/A",
    order.SALES_INV_DATETIME
      ? new Date(order.SALES_INV_DATETIME).toISOString().slice(0, 10)
      : "N/A",
    order.client_name || "Unknown",
    order.client_province || "Unknown",
    order.client_address || "Unknown", // This will show the full address which can be city
    formatCurrency(order.SALES_INV_TOTAL_PRICE || 0),
    <Button variant="primary" onClick={() => handleOpenModal(order)}>
      Details
    </Button>,
  ]);

  const header = [
    "Invoice ID",
    "Date",
    "Client Name",
    "Province",
    "City",
    "Amount Paid",
    "Action",
  ];

  const handleOpenModal = async (order) => {
    setLoading(true); // Set loading to true before fetching
    console.log("Fetching sales invoice details for order:", order);
    try {
      // Fetch the sales invoice details based on the order's SALES_INV_ID
      const data = await fetchSalesInvoiceDetails(order.SALES_INV_ID);
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      setSelectedOrder(order); // Set the selected order
      setInvoiceDetails(data.items); // Set the fetched invoice details
      setIsModalOpen(true); // Open the modal after data is fetched
    } catch (err) {
      setError("Failed to fetch sales invoice details");
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setInvoiceDetails(null);
    setError(null);
    setLoading(false);
  };

  return (
    <>
      <CardsContainer>
        <ReportCard
          label="Total Orders"
          value={`${totalOrders} Orders`}
          icon={<FaShoppingCart />}
        />
        <ReportCard
          label="Revenue"
          value={formatCurrency(totalSales)}
          icon={<FaDollarSign />}
        />
        <ReportCard
          label="Gross Profit"
          value={formatCurrency(totalIncome)} // Replace with net profit if available
          icon={<FaDollarSign />}
        />
      </CardsContainer>
      <Controls>
        <SearchBar
          placeholder="Search / Filter orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DateContainer>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </DateContainer>
      </Controls>

      {isModalOpen && selectedOrder && (
        <SalesDetailsModal
          onClose={handleCloseModal}
          sale={selectedOrder}
          invoiceDetails={invoiceDetails}
          loading={loading}
          error={error}
        />
      )}

      <ReportContent>
        <Table headers={header} rows={InvoiceData} />
      </ReportContent>
    </>
  );
};

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const DateContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;

  label {
    display: flex;
    align-items: center;
    font-weight: bold;
  }

  input {
    margin-left: 0.5rem;
    padding: 0.3rem;
    border-radius: 3px;
    border: 1px solid #ccc;
  }

  @media (min-width: 768px) {
    flex-direction: row;
    margin-top: 0;

    label {
      margin-left: 1rem;
    }
  }
`;

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ReportContent = styled.div`
  border-radius: 8px;
  min-height: 200px;
  text-align: center;
`;

export default SharedSalesPage;
