//api/fetchPurchaseOrders.js

import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const fetchPurchaseOrders = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/supplier-order/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders.");
    return [];
  }
};

export const fetchPurchaseDetailsById = async (orderId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/supplier-order/${orderId}/details`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders.");
    return [];
  }
};

export const addNewPurchaseOrder = async (orderData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/supplier-order/`,
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("New purchase order created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders.");
    return [];
  }
};

// function to update the purchase order
export const updatePurchaseOrder = async (purchaseOrderId, updatedData) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/supplier-order/${purchaseOrderId}/update/`,
      updatedData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.message || "Purchase Order updated successfully";
  } catch (error) {
    console.error("Error updating Purchase Order:", error);
    throw error;
  }
};

// API function to cancel a purchase order
export const cancelPurchaseOrder = async (purchaseOrderId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/supplier-order/${purchaseOrderId}/cancel/`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.message;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred while canceling the purchase order");
  }
};
