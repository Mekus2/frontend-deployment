import React, { useEffect, useState } from "react";
import styled from "styled-components";
import CustomerDeliveryDetails from "./CustomerDeliveryDetails"; // Ensure correct path
import CustomerPayment from "./CustomerPayment"; // Ensure correct path
import { colors } from "../../../colors";
import SearchBar from "../../Layout/SearchBar"; // Ensure correct export
import Table from "../../Layout/Table"; // Ensure correct export
import CardTotalCustomerDelivery from "../../CardsData/CardTotalCustomerDelivery"; // Ensure correct export
import Button from "../../Layout/Button"; // Ensure correct export
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import Loading from "../../Layout/Loading"; // Import Loading component
import {
  fetchCustomerDelivery,
  fetchPendingOrderPayables,
} from "../../../api/CustomerDeliveryApi";

// Custom Status Order Mapping
const customStatusOrder = {
  Delivered: 1,
  Dispatched: 2,
  Pending: 3,
  Accepted: 4, // Ensuring "Accepted" is last
};

// Styled Components
const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const SummarySection = styled.div`
  display: flex;
  justify-content: left;
  margin-bottom: 20px;
`;

const Status = styled.span`
  background-color: ${(props) =>
    props.status === "Delivered"
      ? "#1DBA0B"
      : props.status === "Dispatched"
      ? "#f08400"
      : props.status === "Pending"
      ? "#ff5757"
      : "gray"};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
`;

const TableHeader = styled.th`
  text-align: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const formatDate = (isoDate) => {
  if (!isoDate) return "Invalid Date"; // Handle null, undefined, or invalid input

  const date = new Date(isoDate);

  // Check if the date is valid
  if (isNaN(date)) return "Invalid Date"; // Handle invalid date

  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so add 1
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two-digit day
  const year = date.getFullYear();

  return `${month}/${day}/${year}`; // Return in mm-dd-yyyy format
};

const SharedCustomerDeliveryPage = () => {
  // State Management
  const [orders, setOrders] = useState([]);
  const [customerPayables, setCustomerPayables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "OUTBOUND_DEL_SHIPPED_DATE", // Default sorting key
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);

  // Fetch Data on Component Mount
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const customerOrders = await fetchCustomerDelivery();
        setOrders(customerOrders);
        console.info("Fetched Data from API:", customerOrders);
      } catch (err) {
        console.error("Failed fetching Customer Delivery", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCustomerPayables = async () => {
      try {
        const customerPayables = await fetchPendingOrderPayables();
        console.info("Fetched Customer Payables from API:", customerPayables); // Log response
        setCustomerPayables(customerPayables); // Update state
      } catch (err) {
        console.error("Failed fetching Customer Payables", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    fetchCustomerPayables();
  }, []);

  // Filter Deliveries based on the search term
  const filteredDeliveries = (orders || []).filter((delivery) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return Object.values(delivery).some((value) => {
      if (value && value.toString) {
        return value.toString().toLowerCase().includes(lowerCaseSearchTerm);
      }
      return false;
    });
  });

  // Sorting Deliveries
  const sortedDeliveries = filteredDeliveries.sort((a, b) => {
    if (
      sortConfig.key === "OUTBOUND_DEL_SHIPPED_DATE" ||
      sortConfig.key === "OUTBOUND_DEL_DATE_CUST_RCVD"
    ) {
      const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]) : null;
      const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]) : null;

      if (!dateA || !dateB) return !dateA ? 1 : -1;
      return (dateB - dateA) * (sortConfig.direction === "asc" ? 1 : -1);
    }

    if (sortConfig.key === "OUTBOUND_DEL_STATUS") {
      const statusA = customStatusOrder[a.OUTBOUND_DEL_STATUS] || 0;
      const statusB = customStatusOrder[b.OUTBOUND_DEL_STATUS] || 0;
      return (statusA - statusB) * (sortConfig.direction === "asc" ? 1 : -1);
    }

    return 0;
  });

  const openDetailsModal = (delivery) => setSelectedDelivery(delivery);
  const closeDetailsModal = () => setSelectedDelivery(null);

  const openPaymentModal = (customer) => setSelectedPayment(customer);
  const closePaymentModal = () => setSelectedPayment(null);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const headers = [
    { title: "Customer Name", key: "OUTBOUND_DEL_CUSTOMER_NAME" },
    { title: "Status", key: "OUTBOUND_DEL_STATUS" },
    { title: "Location", key: "OUTBOUND_DEL_LOCATION" },
    { title: "Payment Option", key: "OUTBOUND_DEL_DLVRY_OPTION" },
    { title: "Created Date", key: "OUTBOUND_DEL_CREATED" },
    { title: "Total Price", key: "OUTBOUND_DEL_TOTAL_PRICE" },
    { title: "Action", key: "action" },
  ];

  const PaymentHeaders = [
    { title: "Customer Name", key: "CLIENT_NAME" },
    { title: "Start Date", key: "PAYMENT_START_DATE" },
    { title: "Due Date", key: "PAYMENT_DUE_DATE" },
    { title: "Terms", key: "PAYMENT_TERMS" },
    { title: "Balance", key: "AMOUNT_BALANCE" },
    { title: "Status", key: "PAYMENT_STATUS" },
    { title: "Action", key: "action" },
  ];

  const rows = sortedDeliveries.map((delivery) => [
    delivery.OUTBOUND_DEL_CUSTOMER_NAME || "Unknown",
    <Status status={delivery.OUTBOUND_DEL_STATUS}>
      {delivery.OUTBOUND_DEL_STATUS}
    </Status>,
    `${delivery.OUTBOUND_DEL_CITY || "Unknown"}, ${
      delivery.OUTBOUND_DEL_PROVINCE || "Unknown"
    }`,
    delivery.OUTBOUND_DEL_DLVRY_OPTION || "Not Specified",
    new Date(delivery.OUTBOUND_DEL_CREATED).toLocaleString(),
    `₱${(Number(delivery.OUTBOUND_DEL_TOTAL_PRICE) || 0).toFixed(2)}`,
    <Button
      data-cy="details-button"
      backgroundColor={colors.primary}
      hoverColor={colors.primaryHover}
      onClick={() => openDetailsModal(delivery)}
    >
      Details
    </Button>,
  ]);

  const PayableRows = (customerPayables || []).map((customer) => {
    const startDate = customer.PAYMENT_START_DATE
      ? new Date(customer.PAYMENT_START_DATE).toLocaleString()
      : "Unknown Date";
    const dueDate = customer.PAYMENT_DUE_DATE
      ? new Date(customer.PAYMENT_DUE_DATE).toLocaleString()
      : "Unknown Date";

    return [
      customer.CLIENT_NAME || "Unknown",
      formatDate(startDate),
      formatDate(dueDate),
      customer.PAYMENT_TERMS || "Unknown",
      `₱${(Number(customer.AMOUNT_BALANCE) || 0).toFixed(2)}`,
      <Status status={customer.PAYMENT_STATUS}>
        {customer.PAYMENT_STATUS}
      </Status>,
      <Button
        data-cy="details-button"
        backgroundColor={colors.primary}
        hoverColor={colors.primaryHover}
        onClick={() => openPaymentModal(customer)}
      >
        Details
      </Button>,
    ];
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <SummarySection>
        <CardTotalCustomerDelivery />
      </SummarySection>
      <Controls>
        <SearchBar
          data-cy="search-bar"
          placeholder="Search / Filter delivery..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>

      {/* Customer Deliveries Table */}
      <div>
        <h3>Customer Deliveries</h3>
        <Table
          headers={headers.map((header) => (
            <TableHeader
              key={header.key}
              onClick={
                header.key === "OUTBOUND_DEL_SHIPPED_DATE" ||
                header.key === "OUTBOUND_DEL_CSTMR_RCVD_DATE" ||
                header.key === "OUTBOUND_DEL_STATUS"
                  ? () => handleSort(header.key)
                  : undefined
              }
            >
              {header.title}
              {(header.key === "OUTBOUND_DEL_SHIPPED_DATE" ||
                header.key === "OUTBOUND_DEL_DATE_CUST_RCVD" ||
                header.key === "OUTBOUND_DEL_STATUS") && (
                <>
                  {sortConfig.key === header.key ? (
                    sortConfig.direction === "asc" ? (
                      <FaChevronUp
                        style={{ marginLeft: "5px", fontSize: "12px" }}
                      />
                    ) : (
                      <FaChevronDown
                        style={{ marginLeft: "5px", fontSize: "12px" }}
                      />
                    )
                  ) : (
                    <span style={{ opacity: 0.5 }}>
                      <FaChevronUp
                        style={{ marginLeft: "5px", fontSize: "12px" }}
                      />
                      <FaChevronDown
                        style={{ marginLeft: "5px", fontSize: "12px" }}
                      />
                    </span>
                  )}
                </>
              )}
            </TableHeader>
          ))}
          rows={rows}
        />
      </div>

      {/* Payment Table (Duplicate) */}
      <div style={{ marginTop: "20px" }}>
        <h3>Payment</h3>
        <Table
          headers={PaymentHeaders.map((header) => (
            <TableHeader key={header.key}>{header.title}</TableHeader>
          ))}
          rows={PayableRows}
        />
      </div>

      {selectedDelivery && (
        <CustomerDeliveryDetails
          delivery={selectedDelivery}
          onClose={closeDetailsModal}
        />
      )}
      {selectedPayment && (
        <CustomerPayment
          customer={selectedPayment}
          onClose={closePaymentModal}
        />
      )}
    </>
  );
};

export default SharedCustomerDeliveryPage;
