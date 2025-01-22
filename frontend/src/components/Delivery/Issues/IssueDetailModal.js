import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button";
import { colors } from "../../../colors";

const IssueDetailModal = ({ issue, issueItems, onClose }) => {
  const [remarks, setRemarks] = useState("");
  const [issueType, setIssueType] = useState("");
  const [qtyAccepted, setQtyAccepted] = useState([]);

  // Function to calculate the total defect amount
  const calculateTotalDefectAmount = (issueItems) => {
    if (!Array.isArray(issueItems)) return 0; // Ensure issueItems is an array
    return issueItems.reduce((total, item) => {
      const defectPrice =
        Number(item.ISSUE_QTY_DEFECT) * Number(item.ISSUE_PROD_LINE_PRICE);
      return total + defectPrice;
    }, 0);
  };

  // Function to calculate the total order value
  const calculateTotalOrderValue = (issueItems) => {
    if (!Array.isArray(issueItems)) return 0; // Ensure issueItems is an array
    return issueItems.reduce((total, item) => {
      return total + Number(item.ISSUE_LINE_TOTAL_PRICE);
    }, 0);
  };

  return (
    <Modal
      data-cy="supplier-create-issue-modal"
      title="Report a Supplier Orders Issue"
      onClose={onClose}
    >
      <DetailsContainer>
        <DetailsColumn>
          <Detail>
            <strong>
              Customer/Supplier Name:
              <br />
            </strong>{" "}
            {issue?.name || "N/A"}
          </Detail>
        </DetailsColumn>
        <DetailsColumn>
          <Detail>
            <strong>Issue No:</strong> {issue?.ISSUE_NO || "N/A"}
          </Detail>
          <Detail>
            <strong>Delivery ID:</strong> {issue?.DELIVERY_ID || "N/A"}
          </Detail>
        </DetailsColumn>
        <DetailsColumn>
          <Detail>
            <strong>Delivery Type: </strong>
            {issue?.ORDER_TYPE || "N/A"}
          </Detail>
          <Detail>
            <strong>Resolution: </strong>
            {issue?.RESOLUTION || "N/A"}
          </Detail>
        </DetailsColumn>
      </DetailsContainer>
      <RemarksLabel>Description of the Issue:</RemarksLabel>
      <RemarksTextArea
        value={issue?.REMARKS}
        placeholder="Describe the issue with the product"
      />

      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Quantity Defective</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Total</TableHeader>
          </tr>
        </thead>
        <tbody>
          {issueItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.ISSUE_PROD_NAME}</TableCell>
              <TableCell>{item.ISSUE_QTY_DEFECT}</TableCell>
              <TableCell>{item.ISSUE_PROD_LINE_PRICE}</TableCell>
              <TableCell>{item.ISSUE_LINE_TOTAL_PRICE}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>

      {/* Summary Section - Right aligned */}
      <SummarySection>
        <FormGroup>
          <Label>Total Defect Amount:</Label>
          {/* Uncomment and implement the calculation function */}
          <Value>₱{calculateTotalDefectAmount(issueItems).toFixed(2)}</Value>
        </FormGroup>
        <FormGroup>
          <Label>Total Order Value:</Label>
          {/* Uncomment and implement the calculation function */}
          <Value>₱{calculateTotalOrderValue(issueItems).toFixed(2)}</Value>
        </FormGroup>
      </SummarySection>

      <ButtonGroup>
        <Button variant="red" onClick={onClose}>
          Cancel
        </Button>
        {/* Uncomment and implement the handleSubmit function */}
        {/* <Button variant="primary" onClick={handleSubmit}>
          Submit Issue
        </Button> */}
      </ButtonGroup>
    </Modal>
  );
};

// Styled Components (same as in your original code)
const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const RemarksLabel = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
`;

const RemarksTextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
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
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const SummarySection = styled.div`
  margin-top: 20px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end; // Align the summary content to the right
`;

const FormGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  width: 100%;
`;

const Value = styled.div`
  color: ${colors.text};
  text-align: left;
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
  font-size: 1.1rem;
`;

export default IssueDetailModal;
