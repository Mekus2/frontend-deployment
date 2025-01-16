import React from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import { IoCloseCircle } from "react-icons/io5";
import Button from "../Layout/Button"; // Assuming Button is located at this path

// Utility function to format numbers as currency
const formatCurrency = (value) => {
  const numberValue = typeof value === "number" && !isNaN(value) ? value : 0;
  return `₱${numberValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const SalesDetailsModal = ({ sale, onClose }) => {
  console.log("Received Sales detail:", sale);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Modal>
        <CloseButton onClick={onClose}>
          <IoCloseCircle color="#ff5757" size={24} />
        </CloseButton>

        <Title>Sales Invoice</Title>

        {/* Invoice Details Section */}
        <DetailsContainer>
          <DetailsColumn>
            <Detail>
              <strong>Invoice ID:</strong> {sale.SALES_INV_ID || "N/A"}
            </Detail>
            <Detail>
              <strong>Delivery ID:</strong> {sale.OUTBOUND_DEL_ID || "N/A"}
            </Detail>
          </DetailsColumn>
          <DetailsColumn>
            <Detail>
              <strong>Customer Name:</strong> {sale.CLIENT_NAME || "N/A"}
            </Detail>
            <Detail>
              <strong>Payment Status:</strong>{" "}
              {sale.SALES_INV_PYMNT_STATUS || "N/A"}
            </Detail>
          </DetailsColumn>
          <DetailsColumn>
            <Detail>
              <strong>Balance:</strong>{" "}
              {formatCurrency(sale.SALES_INV_AMOUNT_BALANCE || 0)}
            </Detail>
          </DetailsColumn>
        </DetailsContainer>

        {/* Invoice Table */}
        <InvoiceTable>
          <thead>
            <tr>
              <TableHeader>Invoice ID</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Client Name</TableHeader>
              <TableHeader>Balance</TableHeader>
              <TableHeader>Status</TableHeader>
            </tr>
          </thead>
          <tbody>
            {/* Static Table Data */}
            <TableRow>
              <TableCell>INV12345</TableCell>
              <TableCell>2025-01-15</TableCell>
              <TableCell>John Doe</TableCell>
              <TableCell>{formatCurrency(500)}</TableCell>
              <TableCell>Pending</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>INV12346</TableCell>
              <TableCell>2025-01-14</TableCell>
              <TableCell>Jane Smith</TableCell>
              <TableCell>{formatCurrency(750)}</TableCell>
              <TableCell>Paid</TableCell>
            </TableRow>
          </tbody>
        </InvoiceTable>
      </Modal>
    </Backdrop>
  );
};

// Styled components

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 700px;
  padding: 20px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
`;

const Title = styled.h1`
  text-align: left;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 1.8rem;
`;

const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const DetailsColumn = styled.div`
  flex: 1;
  padding: 0 10px;
  text-align: left;
`;

const Detail = styled.div`
  margin-bottom: 10px;
  font-size: 0.9rem;
`;

const InvoiceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin: 15px 0;
`;

const TableHeader = styled.th`
  background-color: ${colors.primary};
  color: white;
  padding: 10px;
  text-align: center;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

export default SalesDetailsModal;
