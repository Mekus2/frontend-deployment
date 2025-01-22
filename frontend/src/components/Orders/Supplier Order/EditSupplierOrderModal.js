import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button";
import { getProductByName } from "../../../api/fetchProducts";
import { IoCloseCircle } from "react-icons/io5"; // Importing the icon
import {
  Table,
  TableWrapper,
  TableHeader,
  TableRow,
  TableCell,
  Section,
  ButtonGroup,
  InputField,
} from "../OrderStyles";
import { notify } from "../../Layout/CustomToast";
import { updatePurchaseOrder } from "../../../api/fetchPurchaseOrders";

// Styled components for suggestions
const SuggestionsContainer = styled.div`
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
  z-index: 10;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SuggestionItem = styled.li`
  padding: 8px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: red;
  font-size: 1.5rem;
`;

const TotalSummary = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 20px;
  font-weight: bold;
`;

const SummaryItem = styled.div`
  margin-top: 10px;
`;

const EditSupplierOrderModal = ({ order, orderDetails, onClose }) => {
  const [inputStates, setInputStates] = useState([]);
  const [productSearch, setProductSearch] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);
  const [updatedOrderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    if (orderDetails.length > 0) {
      setOrderDetails(orderDetails); // Initialize updatedOrderDetails with the existing details
      setInputStates(
        orderDetails.map((detail) => ({
          productName: detail.PURCHASE_ORDER_DET_PROD_NAME,
          quantity: detail.PURCHASE_ORDER_DET_PROD_LINE_QTY,
        }))
      );
    }
  }, [orderDetails]);

  const handleProductInputChange = async (index, value) => {
    setInputStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index].productName = value;
      return newStates;
    });

    if (value.trim() === "") {
      setProductSearch(false);
      return;
    }

    setProductSearch(true);
    const products = await getProductByName(value);
    setFilteredProducts(products);
    setCurrentEditingIndex(index);

    console.log("Filtered Products:", products);
  };

  const handleProductSelect = (index, product) => {
    // Combine existing orderDetails and updatedOrderDetails for duplicate checking
    const allOrderDetails = [...orderDetails, ...updatedOrderDetails];

    // Check if the selected product already exists in either the existing or updated details
    const isProductAlreadySelected = allOrderDetails.some(
      (detail) => detail.PURCHASE_ORDER_DET_PROD_ID === product.id
    );

    if (isProductAlreadySelected) {
      notify.warning("This product is already added to the order.");
      return; // Exit early if the product is already present
    }

    // Update inputStates to reflect the selected product's display details
    setInputStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = {
        ...newStates[index], // Retain existing values (e.g., quantity if already set)
        productName: product.PROD_NAME, // Update productName
        productId: product.id, // Add or update productId if needed
      };
      return newStates;
    });

    // Update updatedOrderDetails with the selected product's details
    setOrderDetails((prevDetails) => {
      const newDetails = [...prevDetails];
      newDetails[index] = {
        ...newDetails[index], // Retain existing fields (e.g., PURCHASE_ORDER_ID, quantity)
        PURCHASE_ORDER_DET_PROD_ID: product.id, // Update with fetched product ID
        PURCHASE_ORDER_DET_PROD_NAME: product.PROD_NAME, // Update with fetched product name
      };
      return newDetails;
    });

    // Close the product search suggestions
    setProductSearch(false);
  };

  const handleAddProduct = () => {
    const newProduct = {
      PURCHASE_ORDER_DET_PROD_ID: 0,
      PURCHASE_ORDER_DET_PROD_LINE_QTY: 0,
      PURCHASE_ORDER_DET_PROD_NAME: "",
      PURCHASE_ORDER_ID: order.PURCHASE_ORDER_ID,
    };

    const newInputState = {
      productName: "",
      quantity: 0,
    };

    setOrderDetails((prevOrderDetails) => {
      const updatedDetails = [...prevOrderDetails, newProduct];
      setInputStates((prevStates) => [...prevStates, newInputState]);
      return updatedDetails;
    });

    console.log("Updated Product Details:", updatedOrderDetails);
  };

  const handleRemoveProduct = (index) => {
    // Update inputStates
    setInputStates((prevStates) => {
      const newStates = [...prevStates];
      newStates.splice(index, 1);
      return newStates;
    });

    // Update updatedOrderDetails
    setOrderDetails((prevOrderDetails) => {
      const newDetails = [...prevOrderDetails];
      newDetails.splice(index, 1);
      return newDetails;
    });
  };

  const totalQuantity = updatedOrderDetails.reduce(
    (total, detail) => total + (detail.PURCHASE_ORDER_DET_PROD_LINE_QTY || 0),
    0
  );

  // Function to update the purchase order
  const handleUpdate = async (purchaseOrderId, updatedData) => {
    try {
      // Make an API call to update the purchase order
      const successMessage = await updatePurchaseOrder(
        purchaseOrderId,
        updatedData
      );

      // Optionally, show success message
      alert(successMessage);
    } catch (error) {
      // Show an error alert if the update fails
      alert("Error updating the Purchase Order.");
      console.error("Error:", error);
    }
  };

  // Ensure orderDetails is not empty and the necessary data is available

  return (
    <Modal title="Edit Supplier Order" status="Pending" onClose={onClose}>
      {/* Order details display above the table */}
      {order && (
        <Section>
          <p>
            <strong>Order ID:</strong> {order.PURCHASE_ORDER_ID}
          </p>
          <p>
            <strong>Order Created Date:</strong>{" "}
            {new Date(order.PURCHASE_ORDER_DATE_CREATED).toLocaleDateString()}
          </p>
          <p>
            <strong>Supplier ID:</strong> {order.PURCHASE_ORDER_SUPPLIER_ID}
          </p>
          <p>
            <strong>Supplier Name:</strong>{" "}
            {order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME}
          </p>
        </Section>
      )}

      {/* Product details editable table */}
      <Section>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Product Name</TableHeader>
                <TableHeader>Quantity</TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              {updatedOrderDetails.length > 0 ? (
                updatedOrderDetails.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <InputField
                        value={
                          inputStates[index]?.productName ||
                          detail.PURCHASE_ORDER_DET_PROD_NAME
                        }
                        onChange={(e) =>
                          handleProductInputChange(index, e.target.value)
                        }
                        placeholder="Product Name"
                      />
                      {productSearch && index === currentEditingIndex && (
                        <SuggestionsContainer>
                          <SuggestionsList>
                            {filteredProducts.map((product) => (
                              <SuggestionItem
                                key={product.PROD_ID}
                                onClick={() =>
                                  handleProductSelect(index, product)
                                }
                              >
                                {product.PROD_NAME}
                              </SuggestionItem>
                            ))}
                          </SuggestionsList>
                        </SuggestionsContainer>
                      )}
                    </TableCell>
                    <TableCell>
                      <InputField
                        type="number"
                        value={
                          inputStates[index]?.quantity ||
                          detail.PURCHASE_ORDER_DET_PROD_LINE_QTY
                        }
                        onChange={(e) => {
                          const quantity = e.target.value;

                          // Update inputStates
                          setInputStates((prevStates) => {
                            const newStates = [...prevStates];
                            newStates[index] = {
                              ...newStates[index],
                              quantity: Number(quantity), // Ensure the quantity is updated
                            };
                            return newStates;
                          });

                          // Update updatedOrderDetails
                          setOrderDetails((prevDetails) => {
                            const newDetails = [...prevDetails];
                            newDetails[index] = {
                              ...newDetails[index],
                              PURCHASE_ORDER_DET_PROD_LINE_QTY:
                                Number(quantity), // Sync updated quantity
                            };
                            return newDetails;
                          });
                        }}
                        placeholder="Quantity"
                      />
                    </TableCell>
                    <TableCell>
                      <DeleteButton onClick={() => handleRemoveProduct(index)}>
                        <IoCloseCircle />
                      </DeleteButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>No order details available.</TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </TableWrapper>
        <ButtonWrapper>
          <Button variant="primary" onClick={handleAddProduct}>
            Add Product
          </Button>
        </ButtonWrapper>
      </Section>

      {/* Total Quantity display below the table */}
      <TotalSummary>
        <SummaryItem>
          <strong>Total Quantity:</strong> {totalQuantity}
        </SummaryItem>
      </TotalSummary>

      {/* Button Group */}
      <ButtonGroup>
        <Button variant="red" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            const updatedData = {
              details: updatedOrderDetails.map((detail) => ({
                PURCHASE_ORDER_DET_PROD_ID: detail.PURCHASE_ORDER_DET_PROD_ID,
                PURCHASE_ORDER_DET_PROD_NAME:
                  detail.PURCHASE_ORDER_DET_PROD_NAME,
                PURCHASE_ORDER_DET_PROD_LINE_QTY:
                  detail.PURCHASE_ORDER_DET_PROD_LINE_QTY,
              })),
            };

            const purchaseOrderId = order.PURCHASE_ORDER_ID; // The ID of the purchase order you want to update

            // Call the handleUpdate function
            handleUpdate(purchaseOrderId, updatedData);
          }}
        >
          Save Update
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

export default EditSupplierOrderModal;
