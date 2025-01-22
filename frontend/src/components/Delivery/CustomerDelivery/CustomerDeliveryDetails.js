import React, { useEffect, useState, useRef } from "react";
import Modal from "../../Layout/Modal";
import Loading from "../../Layout/Loading";
import {
  fetchCustomerDelDetails,
  updateDeliveryStatus,
  createPaymentEntry,
} from "../../../api/CustomerDeliveryApi";
import CustomerCreateIssueModal from "./CustomerCreateIssueModal"; // Import the Issue Modal
import { notify } from "../../Layout/CustomToast";
import { jsPDF } from "jspdf";
import { logoBase64 } from "../../../data/imageData";
import {
  InvoiceButton,
  ErrorContainer,
  DetailsContainer,
  Column,
  FormGroup,
  Label,
  Value,
  ProductTable,
  TableHeader,
  TableRow,
  TableCell,
  TotalSummary,
  SummaryItem,
  HighlightedTotal,
  ProgressSection,
  ProgressBar,
  ProgressFiller,
  ProgressText,
  ModalFooter,
  StatusButton,
  IssueButton,
} from "../DeliveryStyles"; // Ensure correct path
// import CustomerPayment from "./CustomerPayment"; // Add this import at the top
import { createDeliveryIssue } from "../../../api/addIssueAPI";

const getProgressForStatus = (status) => {
  switch (status) {
    case "Pending":
      return 0;
    case "Dispatched":
      return 50;
    case "Delivered":
      return 100;
    case "Delivered with Issues":
      return 100;
    default:
      return 0;
  }
};

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

const CustomerDeliveryDetails = ({ delivery, onClose }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [status, setStatus] = useState("");
  const [receivedDate, setReceivedDate] = useState("Not Received");
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isIssueDetailsOpen, setIsIssueDetailsOpen] = useState(false); // State for IssueDetails modal
  const [issueReported, setIssueReported] = useState(false); // Track if issue has been reported

  const progress = getProgressForStatus(status);
  useEffect(() => {
    const fetchDetails = async () => {
      if (!delivery.OUTBOUND_DEL_ID) {
        console.warn("Delivery ID is not available yet");
        return;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        const details = await fetchCustomerDelDetails(
          delivery.OUTBOUND_DEL_ID,
          controller.signal
        );
        console.log("Fetched Details:", details);
        setReceivedDate(delivery.OUTBOUND_DEL_CSTMR_RCVD_DATE);
        setOrderDetails(details);
        setStatus(delivery.OUTBOUND_DEL_STATUS);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Failed to fetch order details:", error);
          setError("Failed to fetch order details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [delivery]);

  const calculateTotalQuantity = () =>
    orderDetails.reduce(
      (total, item) => total + item.OUTBOUND_DETAILS_PROD_QTY,
      0
    );
  const calculateItemTotal = (qty, price) => qty * price;
  const totalQuantity = calculateTotalQuantity();
  const totalAmount = orderDetails.reduce(
    (total, item) =>
      total +
      calculateItemTotal(
        item.OUTBOUND_DETAILS_PROD_QTY,
        item.OUTBOUND_DETAILS_SELL_PRICE
      ),
    0
  );

  const handleStatusChange = async () => {
    let newStatus;
    let updatedReceivedDate = receivedDate; // Store the updated received date (if applicable)

    // Determine the new status based on the current one
    if (status === "Pending") {
      newStatus = "Dispatched";
      notify.info("Delivery status updated to Dispatched.");
    } else if (status === "Dispatched") {
      newStatus = "Delivered"; // Update the status to Delivered

      // Call the createSalesInvoice function and store its response status in a new variable
      const outboundDeliveryId = delivery.OUTBOUND_DEL_ID;
      console.log("Updated Order Details:", orderDetails);
      const CreatePaymentStatus = await createPaymentEntry(
        outboundDeliveryId,
        orderDetails,
        newStatus
      );

      // Check the status returned from the API call
      if (CreatePaymentStatus === 200 || CreatePaymentStatus === 201) {
        // Only update status if invoice creation was successful
        notify.success(
          "Sales Invoice created successfully, Delivery marked as Delivered."
        );
        updatedReceivedDate = new Date().toISOString().split("T")[0]; // Set received date when marking as Delivered
        setReceivedDate(updatedReceivedDate); // Update the local received date
      } else {
        notify.error(
          "Failed to create Sales Invoice. Delivery status remains as Dispatched."
        );
        return; // Don't proceed if invoice creation failed
      }
    } else if (status === "Delivered") {
      newStatus = "Delivered"; // Status is already delivered, so just notify
      notify.success("Delivery marked as Delivered.");
    } else if (status === "Delivered with Issues") {
      newStatus = "Pending";
      setReceivedDate("Not Received");
      notify.error("Delivery status reset to Pending.");
    }

    // Update the local status
    setStatus(newStatus);

    // Prepare the status update data
    const statusData = {
      status: newStatus,
      receivedDate: updatedReceivedDate, // Send the updated received date if applicable
    };

    // Sync the status with the backend only if the status is "Pending"
    if (newStatus === "Dispatched") {
      try {
        const response = await updateDeliveryStatus(
          delivery.OUTBOUND_DEL_ID,
          statusData
        );

        // Check if the status was successfully updated
        if (response) {
          console.log(`Delivery status successfully updated to ${newStatus}`);
        } else {
          notify.error("Failed to update delivery status on the backend.");
        }
      } catch (error) {
        console.error("Error updating delivery status on the backend:", error);
        notify.error("Failed to update delivery status.");
      }
    }
  };

  const handleIssueModalOpen = () => setIsIssueModalOpen(true); // This remains for opening the initial "What's the issue?" modal
  const handleIssueModalClose = () => setIsIssueModalOpen(false); // This closes the initial modal

  // const handleIssueDetailsOpen = () => setIsIssueDetailsOpen(true); // Open IssueDetails modal
  // const handleIssueDetailsClose = () => setIsIssueDetailsOpen(false); // Close IssueDetails modal

  const handleIssueModalSubmit = async (
    updatedOrderDetails,
    remarks,
    issueType,
    resolution
  ) => {
    let updatedReceivedDate = receivedDate;
    const newStatus = "Delivered with Issues"; // Update the status to Delivered with Issues
    const outboundDeliveryId = delivery.OUTBOUND_DEL_ID;
    console.log("Updated Order Details:", updatedOrderDetails);

    setOrderDetails(updatedOrderDetails); // Update the order details with the new values

    const orderType = "Customer Delivery";
    const deliveryType = "outbounddelivery";

    console.log(
      `Prepared Data for Issue Report: 
      Status:${newStatus}, 
      Delivery ID:${outboundDeliveryId}, 
      Order Type:${orderType}, 
      Delivery Type:${deliveryType}, 
      Issue Type:${issueType}, 
      Resolution:${resolution}, 
      Remarks:${remarks}, `
    );
    console.log(
      "Order Details:",
      updatedOrderDetails.map((item) => ({
        ISSUE_PROD_ID: item.OUTBOUND_DETAILS_PROD_ID,
        ISSUE_PROD_NAME: item.OUTBOUND_DETAILS_PROD_NAME,
        ISSUE_QTY_DEFECT: item.OUTBOUND_DETAILS_PROD_QTY_DEFECT,
        ISSUE_PROD_LINE_PRICE: item.OUTBOUND_DETAILS_SELL_PRICE,
        ISSUE_LINE_TOTAL_PRICE:
          item.OUTBOUND_DETAILS_PROD_QTY_DEFECT *
          item.OUTBOUND_DETAILS_SELL_PRICE,
      }))
    );
    // Call the createDeliveryIssue function and store its response status in a new variable
    const addDeliveryIssue = await createDeliveryIssue(
      orderType,
      issueType,
      resolution,
      deliveryType,
      outboundDeliveryId,
      remarks,
      updatedOrderDetails
    );

    // Check the status returned from the API call
    if (addDeliveryIssue.status === 200 || addDeliveryIssue.status === 201) {
      notify.success("Issue reported successfully.");
      const CreatePaymentStatus = await createPaymentEntry(
        outboundDeliveryId,
        updatedOrderDetails,
        newStatus
      );

      // Check the status returned from the API call
      if (CreatePaymentStatus === 200 || CreatePaymentStatus === 201) {
        // Only update status if invoice creation was successful
        notify.success(
          "Sales Invoice created successfully, Delivery marked as Delivered with issues."
        );
        updatedReceivedDate = new Date().toISOString().split("T")[0]; // Set received date when marking as Delivered
        setReceivedDate(updatedReceivedDate); // Update the local received date
      } else {
        notify.error("Failed to report issue.");
        return; // Don't proceed if invoice creation failed
      }
    } else {
      notify.error("Failed to report issue.");
      return; // Don't proceed if issue reporting failed
    }

    setIssueReported(true); // Mark issue as reported after submission
    setIsIssueModalOpen(false); // Close the modal
    onClose(); // Close the main modal
  };

  const generateInvoice = () => {
    const doc = new jsPDF();
    const {
      OUTBOUND_DEL_CUSTOMER_NAME,
      OUTBOUND_DEL_CITY,
      OUTBOUND_DEL_PROVINCE,
      OUTBOUND_DEL_SHIPPED_DATE,
      OUTBOUND_DEL_CSTMR_RCVD_DATE,
      OUTBOUND_DEL_TOTAL_ORDERED_QTY,
      OUTBOUND_DEL_TOTAL_PRICE,
    } = delivery;

    // Add logo and header
    const logoWidth = 12;
    const logoHeight = logoWidth;
    const logoX = 12;
    const logoY = 5;
    const pageWidth = doc.internal.pageSize.width;

    doc.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PHILVETS", pageWidth / 2, logoY + logoHeight + 8, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("123-456-789", pageWidth / 2, logoY + logoHeight + 14, {
      align: "center",
    });

    // Add title and date
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Delivery Receipt", 14, logoY + logoHeight + 24);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      14,
      logoY + logoHeight + 30
    );

    // Customer and delivery details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Customer: ${OUTBOUND_DEL_CUSTOMER_NAME || "N/A"}`,
      14,
      logoY + logoHeight + 36
    );
    doc.text(
      `City: ${OUTBOUND_DEL_CITY || "N/A"}`,
      14,
      logoY + logoHeight + 42
    );
    doc.text(
      `Province: ${OUTBOUND_DEL_PROVINCE || "N/A"}`,
      14,
      logoY + logoHeight + 48
    );
    doc.text(
      `Shipped Date: ${formatDate(OUTBOUND_DEL_SHIPPED_DATE)}`,
      14,
      logoY + logoHeight + 54
    );
    doc.text(
      `Received Date: ${formatDate(OUTBOUND_DEL_CSTMR_RCVD_DATE)}`,
      14,
      logoY + logoHeight + 60
    );

    // Table data
    const tableData = orderDetails.map((item) => [
      item.OUTBOUND_DETAILS_PROD_NAME || "N/A",
      item.OUTBOUND_DETAILS_PROD_QTY_ORDERED,
      Number(item.OUTBOUND_DETAILS_SELL_PRICE).toFixed(2),
      calculateItemTotal(
        item.OUTBOUND_DETAILS_PROD_QTY_ORDERED,
        item.OUTBOUND_DETAILS_SELL_PRICE
      ).toFixed(2),
    ]);

    doc.autoTable({
      startY: logoY + logoHeight + 70,
      head: [["Product Name", "Quantity Shipped", "Price", "Total"]],
      body: tableData,
      styles: {
        cellPadding: 3,
        fontSize: 9,
        halign: "center",
      },
      headStyles: {
        fillColor: [0, 196, 255],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    // Total summary
    doc.text(
      `Total Quantity: ${OUTBOUND_DEL_TOTAL_ORDERED_QTY || "N/A"}`,
      14,
      doc.autoTable.previous.finalY + 10
    );
    doc.text(
      `Total Amount: ${OUTBOUND_DEL_TOTAL_PRICE || "N/A"}`,
      14,
      doc.autoTable.previous.finalY + 15
    );

    // Open PDF in a new tab (blob approach)
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  };

  return (
    <>
      <Modal
        data-cy="outbound-delivery-details-modal"
        title="Outbound Delivery Details"
        status={status}
        onClose={onClose}
      >
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorContainer>{error}</ErrorContainer>
        ) : (
          <>
            <DetailsContainer>
              <Column>
                <FormGroup>
                  <Label>Delivery ID:</Label>
                  <Value>{delivery.OUTBOUND_DEL_ID}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Shipped Date:</Label>
                  <Value>
                    {delivery.OUTBOUND_DEL_SHIPPED_DATE
                      ? formatDate(delivery.OUTBOUND_DEL_SHIPPED_DATE)
                      : "Not yet shipped"}
                  </Value>
                </FormGroup>
                <FormGroup>
                  <Label>Received Date:</Label>
                  <Value>
                    {receivedDate
                      ? formatDate(receivedDate)
                      : " Not yet received"}
                  </Value>
                </FormGroup>
              </Column>
              <Column>
                <FormGroup>
                  <Label>Delivery Option:</Label>
                  <Value>{delivery.OUTBOUND_DEL_DLVRY_OPTION}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Client:</Label>
                  <Value>{delivery.OUTBOUND_DEL_CUSTOMER_NAME}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>City:</Label>
                  <Value>{delivery.OUTBOUND_DEL_CITY}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Province:</Label>
                  <Value>{delivery.OUTBOUND_DEL_PROVINCE}</Value>
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
                  <TableHeader>Discount</TableHeader>
                  <TableHeader>Price</TableHeader>
                  <TableHeader>Total</TableHeader>
                </tr>
              </thead>
              <tbody>
                {orderDetails.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.OUTBOUND_DETAILS_PROD_NAME}</TableCell>
                    <TableCell>
                      {item.OUTBOUND_DETAILS_PROD_QTY_ORDERED}
                    </TableCell>
                    <TableCell>
                      {status === "Dispatched" ? (
                        <input
                          type="text"
                          value={item.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED ?? ""}
                          onChange={(e) => {
                            const inputValue = e.target.value;

                            // Allow empty value or numeric input only
                            const numericValue =
                              inputValue === ""
                                ? ""
                                : inputValue.replace(/[^0-9]/g, "");
                            let newQtyAccepted =
                              numericValue === ""
                                ? ""
                                : parseInt(numericValue, 10);

                            // Ensure the accepted quantity does not exceed the ordered quantity
                            if (
                              newQtyAccepted !== "" &&
                              newQtyAccepted >
                                item.OUTBOUND_DETAILS_PROD_QTY_ORDERED
                            ) {
                              newQtyAccepted =
                                item.OUTBOUND_DETAILS_PROD_QTY_ORDERED;
                            }

                            // Calculate the defect quantity based on the accepted quantity
                            const newQtyDefect =
                              newQtyAccepted === "" || newQtyAccepted === 0
                                ? 0
                                : item.OUTBOUND_DETAILS_PROD_QTY_ORDERED -
                                  newQtyAccepted;

                            // Update the order details state
                            setOrderDetails((prevDetails) =>
                              prevDetails.map((detail, detailIndex) =>
                                detailIndex === index
                                  ? {
                                      ...detail,
                                      OUTBOUND_DETAILS_PROD_QTY_ACCEPTED:
                                        newQtyAccepted,
                                      OUTBOUND_DETAILS_PROD_QTY_DEFECT:
                                        newQtyDefect,
                                    }
                                  : detail
                              )
                            );
                          }}
                          style={{
                            border: "1px solid #ccc",
                            padding: "5px",
                            borderRadius: "4px",
                            textAlign: "center",
                            width: "100%",
                          }}
                        />
                      ) : (
                        // When not "Dispatched," show the accepted quantity from OUTBOUND_DETAILS_PROD_QTY_ACCEPTED
                        item.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED || 0
                      )}
                    </TableCell>

                    <TableCell>
                      {item.OUTBOUND_DETAILS_PROD_QTY_DEFECT || 0}
                    </TableCell>
                    <TableCell>
                      {item.OUTBOUND_DETAILS_LINE_DISCOUNT || 0}
                    </TableCell>

                    <TableCell>
                      ₱
                      {(isNaN(Number(item.OUTBOUND_DETAILS_SELL_PRICE))
                        ? 0
                        : Number(item.OUTBOUND_DETAILS_SELL_PRICE)
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      ₱
                      {status === "Dispatched"
                        ? (
                            calculateItemTotal(
                              item.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED, // Use QTY_ACCEPTED if available, fallback to QTY
                              item.OUTBOUND_DETAILS_SELL_PRICE
                            ) *
                            (1 -
                              (item.OUTBOUND_DETAILS_LINE_DISCOUNT || 0) / 100)
                          ).toFixed(2)
                        : (
                            Number(item.OUTBOUND_DETAIL_LINE_TOTAL) || 0
                          ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </ProductTable>

            <TotalSummary>
              {/* Total Quantity */}
              <SummaryItem>
                <strong>Ordered Quantity:</strong>{" "}
                {orderDetails.reduce(
                  (acc, detail) =>
                    acc +
                    (parseInt(detail.OUTBOUND_DETAILS_PROD_QTY_ORDERED, 10) ||
                      0),
                  0
                )}
              </SummaryItem>
              <SummaryItem>
                <strong>Accepted Quantity:</strong>{" "}
                {orderDetails.reduce(
                  (acc, detail) =>
                    acc +
                    (parseInt(detail.OUTBOUND_DETAILS_PROD_QTY_ACCEPTED, 10) ||
                      0),
                  0
                )}
              </SummaryItem>
              <SummaryItem>
                <strong>Defective Quantity:</strong>{" "}
                {orderDetails.reduce(
                  (acc, detail) =>
                    acc +
                    (parseInt(detail.OUTBOUND_DETAILS_PROD_QTY_DEFECT, 10) ||
                      0),
                  0
                )}
              </SummaryItem>

              {/* Total Discount */}
              <SummaryItem>
                <strong>Total Discount:</strong>{" "}
                <HighlightedTotal>
                  ₱
                  {orderDetails
                    .reduce((acc, detail) => {
                      const discountValue =
                        (((parseFloat(detail.OUTBOUND_DETAILS_SELL_PRICE) ||
                          0) *
                          (parseFloat(detail.OUTBOUND_DETAILS_LINE_DISCOUNT) ||
                            0)) /
                          100) *
                        (parseInt(
                          detail.OUTBOUND_DETAILS_PROD_QTY_ORDERED,
                          10
                        ) || 0);
                      return acc + discountValue;
                    }, 0)
                    .toFixed(2)}
                </HighlightedTotal>
              </SummaryItem>

              {/* Total Cost */}
              <SummaryItem>
                <strong>Total Amount:</strong>{" "}
                <HighlightedTotal style={{ color: "#ff5757" }}>
                  ₱
                  {orderDetails
                    .reduce((acc, detail) => {
                      const totalCost =
                        (parseFloat(detail.OUTBOUND_DETAILS_SELL_PRICE) || 0) *
                        (parseInt(
                          detail.OUTBOUND_DETAILS_PROD_QTY_ORDERED,
                          10
                        ) || 0);
                      return acc + totalCost;
                    }, 0)
                    .toFixed(2)}
                </HighlightedTotal>
              </SummaryItem>
            </TotalSummary>

            <ProgressSection>
              <ProgressBar>
                <ProgressFiller progress={progress} />
              </ProgressBar>
              <ProgressText>{progress}%</ProgressText>
            </ProgressSection>

            <ModalFooter>
              {status === "Pending" && (
                <StatusButton onClick={() => handleStatusChange("Dispatched")}>
                  Mark as Dispatched
                </StatusButton>
              )}
              {status === "Dispatched" && (
                <>
                  <IssueButton onClick={handleIssueModalOpen}>
                    What's the issue?
                  </IssueButton>
                  <StatusButton onClick={() => handleStatusChange("Delivered")}>
                    Mark as Delivered
                  </StatusButton>
                </>
              )}
              {status === "Delivered" && (
                <>
                  <InvoiceButton onClick={generateInvoice}>
                    Generate Invoice
                  </InvoiceButton>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </Modal>

      {isIssueModalOpen && (
        <CustomerCreateIssueModal
          orderDetails={orderDetails}
          onClose={handleIssueModalClose}
          onSubmit={handleIssueModalSubmit}
        />
      )}
      {isIssueDetailsOpen}
    </>
  );
};

export default CustomerDeliveryDetails;
