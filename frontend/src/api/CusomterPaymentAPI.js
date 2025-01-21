import axios from "axios";

// Base URL for the supplier API
const BASE_URL = "http://localhost:8000";

// Function to add Payment to customer order
export const addPayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/payment/customer`,
      paymentData,
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error adding new customer payment:", error);
    return null; // Return null to indicate failure
  }
};
