import React, { useState } from "react";
import Modal from "../Layout/Modal";
import styled from "styled-components";
import Button from "../Layout/Button";
import { addCustomer } from "../../api/CustomerApi"; // Import the addCustomer API function
import { notify } from "../Layout/CustomToast"; // Import the toast notification utility

const AddCustomerModal = ({ onClose, onAdd }) => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientProvince, setClientProvince] = useState("");
  const [clientPhoneNum, setClientPhoneNum] = useState("09"); // Default to "09"
  const [errors, setErrors] = useState({});

  const validatePhoneNumber = (phoneNum) => {
    const phoneRegex = /^09\d{9}$/; // Must start with "09" and be exactly 11 digits
    return phoneRegex.test(phoneNum);
  };

  const handleAddCustomer = async () => {
    let newErrors = {};

    // Validate all fields are filled
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!clientAddress) newErrors.clientAddress = "Address is required";
    if (!clientProvince) newErrors.clientProvince = "Province is required";

    // Validate phone number
    if (!clientPhoneNum) {
      newErrors.clientPhoneNum = "Phone number is required";
    } else if (!validatePhoneNumber(clientPhoneNum)) {
      newErrors.clientPhoneNum = "Phone number must start with '09' and be exactly 11 digits";
    }

    if (Object.keys(newErrors).length === 0) {
      const newClient = {
        name: `${firstName} ${middleName} ${lastName}`.trim(),
        address: clientAddress,
        province: clientProvince,
        phoneNumber: clientPhoneNum,
      };

      try {
        const addedCustomer = await addCustomer(newClient);
        notify.success("Customer added successfully!");
        onAdd(addedCustomer);
        logCustomerCreation(addedCustomer);

        onClose();
      } catch (error) {
        console.error("Error adding customer:", error);
        notify.error("An error occurred while adding the customer.");
      }
    } else {
      setErrors(newErrors);
    }
  };

  const logCustomerCreation = async (addedCustomer) => {
    const userId = localStorage.getItem("user_id");

    const logPayload = {
      LOG_TYPE: "User logs",
      LOG_DESCRIPTION: `Added new customer: 
      Name: ${addedCustomer.name}, 
      Address: ${addedCustomer.address}, 
      Province: ${addedCustomer.province}, 
      Phone Number: ${addedCustomer.phoneNumber}`,
      USER_ID: userId,
    };

    try {
      const response = await fetch("http://localhost:8000/logs/logs/", {
        method: "POST",
        body: JSON.stringify(logPayload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Customer log successfully created:", logPayload);
      } else {
        const errorData = await response.json();
        console.error("Failed to create log:", errorData);
      }
    } catch (error) {
      console.error("Error logging customer creation:", error);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;

    if (/^\d*$/.test(value) && value.length <= 11) {
      setClientPhoneNum(value.length === 0 ? "09" : value);
    }
  };

  return (
    <Modal title="Add New Customer" onClose={onClose}>
      <Form>
        <Label>Customer Name</Label>
        <NameContainer>
          <NameInput
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <NameInput
            type="text"
            placeholder="Middle Name"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <NameInput
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </NameContainer>
        {errors.firstName && <Error>{errors.firstName}</Error>}
        {errors.lastName && <Error>{errors.lastName}</Error>}

        <Label>Location</Label>
        <LocationContainer>
          <CityInput
            type="text"
            placeholder="Address"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
          />
          {errors.clientAddress && <Error>{errors.clientAddress}</Error>}
          <ProvinceInput
            type="text"
            placeholder="Province"
            value={clientProvince}
            onChange={(e) => setClientProvince(e.target.value)}
          />
          {errors.clientProvince && <Error>{errors.clientProvince}</Error>}
        </LocationContainer>

        <Label>Phone Number</Label>
        {errors.clientPhoneNum && <Error>{errors.clientPhoneNum}</Error>}
        <Input
          type="text"
          placeholder="Enter Phone Number"
          value={clientPhoneNum}
          maxLength="11"
          onChange={handlePhoneNumberChange}
        />

        <ButtonGroup>
          <Button variant="red" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCustomer}>
            Add Customer
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
};

// Styled Components
const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-weight: bold;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const NameContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const NameInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const LocationContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const CityInput = styled(Input)`
  flex: 1;
`;

const ProvinceInput = styled(Input)`
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Error = styled.p`
  color: red;
  font-size: 12px;
  margin-bottom: -10px;
`;

export default AddCustomerModal;
