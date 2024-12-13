import axios from "axios";

// const BASE_URL = "https://backend-deployment-production-92b6.up.railway.app";

export const getProductByName = async (query, signal) => {
  try {
    const response = await axios.get(
      `https://backend-deployment-production-92b6.up.railway.app/items/search/?q=${encodeURIComponent(
        query
      )}`,
      {
        signal, // Use the signal for aborting requests
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // Assuming the response contains the products directly
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request canceled:", error.message);
    } else {
      console.error("Error fetching products:", error);
    }
    return [];
  }
};
