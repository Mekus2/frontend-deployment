import axios from "axios";

const BASE_URL = "http://localhost:8000";

export async function updateInvoice(invoiceId, terms, amount, amountPaid) {
  try {
    const response = await fetch(
      `http://localhost:8000/sales/${invoiceId}/payment`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          terms: terms,
          amount: amount,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update the invoice.");
    }

    const updatedInvoice = await response.json();
    return updatedInvoice; // This is the updated invoice data returned from the backend.
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
}

export const FetchSalesReport = async ({
  searchTermType,
  searchTerm,
  page = 1,
}) => {
  try {
    // Build the query parameters for the API request based on searchTermType
    const params = {
      search_term_type: "customer", // The type of the search (e.g., "customer", "date", etc.)
      search_term: searchTerm, // The actual value of the search (e.g., name, date, etc.)
      page: page, // Page number for pagination
    };

    // Make the API call to the backend
    const response = await axios.get(`${BASE_URL}/sales/sales-report/`, {
      params,
    });

    // Return the response data
    console.log("Fetched Reports Data:", response.data);
    return response.data; // Assuming the backend response contains 'results' and 'count' fields
  } catch (error) {
    console.error("Error fetching sales report:", error);
    throw error; // Propagate error to be handled in the calling component
  }
};

export const fetchSalesInvoices = async ({
  search = "",
  startDate = "",
  endDate = "",
  page = 1,
} = {}) => {
  const baseUrl = "http://127.0.0.1:8000/sales/sales-invoice-list/";

  // Construct query parameters
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (startDate) queryParams.append("start_date", startDate);
  if (endDate) queryParams.append("end_date", endDate);
  queryParams.append("page", page);

  const url = `${baseUrl}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Returns the paginated sales invoices with totals
  } catch (error) {
    console.error("Failed to fetch sales invoices:", error);
    throw error;
  }
};

// Function to fetch sales invoice details based on SALES_INV_ID
export const fetchSalesInvoiceDetails = async (salesInvId) => {
  try {
    // Send a GET request to the API view for the sales invoice details
    const response = await axios.get(
      `${BASE_URL}/sales/sales-invoice-details/${salesInvId}/`
    );

    // Return the response data if successful
    return response.data;
  } catch (error) {
    // Handle errors, if any
    console.error("Error fetching sales invoice details:", error);

    // Return an error message
    return {
      error: error.response
        ? error.response.data
        : "An unexpected error occurred.",
    };
  }
};
