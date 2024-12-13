// src/api/apiConfig.js

const API_BASE_URL =
  "https://backend-deployment-production-92b6.up.railway.app"; // Base URL for your API

const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/account/users/`,
  FORGOT_PASSWORD: `${API_BASE_URL}/forgot/`,
  // Add other endpoints here
  // Example:
  // PRODUCTS: `${API_BASE_URL}/products/`,
};

export default API_ENDPOINTS;
