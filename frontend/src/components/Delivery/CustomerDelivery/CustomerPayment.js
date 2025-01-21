import React, { useEffect, useState, useRef } from "react";
import Modal from "../../Layout/Modal";
import Loading from "../../Layout/Loading";
import { notify } from "../../Layout/CustomToast";
import {
  DetailsContainer,
  Column,
  FormGroup,
  Label,
  Value,
  InputField, // Using the existing InputField style
  Button, // Using the existing Button style
} from "../DeliveryStyles";
import { AddCustomerPayment } from "../../../api/CustomerDeliveryApi";

const formatDate = (isoDate) => {
  if (!isoDate) return "Invalid Date";

  const date = new Date(isoDate);

  if (isNaN(date)) return "Invalid Date";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

const CustomerPayment = ({ customer, onClose }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [receivedDate, setReceivedDate] = useState("Not Received");
  const [paymentAmount, setPaymentAmount] = useState("");
  const paymentId = customer.PAYMENT_ID;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!customer.PAYMENT_ID) {
        console.warn("Delivery ID is not available yet");
        return;
      }
      setLoading(false);
      console.log("Received Customer Details:", customer);
    };

    fetchDetails();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handlePaymentInputChange = (e) => {
    const value = e.target.value;

    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setPaymentAmount(value);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentAmount || isNaN(paymentAmount)) {
      notify.error("Invalid payment amount entered");
      return;
    }

    try {
      const paymentData = { CUSTOMER_AMOUNT_PAID: paymentAmount };
      const result = await AddCustomerPayment(paymentId, paymentData);

      if (result.success) {
        notify.success(`Payment of ₱${paymentAmount} submitted successfully`);
        setPaymentAmount(""); // Reset input field
        window.location.reload(); // Refresh the page to reflect the changes
      } else {
        notify.error(`Failed to submit payment: ${result.message}`);
        // window.location.reload(); // Refresh the page to reflect the changes
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      notify.error(
        "An unexpected error occurred while submitting the payment."
      );
    }
  };

  return (
    <>
      <Modal
        data-cy="outbound-delivery-details-modal"
        title="Customer Payment Details"
        status={status}
        onClose={onClose}
      >
        {loading ? (
          <Loading />
        ) : error ? (
          <div>{error}</div>
        ) : (
          <>
            <DetailsContainer>
              <Column>
                <FormGroup>
                  <Label>Delivery ID:</Label>
                  <Value>{customer.OUTBOUND_DEL_ID}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Client Name:</Label>
                  <Value>{customer.CLIENT_NAME}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Start Date:</Label>
                  <Value>
                    {customer.PAYMENT_START_DATE
                      ? formatDate(customer.PAYMENT_START_DATE)
                      : "Error: Invalid Date"}
                  </Value>
                </FormGroup>
                <FormGroup>
                  <Label>Due Date:</Label>
                  <Value>
                    {receivedDate
                      ? formatDate(customer.PAYMENT_DUE_DATE)
                      : "Error: Invalid Date"}
                  </Value>
                </FormGroup>
              </Column>
              <Column>
                <FormGroup>
                  <Label>Payment Option:</Label>
                  <Value>{customer.PAYMENT_METHOD}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Payment Terms:</Label>
                  <Value>{customer.PAYMENT_TERMS}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Amount Balance:</Label>
                  <Value>₱ {customer.AMOUNT_BALANCE}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Amount Paid:</Label>
                  <Value>₱ {customer.AMOUNT_PAID}</Value>
                </FormGroup>
              </Column>
            </DetailsContainer>
            <DetailsContainer>
              <Column>{/* Left column content remains as is */}</Column>
              <Column
                style={{
                  display: "flex",
                  justifyContent: "flex-end", // Align everything to the right side
                  alignItems: "center", // Center the items vertically in the row
                }}
              >
                <FormGroup
                  style={{
                    display: "flex", // Ensure elements are in a row
                    alignItems: "center", // Center vertically in the row
                    justifyContent: "flex-end", // Push elements to the right
                    marginBottom: "10px",
                  }}
                >
                  <Label
                    style={{
                      marginRight: "10px",
                      whiteSpace: "nowrap", // Prevent the label from breaking into a new line
                    }}
                  >
                    Payment Amount:
                  </Label>
                  <InputField
                    type="text"
                    value={paymentAmount}
                    onChange={handlePaymentInputChange}
                    placeholder="Enter amount"
                    style={{
                      maxWidth: "200px",
                      textAlign: "center", // Center text inside the input field
                      marginRight: "10px", // Space between input and button
                    }}
                  />
                  <Button
                    onClick={handlePaymentSubmit}
                    style={{
                      maxWidth: "100px", // Set a maximum width for the button
                      marginRight: "10px", // Add margin to the right of the button
                    }}
                  >
                    Submit
                  </Button>
                </FormGroup>
              </Column>
            </DetailsContainer>
          </>
        )}
      </Modal>
    </>
  );
};

export default CustomerPayment;
