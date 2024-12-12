import React, { useEffect, useState, useRef } from "react";
import Modal from "../../Layout/Modal";
// import INBOUND_DELIVERY from "../../../data/InboundData"; // Import the data
import { fetchOrderDetails } from "../../../api/SupplierDeliveryApi";
import { updateOrderStatus } from "../../../api/SupplierDeliveryApi";
import { addNewInventory } from "../../../api/InventoryApi";
import submitIssueTicket from "../../../api/addIssueAPI";
import Button from "../../Layout/Button";
// Import the styles
import {
  DetailsContainer,
  Column,
  FormGroup,
  Label,
  Value,
  ProgressSection,
  ProgressBar,
  ProgressFiller,
  ProgressText,
  ProductTable,
  TableHeader,
  TableRow,
  TableCell,
  TotalSummary,
  SummaryItem,
  HighlightedTotal,
  ModalFooter,
  StatusButton,
  InputContainer,
  Asterisk,
} from "./SupplierDeliveryStyles"; // Adjust the import path as needed
import { addNewInventoy } from "../../../api/InventoryApi";
import { notify } from "../../Layout/CustomToast";
import styled from "styled-components";
import SupplierCreateIssue from "./SupplierCreateIssue";

const SupplierDeliveryDetails = ({ delivery, onClose }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [status, setStatus] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [expiryDates, setExpiryDates] = useState([]);
  const [qtyAccepted, setQtyAccepted] = useState([]);
  const [receivedClicked, setReceivedClicked] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isIssueDetailsOpen, setIsIssueDetailsOpen] = useState(false); // State for IssueDetails modal
  const [issueReported, setIssueReported] = useState(false); // Track if issue has been reported

  const today = new Date().toISOString().split("T")[0]; // Get today's date for validation

  useEffect(() => {
    const fetchDetails = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (delivery.INBOUND_DEL_ID) {
        setLoading(true);
        setError(null);
        try {
          console.log(
            `Fetching details for Order ID: ${delivery.INBOUND_DEL_ID}`
          );
          const details = await fetchOrderDetails(
            delivery.INBOUND_DEL_ID,
            controller.signal
          );
          console.log("Received Details:", details);
          setOrderDetails(details);
          setStatus(delivery.INBOUND_DEL_STATUS);
          setReceivedDate(
            delivery.INBOUND_DEL_DATE_DELIVERED || "Not yet Received"
          );
        } catch (err) {
          if (err.name === "AbortError") {
            console.log("Fetch aborted"); // Request was canceled
          } else {
            console.error("Failed to fetch order details:", err); // Improved debug line for errors
            setError("Failed to fetch order details.");
          }
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDetails();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Early return if order is not provided
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!orderDetails) return null;
  if (!delivery) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Return empty string if invalid date
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const handleIssueModalSubmit = async (
    updatedOrderDetails,
    remarks,
    issueType,
    resolution
  ) => {
    console.log(
      "Issue reported:",
      updatedOrderDetails,
      remarks,
      issueType,
      resolution
    );

    // Build the details array by iterating through updatedOrderDetails
    const issueDetails = updatedOrderDetails
      .filter((item) => item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT > 0) // Only include items with defective quantities
      .map((item) => ({
        ISSUE_PROD_ID: item.INBOUND_DEL_DETAIL_PROD_ID, // Use the correct key for product ID
        ISSUE_PROD_NAME: item.INBOUND_DEL_DETAIL_PROD_NAME,
        ISSUE_QTY_DEFECT: item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT, // Use the correct key for defective quantity
        ISSUE_PROD_LINE_PRICE: item.INBOUND_DEL_DETAIL_LINE_PRICE,
        ISSUE_LINE_TOTAL_PRICE:
          item.INBOUND_DEL_DETAIL_LINE_PRICE *
          item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT, // To be used to deduct total amount of inbound delivery if offset
      }));

    const issueData = {
      ORDER_TYPE: "Supplier Delivery",
      ISSUE_TYPE: issueType, // Use the selected issue type
      RESOLUTION: resolution, // Use the selected resolution
      REMARKS: remarks, // Use the remarks provided
      SUPPLIER_DELIVERY_ID: delivery.INBOUND_DEL_ID,
      SUPPLIER_ID: delivery.INBOUND_DEL_SUPPLIER_ID,
      SUPPLIER_NAME: delivery.INBOUND_DEL_SUPP_NAME,
      details: issueDetails, // Attach the dynamically built details array
    };
    console.log("Final issue data to submit:", issueData);

    try {
      // Call the submitIssueTicket API to send data to the backend
      const response = await submitIssueTicket(issueData);
      console.log("Issue successfully submitted:", response);

      // Mark issue as reported after successful submission
      setIssueReported(true);
      setIsIssueModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Failed to create issue:", error);
      // Handle error appropriately (e.g., show error message)
    }

    setIssueReported(true); // Mark issue as reported after submission
    setIsIssueModalOpen(false); // Close the modal
  };

  const handleStatusChange = async (
    orderId,
    currentStatus,
    newStatus,
    expiryDates = []
  ) => {
    let toastMessage = "";
    let toastType = "info"; // Default toast type

    // Check if expiry dates are required
    if (currentStatus === "Dispatched" && newStatus === "Delivered") {
      const areAllExpiryDatesFilled = expiryDates.every((date) => date !== "");
      if (!areAllExpiryDatesFilled) {
        console.error("Please fill in all expiry dates.");
        toastMessage =
          "All expiry dates must be filled before marking as delivered.";
        toastType = "warning"; // Warning toast
        notify[toastType](toastMessage); // Show the warning toast
        return;
      }
    }

    // Prevent invalid status transitions
    if (currentStatus !== "Dispatched" && newStatus === "Delivered") {
      console.error(
        "Invalid status transition. Can only mark as delivered from 'Dispatched'."
      );
      toastMessage =
        "Invalid status transition. Can only mark as delivered from 'Dispatched'.";
      toastType = "error"; // Error toast
      notify[toastType](toastMessage); // Show the error toast
      return;
    }

    try {
      // Call backend to update status
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      if (updatedOrder) {
        console.log(`Order status updated to "${newStatus}":`, updatedOrder);

        // Display success toast
        toastMessage = `Order status updated to "${newStatus}".`;
        toastType = "success";
        notify[toastType](toastMessage);

        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating order status:", error);

      // Show error toast
      toastMessage = "Failed to update the order status. Please try again.";
      toastType = "error";
      notify[toastType](toastMessage);
    }
  };

  // Function to handle Qty Accepted input change
  const handleQtyAcceptedChange = (index, value) => {
    const qtyOrdered = orderDetails[index].INBOUND_DEL_DETAIL_ORDERED_QTY;
    const parsedValue = parseInt(value, 10);

    // If value is empty, reset to 0, otherwise set the new value
    const newQtyAccepted = [...qtyAccepted];
    if (value === "") {
      newQtyAccepted[index] = 0;
    } else if (
      isNaN(parsedValue) || // Check if not a valid number
      parsedValue < 0 || // Ensure it's not negative
      parsedValue > qtyOrdered // Ensure it doesn't exceed the ordered quantity
    ) {
      newQtyAccepted[index] = 0; // Reset to 0 for invalid input
    } else {
      newQtyAccepted[index] = parsedValue;
    }

    // Calculate the defect quantity and update both states at once
    const updatedOrderDetails = [...orderDetails];
    const defectQty = newQtyAccepted[index]
      ? qtyOrdered - newQtyAccepted[index] // Calculate defect quantity
      : 0;

    updatedOrderDetails[index] = {
      ...updatedOrderDetails[index],
      INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT: newQtyAccepted[index],
      INBOUND_DEL_DETAIL_LINE_QTY_DEFECT: defectQty,
    };

    console.log("Updated Qty Accepted:", updatedOrderDetails);

    // Set both states in one go
    setQtyAccepted(newQtyAccepted);
    setOrderDetails(updatedOrderDetails);
  };

  // Get progress percentage for each status
  const getProgressPercentage = () => {
    switch (status) {
      case "Pending":
        return 33; // 33% progress for Awaiting
      case "Dispatched":
        return 66; // 66% progress for Dispatched
      case "Delivered":
        return 100; // 100% progress for Received
      default:
        return 0; // Default progress if status is unknown
    }
  };
  const handleIssueModalOpen = () => setIsIssueModalOpen(true);
  const handleIssueModalClose = () => setIsIssueModalOpen(false); // This closes the initial modal

  const handleIssueDetailsOpen = () => setIsIssueDetailsOpen(true); // Open IssueDetails modal
  const handleIssueDetailsClose = () => setIsIssueDetailsOpen(false); // Close IssueDetails modal

  // Update expiry date for specific row
  const handleExpiryDateChange = (index, value) => {
    const newExpiryDates = [...expiryDates];
    newExpiryDates[index] = value; // Set the specific index with new date value
    setExpiryDates(newExpiryDates);

    // Update orderDetails only if the expiry date has changed
    const updatedOrderDetails = [...orderDetails];
    const currentExpiryDate =
      orderDetails[index].INBOUND_DEL_DETAIL_PROD_EXP_DATE;

    if (value !== currentExpiryDate) {
      updatedOrderDetails[index] = {
        ...updatedOrderDetails[index], // Keep other fields unchanged
        INBOUND_DEL_DETAIL_PROD_EXP_DATE: value, // Update the expiry date
      };

      console.log("Updated Expiry Dates:", updatedOrderDetails);
      setOrderDetails(updatedOrderDetails); // Update orderDetails state
    }
  };

  // Calculate total value for each product (Quantity Delivered * Price per Unit)
  const calculateItemTotal = (qtyAccepted, price) => qtyAccepted * price;

  // Calculate total quantity and total amount for the summary
  const totalQuantity = orderDetails.reduce(
    (total, item) => total + item.INBOUND_DEL_DETAIL_ORDERED_QTY,
    0
  );
  const totalAmount = orderDetails.reduce(
    (total, item, index) =>
      total +
      calculateItemTotal(
        qtyAccepted[index], // Use qtyAccepted instead of qtyOrdered
        item.INBOUND_DEL_DETAIL_LINE_PRICE
      ),
    0
  );

  // Handle the Mark as Received button click
  const handleMarkAsReceivedClick = async () => {
    setReceivedClicked(true);

    const areExpiryDatesFilled = expiryDates.every(
      (date) => date && date.trim() !== ""
    );

    const areQuantitiesFilled = orderDetails.every(
      (item) =>
        item.INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT &&
        item.INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT > 0
    );

    const areAllItemsAccepted = orderDetails.every(
      (item) => item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT === 0
    );

    if (!areExpiryDatesFilled || !areQuantitiesFilled || !areAllItemsAccepted) {
      if (!areExpiryDatesFilled) {
        console.log("Some expiry dates are missing.");
        notify.warning("Please fill in all expiry dates before proceeding.");
      }
      if (!areQuantitiesFilled) {
        console.log("Some quantities are missing or invalid.");
        notify.warning(
          "Please ensure all accepted quantities are filled and greater than 0."
        );
      }
      if (!areAllItemsAccepted) {
        console.log("Some items are not accepted due to defects.");
        notify.warning("Has defective items. Submit Issue ticket?");
      }
      return; // Early exit if validation fails
    }

    const logPayload = {
      REPORT_TYPE: "Purchase",
      REPORT_DATETIME: new Date().toISOString(),
      REPORT_TITLE: "Received Items Report",
      REPORT_DESCRIPTION:
        "Report for the items received in the current purchase order.",
      REPORT_CREATED_USER_ID: localStorage.getItem("user_id"),
    };

    const inventoryData = {
      INBOUND_DEL_ID: delivery.INBOUND_DEL_ID,
      status: "Delivered",
      user: localStorage.getItem("user_first_name"),
      details: orderDetails.map((item, index) => ({
        PRODUCT_ID: item.INBOUND_DEL_DETAIL_PROD_ID,
        PRODUCT_NAME: item.INBOUND_DEL_DETAIL_PROD_NAME,
        QUANTITY_ON_HAND: item.INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT,
        ACCEPTED_QTY: item.INBOUND_DEL_DETAIL_LINE_QTY_ACCEPT,
        DEFECT_QTY: item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT,
        PRICE: item.INBOUND_DEL_DETAIL_LINE_PRICE,
        EXPIRY_DATE: expiryDates[index],
      })),
    };

    try {
      // Step 1: Create the report
      const response = await fetch("http://127.0.0.1:8000/report/report/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify(logPayload),
      });

      if (response.ok) {
        const report = await response.json();
        console.log("Report created successfully:", report);
        notify.success("Report created successfully!");
      } else {
        const error = await response.json();
        console.error("Failed to create report:", error);
        notify.error("Failed to create report. Please try again.");
      }

      // Step 2: Add inventory
      const inventoryResponse = await addNewInventory(inventoryData);
      if (inventoryResponse) {
        console.log("Inventory updated successfully:", inventoryResponse);
        notify.success("Inventory has been updated successfully!");
        window.location.reload();
      } else {
        console.error("Failed to add inventory.");
        notify.error("Failed to update inventory. Please try again.");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error during the process:", error);
      notify.error("An error occurred while processing your request.");
    }
  };

  // Calculate Qty Defect (Difference between Delivered Quantity and Accepted Quantity)
  const calculateQtyDefect = (index) => {
    const qtyDelivered = orderDetails[index].INBOUND_DEL_DETAIL_ORDERED_QTY;
    const qtyAcceptedForItem = qtyAccepted[index];

    // Calculate the defect quantity
    const defectQty = qtyAcceptedForItem
      ? qtyDelivered - qtyAcceptedForItem
      : 0;

    // Check if the defect quantity has actually changed before updating state
    if (defectQty !== orderDetails[index].INBOUND_DEL_DETAIL_LINE_QTY_DEFECT) {
      // Only update the orderDetails state if the defect quantity has changed
      const updatedOrderDetails = [...orderDetails];
      updatedOrderDetails[index] = {
        ...updatedOrderDetails[index], // Keep other fields unchanged
        INBOUND_DEL_DETAIL_LINE_QTY_DEFECT: defectQty, // Set defect quantity
      };

      setOrderDetails(updatedOrderDetails); // Update the state
    }

    return defectQty;
  };
  return (
    <Modal
      data-cy="inbound-delivery-details-modal"
      title="Inbound Delivery Details"
      status={status}
      onClose={onClose}
    >
      <DetailsContainer>
        <Column>
          <FormGroup>
            <Label>Delivery ID:</Label>
            <Value>{delivery.INBOUND_DEL_ID}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Supplier Name:</Label>
            <Value>{delivery.INBOUND_DEL_SUPP_NAME}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Received Date:</Label>
            <Value>{formatDate(receivedDate)}</Value>
          </FormGroup>
        </Column>
        <Column>
          <FormGroup>
            <Label>Order ID:</Label>
            <Value>{delivery.PURCHASE_ORDER_ID}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Date Created:</Label>
            <Value>{formatDate(delivery.INBOUND_DEL_ORDER_DATE_CREATED)}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Received By:</Label>
            <Value>{delivery.INBOUND_DEL_RCVD_BY_USER_NAME || ""}</Value>
          </FormGroup>
        </Column>
      </DetailsContainer>
      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Qty Ordered</TableHeader>
            <TableHeader>Qty Accepted</TableHeader>
            <TableHeader>Qty Defect</TableHeader>
            <TableHeader>Expiry Date</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Total</TableHeader>
          </tr>
        </thead>
        <tbody>
          {orderDetails.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.INBOUND_DEL_DETAIL_PROD_NAME}</TableCell>
              <TableCell>{item.INBOUND_DEL_DETAIL_ORDERED_QTY}</TableCell>
              <TableCell>
                {status === "Dispatched" ? (
                  <input
                    type="number"
                    min="0"
                    max={item.INBOUND_DEL_DETAIL_ORDERED_QTY}
                    value={qtyAccepted[index] === 0 ? "" : qtyAccepted[index]} // Show 0 as empty string
                    onChange={(e) => {
                      const newValue = e.target.value;

                      // Ensure the value is numeric and not a negative number
                      if (newValue === "" || /^\d+$/.test(newValue)) {
                        // Handle the change only if the value is numeric
                        handleQtyAcceptedChange(
                          index,
                          newValue === "" ? 0 : parseInt(newValue, 10)
                        );
                      }
                    }}
                    style={{
                      border: "1px solid #ccc",
                      padding: "5px",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  />
                ) : (
                  qtyAccepted[index] || 0
                )}
              </TableCell>

              <TableCell>{calculateQtyDefect(index)}</TableCell>
              <TableCell>
                {status === "Dispatched" ? (
                  <InputContainer>
                    <input
                      type="date"
                      min={today}
                      value={expiryDates[index] || ""}
                      onChange={(e) =>
                        handleExpiryDateChange(index, e.target.value)
                      }
                      style={{
                        border: "1px solid #ccc",
                        padding: "5px",
                        borderRadius: "4px",
                        textAlign: "center",
                      }}
                    />
                  </InputContainer>
                ) : (
                  item.INBOUND_DEL_DETAIL_PROD_EXP_DATE || "N/A"
                )}
              </TableCell>
              <TableCell>
                {status === "Dispatched" ? (
                  <input
                    type="number"
                    value={item.INBOUND_DEL_DETAIL_LINE_PRICE || ""}
                    min="0"
                    onInput={(e) => e.preventDefault()} // Prevent entering characters other than digits
                    onChange={(e) => {
                      const newPrice = parseFloat(e.target.value);
                      if (isNaN(newPrice) || newPrice < 0) return; // Prevent negative prices
                      const updatedOrderDetails = [...orderDetails];
                      updatedOrderDetails[index].INBOUND_DEL_DETAIL_LINE_PRICE =
                        newPrice;
                      setOrderDetails(updatedOrderDetails);
                    }}
                    style={{
                      border: "1px solid #ccc",
                      padding: "5px",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  />
                ) : (
                  `₱${item.INBOUND_DEL_DETAIL_LINE_PRICE || "0.00"}` // Only display price if available
                )}
              </TableCell>
              <TableCell>
                ₱
                {calculateItemTotal(
                  qtyAccepted[index] ?? 0,
                  item.INBOUND_DEL_DETAIL_LINE_PRICE ?? 0
                ).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>

      {/* Summary Section */}
      <TotalSummary>
        <SummaryItem>
          <strong>Total Qty Ordered:</strong> {totalQuantity}
        </SummaryItem>
        <SummaryItem>
          <strong>Total Qty Accepted:</strong>{" "}
          {qtyAccepted.reduce((total, qty) => total + qty, 0)}
        </SummaryItem>
        <SummaryItem>
          <strong>Total Amount:</strong>{" "}
          <HighlightedTotal>₱{totalAmount.toFixed(2)}</HighlightedTotal>
        </SummaryItem>
      </TotalSummary>
      {/* Progress Bar */}
      <ProgressSection>
        <ProgressBar>
          <ProgressFiller progress={getProgressPercentage()} />
        </ProgressBar>
        <ProgressText>{getProgressPercentage()}%</ProgressText>
      </ProgressSection>
      <ModalFooter>
        {/* Show the "What's the issue?" button only if the status is "Dispatched" */}
        {status === "Dispatched" && (
          <IssueButton onClick={handleIssueModalOpen}>
            What's the issue?
          </IssueButton>
        )}

        {/* General Status Button that adapts to the status */}
        {status !== "Delivered" && ( // Exclude the button for Delivered status
          <StatusButton
            onClick={() => {
              if (status === "Pending") {
                handleStatusChange(
                  delivery.INBOUND_DEL_ID,
                  status,
                  "Dispatched"
                );
              } else if (status === "Dispatched") {
                handleMarkAsReceivedClick();
              }
            }}
          >
            {status === "Pending" && "Mark as Dispatched"}
            {status === "Dispatched" && "Mark as Received"}
          </StatusButton>
        )}
      </ModalFooter>
      {/* Issue Modal */}
      {isIssueModalOpen && (
        <SupplierCreateIssue
          orderDetails={orderDetails.filter(
            (item) => item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT > 0
          )}
          onClose={handleIssueModalClose}
          onSubmit={handleIssueModalSubmit} // Assuming this is defined somewhere in your code
        />
      )}
    </Modal>
  );
};

const IssueButton = styled.button`
  color: Gray;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  margin-right: 10px;

  &:hover {
    color: black;
  }
`;

export default SupplierDeliveryDetails;
