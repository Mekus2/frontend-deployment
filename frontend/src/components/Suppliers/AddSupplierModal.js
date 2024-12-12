import React, { useState } from "react";
import Modal from "../Layout/Modal";
import styled from "styled-components";
import Button from "../Layout/Button";
import { addSupplier } from "../../api/SupplierApi"; // Import the addSupplier API function
import { notify } from "../Layout/CustomToast"; // Import the toast notification utility

const AddSupplierModal = ({ onClose, onAdd }) => {
  const [supplierName, setSupplierName] = useState("");
  const [supplierNumber, setSupplierNumber] = useState("0");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonNumber, setContactPersonNumber] = useState("0");
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    if (!supplierName) newErrors.supplierName = "Supplier name is required.";
    if (!/^\d{11}$/.test(supplierNumber)) newErrors.supplierNumber = "Supplier number must be 11 digits and start with '0'.";
    if (!contactPersonName) newErrors.contactPersonName = "Contact person name is required.";
    if (!/^\d{11}$/.test(contactPersonNumber)) newErrors.contactPersonNumber = "Contact person number must be 11 digits and start with '0'.";
    return newErrors;
  };

  const handleAddSupplier = async () => {
    const newErrors = validateFields();
    if (Object.keys(newErrors).length === 0) {
      const newSupplier = {
        Supp_Company_Name: supplierName,
        Supp_Company_Num: supplierNumber,
        Supp_Contact_Pname: contactPersonName,
        Supp_Contact_Num: contactPersonNumber,
      };

      try {
        const addedSupplier = await addSupplier(newSupplier); // Call API function to add supplier
        notify.success("Supplier added successfully!"); // Success toast notification
        onAdd(addedSupplier); // Pass the added supplier data to the parent
        logUserCreation(addedSupplier);
        onClose(); // Close the modal
      } catch (error) {
        console.error("Error adding supplier:", error);
        notify.error("An error occurred while adding the supplier."); // General error toast notification
      }
    } else {
      setErrors(newErrors);
      
      // Show toast notifications for each error
      if (newErrors.supplierName) notify.error(newErrors.supplierName);
      if (newErrors.supplierNumber) notify.error(newErrors.supplierNumber);
      if (newErrors.contactPersonName) notify.error(newErrors.contactPersonName);
      if (newErrors.contactPersonNumber) notify.error(newErrors.contactPersonNumber);
    }
  };

  const handleNumberChange = (setter) => (e) => {
    const value = e.target.value;
    if (value.length === 0 || (value.length === 1 && value === "0")) return;
    if (/^\d*$/.test(value) && value.length <= 11) {
      setter(value.startsWith("0") ? value : "0" + value);
    }
  };

  const logUserCreation = async (addedSupplier) => {
    // Fetch the user_id from localStorage
    const userId = localStorage.getItem("user_id");

    // Destructure fields from the addedSupplier object
    const {
        Supp_Company_Name: supplierName,
        Supp_Company_Num: supplierNumber,
        Supp_Contact_Pname: contactPersonName,
        Supp_Contact_Num: contactPersonNumber,
    } = addedSupplier;

    // Prepare the log payload
    const logPayload = {
        LLOG_TYPE: "User logs",
        LOG_DESCRIPTION: `Added new supplier: Company name & number: ${supplierName} ${supplierNumber} 
        -- Contact person and number: ${contactPersonName} ${contactPersonNumber}`,
        USER_ID: userId,
    };

    try {
        // Send the log data to the backend
        const response = await fetch("http://127.0.0.1:8000/logs/logs/", {
            method: "POST",
            body: JSON.stringify(logPayload),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            console.log("Supplier Log successfully created:", logPayload);
        } else {
            const errorData = await response.json();
            console.error("Failed to create log:", errorData);
        }
    } catch (error) {
        console.error("Error logging user creation:", error);
    }
};



  return (
    <Modal title="Add New Supplier" onClose={onClose}>
      <Form>
        <Label>Supplier Name</Label>
        {errors.supplierName && <Error>{errors.supplierName}</Error>}
        <Input
          type="text"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          placeholder="Enter supplier name"
        />
        
        <Label>Supplier Number</Label>
        {errors.supplierNumber && <Error>{errors.supplierNumber}</Error>}
        <Input
          type="text"
          value={supplierNumber}
          onChange={handleNumberChange(setSupplierNumber)}
          placeholder="Enter supplier number"
          maxLength="11"
        />
        
        <Label>Contact Person Name</Label>
        {errors.contactPersonName && <Error>{errors.contactPersonName}</Error>}
        <Input
          type="text"
          value={contactPersonName}
          onChange={(e) => setContactPersonName(e.target.value)}
          placeholder="Enter contact person name"
        />
        
        <Label>Contact Person Number</Label>
        {errors.contactPersonNumber && <Error>{errors.contactPersonNumber}</Error>}
        <Input
          type="text"
          value={contactPersonNumber}
          onChange={handleNumberChange(setContactPersonNumber)}
          placeholder="Enter contact person number"
          maxLength="11"
        />
        
        <ButtonGroup>
          <Button variant="red" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSupplier}>
            Add Supplier
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Error = styled.p`
  color: red;
  font-size: 12px;
  margin-bottom: -13px;
`;

export default AddSupplierModal;
