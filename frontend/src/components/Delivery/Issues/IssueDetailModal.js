import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button";
import { colors } from "../../../colors";
import { notify } from "../../Layout/CustomToast";
import { resolveIssue } from "../../../api/addIssueAPI";

const IssueDetailModal = ({ issue, issueItems, onClose }) => {
  const [remarks, setRemarks] = useState("");
  const [qtyAccepted, setQtyAccepted] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode
  const [resolution, setResolution] = useState(""); // State to track selected resolution
  // Temporary state to store the edited quantity separately
  const [editedQty, setEditedQty] = useState(null);

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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleResolvedClick = async () => {
    try {
      // Display success notification
      notify.success("Issue Resolved!");

      // Prepare the data
      const preparedData = {
        "Issue No": issue.ISSUE_NO,
        "Delivery ID": issue.DELIVERY_ID,
        "Delivery Type": issue.ORDER_TYPE,
        Resolution: issue.RESOLUTION,
        items: issueItems.map((item) => ({
          PROD_ID: item.ISSUE_PROD_ID,
          PROD_NAME: item.ISSUE_PROD_NAME,
          QTY_DEFECT: item.ISSUE_QTY_DEFECT,
          PRICE: item.ISSUE_PROD_LINE_PRICE,
        })),
      };

      console.log("Prepared data:", preparedData);

      // Call the resolveIssue function to send data to the backend
      const result = await resolveIssue(issue, issueItems);

      // Check the result and handle accordingly
      if (result && result.message === "Issue resolved successfully") {
        // Handle success (e.g., show success message, update UI, etc.)
        console.log("Issue resolved!");
      } else {
        // Handle error (e.g., show error message, update UI, etc.)
        console.error("Error resolving issue:", result);
      }

      // Exit edit mode after resolving
      setIsEditing(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      // Optionally notify user about the error
      notify.error("An unexpected error occurred while resolving the issue.");
    }
  };

  const handleCloseClick = () => {
    setIsEditing(false); // Exit edit mode
  };

  const handleQtyChange = (e, index) => {
    const newQty = parseInt(e.target.value, 10);

    // Validate the new quantity: Ensure the new value doesn't exceed ISSUE_QTY_DEFECT
    if (newQty < 0 || newQty > issueItems[index].ISSUE_QTY_DEFECT) {
      return; // Ignore if the quantity is out of bounds
    }

    // Update the temporary edited quantity
    const updatedItems = [...issueItems];
    updatedItems[index].ISSUE_QTY_DEFECT = newQty; // Save the updated quantity
    setQtyAccepted(updatedItems); // Update the state
  };

  return (
    <Modal
      data-cy="supplier-create-issue-modal"
      title="Report a Supplier Order Issue"
      onClose={onClose}
    >
      <DetailsContainer>
        <DetailsColumn>
          <Detail>
            <strong>
              {issue?.ORDER_TYPE === "Customer Delivery"
                ? "Customer Name:"
                : "Supplier Name:"}
            </strong>{" "}
            {issue?.name || "N/A"}
          </Detail>
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
            {isEditing ? (
              <Select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              >
                <option value="" disabled>
                  Select Resolution
                </option>
                <option value="Reshipment">Reshipment</option>
                <option value="Offset Product">Offset Product</option>
                <option value="Other">Other</option>
              </Select>
            ) : (
              issue?.RESOLUTION || "N/A"
            )}
          </Detail>
        </DetailsColumn>
      </DetailsContainer>
      <RemarksLabel>Description of the Issue:</RemarksLabel>
      <RemarksTextArea
        value={issue?.REMARKS}
        placeholder="Describe the issue with the product"
        disabled={!isEditing}
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
              <TableCell>
                {isEditing ? (
                  <Input
                    type="number"
                    value={item.ISSUE_QTY_DEFECT}
                    max={item.ISSUE_QTY_DEFECT} // Set the max value to ISSUE_QTY_DEFECT
                    onChange={(e) => handleQtyChange(e, index)} // Handle change for quantity
                  />
                ) : (
                  item.ISSUE_QTY_DEFECT
                )}
              </TableCell>

              <TableCell>{item.ISSUE_PROD_LINE_PRICE}</TableCell>
              <TableCell>
                {(item.ISSUE_QTY_DEFECT * item.ISSUE_PROD_LINE_PRICE).toFixed(
                  2
                )}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>

      {/* Summary Section - Right aligned */}
      <SummarySection>
        <FormGroup>
          <Label>Total Defect Amount:</Label>
          <Value>₱{calculateTotalDefectAmount(issueItems).toFixed(2)}</Value>
        </FormGroup>
        <FormGroup>
          <Label>Total Order Value:</Label>
          <Value>₱{calculateTotalOrderValue(issueItems).toFixed(2)}</Value>
        </FormGroup>
      </SummarySection>

      <ButtonGroup>
        {/* Show Resolve or Edit buttons depending on the mode */}
        {isEditing ? (
          <>
            <Button variant="primary" onClick={handleResolvedClick}>
              Resolved
            </Button>
            <Button variant="red" onClick={handleCloseClick}>
              Close
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={handleEditClick}>
            Resolve Issue
          </Button>
        )}
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

const Input = styled.input`
  width: 100%;
  padding: 5px;
  text-align: center;
  border: 2px solid #ccc;
  border-radius: 5px;
  margin: 5px 0;
  font-size: 14px;
  &:focus {
    border-color: ${colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
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
