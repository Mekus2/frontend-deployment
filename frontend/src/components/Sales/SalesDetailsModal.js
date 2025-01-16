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
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Ensure sales_items has a fallback to an empty array
  const salesItems = sale?.sales_items || [];

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
              <strong>Invoice ID:</strong> {sale?.SALES_INV_ID || "N/A"}
            </Detail>
            <Detail>
              <strong>Delivery ID:</strong> {sale?.OUTBOUND_DEL_ID || "N/A"}
            </Detail>
          </DetailsColumn>
          <DetailsColumn>
            <Detail>
              <strong>Customer Name:</strong> {sale?.CLIENT_NAME || "N/A"}
            </Detail>
            <Detail>
              <strong>Payment Status:</strong> {sale?.SALES_INV_PYMNT_STATUS || "N/A"}
            </Detail>
          </DetailsColumn>
          <DetailsColumn>
            <Detail>
              <strong>Total Price:</strong> {formatCurrency(sale?.SALES_INV_TOTAL_PRICE || 0)}
            </Detail>
            <Detail>
              <strong>Discount:</strong> {formatCurrency(sale?.SALES_INV_DISCOUNT || 0)}
            </Detail>
          </DetailsColumn>
          <DetailsColumn>
            <Detail>
              <strong>Gross Revenue:</strong> {formatCurrency(sale?.SALES_INV_TOTAL_GROSS_REVENUE || 0)}
            </Detail>
            <Detail>
              <strong>Gross Income:</strong> {formatCurrency(sale?.SALES_INV_TOTAL_GROSS_INCOME || 0)}
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
              <TableHeader>Gross Revenue</TableHeader>
              <TableHeader>Gross Income</TableHeader>
              <TableHeader>Total Price</TableHeader>
              <TableHeader>Discount</TableHeader>
            </tr>
          </thead>
          <tbody>
            {salesItems.length > 0 ? (
              salesItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.SALES_INV_ID || "N/A"}</TableCell>
                  <TableCell>{item.SALES_INV_DATETIME?.split("T")[0] || "N/A"}</TableCell>
                  <TableCell>{sale?.CLIENT_NAME || "N/A"}</TableCell>
                  <TableCell>{formatCurrency(item.SALES_INV_ITEM_LINE_GROSS_REVENUE)}</TableCell>
                  <TableCell>{formatCurrency(item.SALES_INV_ITEM_LINE_GROSS_INCOME)}</TableCell>
                  <TableCell>{formatCurrency(sale?.SALES_INV_TOTAL_PRICE || 0)}</TableCell>
                  <TableCell>{formatCurrency(sale?.SALES_INV_DISCOUNT || 0)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7">No sales items available.</TableCell>
              </TableRow>
            )}
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
  width: 90%;
  max-width: 900px;
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
