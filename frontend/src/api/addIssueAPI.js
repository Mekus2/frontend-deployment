import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const createDeliveryIssue = async (
  orderType,
  issueType,
  resolution,
  deliveryType,
  outboundDeliveryId,
  remarks,
  deliveryIssueData
) => {
  try {
    // Prepare the payload for POST request, mapping your fields to match expected fields
    const requestData = {
      ORDER_TYPE: orderType,
      ISSUE_TYPE: issueType,
      RESOLUTION: resolution,
      DELIVERY_TYPE: deliveryType, // e.g., "outbounddelivery" or "inbounddelivery"
      DELIVERY_ID: outboundDeliveryId, // ID of the delivery (inbound or outbound)
      REMARKS: remarks,
      item_issues: deliveryIssueData.map((item) => ({
        ISSUE_PROD_ID: item.OUTBOUND_DETAILS_PROD_ID,
        ISSUE_PROD_NAME: item.OUTBOUND_DETAILS_PROD_NAME,
        ISSUE_QTY_DEFECT: item.OUTBOUND_DETAILS_PROD_QTY_DEFECT,
        ISSUE_PROD_LINE_PRICE: item.OUTBOUND_DETAILS_SELL_PRICE,
        ISSUE_LINE_TOTAL_PRICE: item.OUTBOUND_DETAIL_LINE_TOTAL,
      })),
    };

    // Send POST request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/delivery/issue/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create delivery issue");
    }

    // Parse the JSON response
    const responseData = await response.json();

    // Return the response data (e.g., the created delivery issue with items)
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error("Error creating delivery issue:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const createInboundDeliveryIssue = async (
  orderType,
  issueType,
  resolution,
  deliveryType,
  inboundDeliveryId,
  remarks,
  deliveryIssueData
) => {
  try {
    // Prepare the payload for POST request, mapping your fields to match expected fields
    const requestData = {
      ORDER_TYPE: orderType,
      ISSUE_TYPE: issueType,
      RESOLUTION: resolution,
      DELIVERY_TYPE: deliveryType, // e.g., "outbounddelivery" or "inbounddelivery"
      DELIVERY_ID: inboundDeliveryId, // ID of the delivery (inbound or outbound)
      REMARKS: remarks,
      item_issues: deliveryIssueData.map((item) => ({
        ISSUE_PROD_ID: item.INBOUND_DEL_DETAIL_PROD_ID,
        ISSUE_PROD_NAME: item.INBOUND_DEL_DETAIL_PROD_NAME,
        ISSUE_QTY_DEFECT: item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT,
        ISSUE_PROD_LINE_PRICE: item.INBOUND_DEL_DETAIL_LINE_PRICE,
        ISSUE_LINE_TOTAL_PRICE: (
          item.INBOUND_DEL_DETAIL_LINE_PRICE *
          item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT
        ).toFixed(2),
      })),
    };

    // Send POST request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/delivery/issue/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create delivery issue");
    }

    // Parse the JSON response
    const responseData = await response.json();

    // Return the response data (e.g., the created delivery issue with items)
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error("Error creating delivery issue:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const fetchDeliveryIssues = async () => {
  const apiUrl = "http://127.0.0.1:8000/api/delivery/issue/issue-list/"; // Replace with the correct API endpoint

  try {
    const response = await axios.get(apiUrl);
    return response.data; // Returns the serialized delivery issues data
  } catch (error) {
    console.error("Error fetching delivery issues:", error);
    throw error; // Propagates the error to the calling function for further handling
  }
};

// Function to resolve Issues
export const resolveIssue = async (issue, issueItems) => {
  const apiUrl = "http://127.0.0.1:8000/api/delivery/issue/resolve/";
  const preparedData = {
    "Issue No": issue.ISSUE_NO,
    "Delivery ID": issue.DELIVERY_ID,
    "Delivery Type": issue.ORDER_TYPE,
    Resolution: issue.RESOLUTION,
    items: issueItems.map((item) => ({
      PROD_ID: item.ISSUE_PROD_ID,
      PROD_NAME: item.ISSUE_PROD_NAME,
      QTY_DEFECT: item.ISSUE_QTY_DEFECT,
      PRICE: item.ISSUE_PROD_LINE_PRICE,
    })),
  };

  try {
    // Make a POST request to the backend API
    const response = await axios.post(apiUrl, preparedData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Handle success
    if (response.status === 200) {
      console.log("Issue resolved successfully:", response.data);
      return response.data; // You can return the response or perform other actions
    }
  } catch (error) {
    // Handle error
    if (error.response) {
      // Server responded with an error
      console.error("Error resolving issue:", error.response.data);
      return error.response.data;
    } else if (error.request) {
      // No response from server
      console.error("No response from the server:", error.request);
      return { error: "No response from server" };
    } else {
      // Something else happened
      console.error("Unexpected error:", error.message);
      return { error: "An unexpected error occurred" };
    }
  }
};
