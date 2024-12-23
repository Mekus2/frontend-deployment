import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import ReportCard from "../Layout/ReportCard";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";
import Button from "../Layout/Button";
import SalesDetailsModal from "./SalesDetailsModal";

const SharedSalesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [salesInvoice, setSalesInvoices] = useState([]);

  useEffect(() => {
    const fetchSalesInvoices = async () => {
      try {
        const response = await fetch(
          "https://backend-deployment-production-92b6.up.railway.app/sales/list/"
        ); // Your API endpoint for sales invoices
        const data = await response.json();
        setSalesInvoices(data.results);
        console.log("Received Invoice list:", data.results);
      } catch (error) {
        console.error("Error fetching sales invoices:", error);
      }
    };

    fetchSalesInvoices();
  }, []);

  const totalOrders = salesInvoice.length;
  const totalSales = salesInvoice.reduce(
    (acc, order) => acc + (order.revenue > 0 ? order.revenue : 0),
    0
  );

  const formatCurrency = (value) => {
    const numberValue = isNaN(value) ? 0 : Number(value);
    return `₱${numberValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const sortedInvoices = [...salesInvoice].sort((a, b) => {
    if (a.SALES_INV_PYMNT_STATUS === "Unpaid" && b.SALES_INV_PYMNT_STATUS !== "Unpaid") return -1;
    if (a.SALES_INV_PYMNT_STATUS !== "Unpaid" && b.SALES_INV_PYMNT_STATUS === "Unpaid") return 1;
    return 0;
  });

  const filteredInvoices = sortedInvoices.filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      order.SALES_INV_ID.toString().includes(search) ||
      order.CLIENT_NAME.toLowerCase().includes(search) ||
      (order.SALES_INV_AMOUNT_BALANCE && formatCurrency(order.SALES_INV_AMOUNT_BALANCE).includes(search)) ||
      (order.SALES_INV_PYMNT_STATUS && order.SALES_INV_PYMNT_STATUS.toLowerCase().includes(search))
    );
  });

  const tableData = filteredInvoices.map((order) => [
    order.SALES_INV_ID || "N/A",
    order.SALES_INV_DATETIME
      ? new Date(order.SALES_INV_DATETIME).toISOString().slice(0, 10)
      : "N/A",
    order.CLIENT_NAME || "Unknown",
    formatCurrency(order.SALES_INV_AMOUNT_BALANCE || 0),
    order.SALES_INV_PYMNT_STATUS || "Pending",
    <Button variant="primary" onClick={() => handleOpenModal(order)}>
      Details
    </Button>,
  ]);

  const header = [
    "Invoice ID",
    "Date",
    "Client Name",
    "Balance",
    "Status",
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
          label="Cost"
          value={formatCurrency(0)} // Replace with total expense if available
          icon={<FaDollarSign />}
        />
        <ReportCard
          label="Gross Profit"
          value={formatCurrency()} // Replace with net profit if available
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
        />
      )}

      <ReportContent>
        <Table headers={header} rows={tableData} />
      </ReportContent>
    </>
  );
};

// Styled Components
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
