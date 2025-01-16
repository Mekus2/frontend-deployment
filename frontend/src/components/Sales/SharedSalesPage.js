import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import ReportCard from "../Layout/ReportCard";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";
import Button from "../Layout/Button";
import SalesDetailsModal from "./SalesDetailsModal";
import { fetchSalesInvoices } from "../../api/SalesInvoiceApi";

const SharedSalesPage = () => {
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  const salesInvoice = [
    {
      SALES_INV_ID: 1001,
      SALES_INV_DATETIME: "2025-01-01T12:34:56",
      CLIENT_NAME: "John Doe",
      SALES_INV_AMOUNT_BALANCE: 1500.75,
      SALES_INV_PYMNT_STATUS: "Paid",
    },
    {
      SALES_INV_ID: 1002,
      SALES_INV_DATETIME: "2025-01-03T15:20:10",
      CLIENT_NAME: "Jane Smith",
      SALES_INV_AMOUNT_BALANCE: 500.0,
      SALES_INV_PYMNT_STATUS: "Unpaid",
    },
    {
      SALES_INV_ID: 1003,
      SALES_INV_DATETIME: "2025-01-05T10:00:00",
      CLIENT_NAME: "ACME Corp.",
      SALES_INV_AMOUNT_BALANCE: 3000.0,
      SALES_INV_PYMNT_STATUS: "Paid",
    },
  ];

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

  const InvoiceData = tableData.map((order) => [
    order.SALES_INV_ID || "N/A",
    order.SALES_INV_DATETIME
      ? new Date(order.SALES_INV_DATETIME).toISOString().slice(0, 10)
      : "N/A",
    order.client_name || "Unknown",
    order.client_province || "Unknown",
    order.client_address || "Unknown",
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

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
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
        <SalesDetailsModal onClose={handleCloseModal} sale={selectedOrder} />
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
  background-color: #f9f9f9;
  border-radius: 8px;
  min-height: 200px;
  text-align: center;
`;

export default SharedSalesPage;
