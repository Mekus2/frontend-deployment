import React, { useEffect, useState, useRef } from "react";
import Modal from "../../Layout/Modal";
import Loading from "../../Layout/Loading";
import { notify } from "../../Layout/CustomToast";
import {
  fetchCustomerDelDetails,
  updateDeliveryStatus,
} from "../../../api/CustomerDeliveryApi";
import {
  DetailsContainer,
  Column,
  FormGroup,
  Label,
  Value,
} from "../DeliveryStyles"; // Ensure correct path

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
        )}
      </Modal>
    </>
  );
};

export default CustomerPayment;
